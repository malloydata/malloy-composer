/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  FilterCondition,
  isJoined,
  isBasicAtomic,
  NamedQuery,
  Parameter,
  QueryFieldDef,
  SourceDef,
  TurtleDef,
} from '@malloydata/malloy';
import {QuerySummary, RendererName, SchemaField, StagePath} from '../types';
import {stagePathParent, stagePathPop} from './stage_path';
import {
  dottify,
  getFields,
  isFilteredField,
  isRenamedField,
  setFields,
  SourceUtils,
  undottify,
} from './source_utils';
import {QueryWriter} from './query_writer';
import {sortFieldOrder} from './fields';
import {stringToParameter} from './expr';
import {updateAnnotation} from './renderer';

const BLANK_QUERY: TurtleDef = {
  pipeline: [
    {
      type: 'reduce',
      queryFields: [],
    },
  ],
  name: 'new_query',
  type: 'turtle',
};

class NotAStageError extends Error {
  constructor(
    message: string,
    public readonly field: QueryFieldDef
  ) {
    super(message);
  }
}

export class QueryBuilder extends SourceUtils {
  private query: TurtleDef;
  private sourceArguments: Record<string, Parameter> = {};

  constructor(source: SourceDef | undefined) {
    super(source);
    this.query = structuredClone(BLANK_QUERY);
  }

  public getWriter(): QueryWriter {
    return new QueryWriter(this.query, this._source, this.sourceArguments);
  }

  // TODO(whscullin): Remove writer helper methods
  public getQuerySummary(): QuerySummary | undefined {
    if (this._source === undefined) return undefined;
    // eslint-disable-next-line no-console
    console.log(this.query);
    const writer = this.getWriter();
    return writer.getQuerySummary();
  }

  // TODO(whscullin): Remove writer helper methods
  public getQueryStringForModel(): string | undefined {
    if (this._source === undefined) return undefined;
    const writer = this.getWriter();
    return writer.getQueryStringForModel();
  }

  // TODO(whscullin): Remove writer helper methods
  public getQueryStringForSource(name: string): string | undefined {
    if (this._source === undefined) return undefined;
    const writer = this.getWriter();
    return writer.getQueryStringForSource(name);
  }

  // TODO(whscullin): Remove writer helper methods
  public getQueryStringForMarkdown(modelPath: string): string | undefined {
    if (this._source === undefined) return undefined;
    const writer = this.getWriter();
    return writer.getQueryStringForMarkdown(modelPath);
  }

  // TODO(whscullin): Remove writer helper methods
  public getQueryStringForNotebook(): string | undefined {
    if (this._source === undefined) return undefined;
    const writer = this.getWriter();
    return writer.getQueryStringForNotebook();
  }

  getName(): string {
    return this.query.name;
  }

  public isEmpty(): boolean {
    return JSON.stringify(this.query) === JSON.stringify(BLANK_QUERY);
  }

  public clearQuery(): void {
    this.query = structuredClone(BLANK_QUERY);
  }

  public setQuery(query: TurtleDef | NamedQuery): void {
    let tag = {};
    if (query.annotation) {
      tag = {annotation: structuredClone(query.annotation)};
    }
    if ('sourceArguments' in query) {
      this.sourceArguments = structuredClone(query.sourceArguments) || {};
    }
    this.query = {
      ...tag,
      pipeline: query.pipeline,
      name: query.as || query.name,
      type: 'turtle',
    };
  }

  private autoExpandStageAtPath(stagePath: StagePath) {
    try {
      return this.stageAtPath(stagePath);
    } catch (error) {
      if (error instanceof NotAStageError) {
        const {stagePath: newStagePath, fieldIndex} = stagePathPop(stagePath);
        if (newStagePath === undefined || fieldIndex === undefined) {
          throw new Error('Invalid stage');
        }
        const source = this.sourceForStageAtPath(newStagePath);
        if (source === undefined) {
          throw new Error('Invalid source');
        }
        const fieldDef = this.fieldDefForQueryFieldDef(error.field, source);
        if (fieldDef.type === 'turtle') {
          this.replaceWithDefinition(newStagePath, fieldIndex);
          return this.stageAtPath(stagePath);
        }
      }
      throw error;
    }
  }

  private stageAtPath(stagePath: StagePath) {
    let current = this.query.pipeline;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const {
        stagePath: newStagePath,
        stageIndex,
        fieldIndex,
      } = stagePathPop(stagePath);
      if (fieldIndex !== undefined) {
        const stage = current[stageIndex];
        const fields = getFields(stage);
        const newField = fields[fieldIndex];
        if (newField.type === 'fieldref' || newField.type !== 'turtle') {
          throw new NotAStageError(
            'Path does not refer to a stage correctly',
            newField
          );
        }
        current = newField.pipeline;
        if (newStagePath === undefined) {
          throw new Error('Invalid stage path');
        }
        stagePath = newStagePath;
      } else {
        return current[stageIndex];
      }
    }
  }

  private sourceForStageAtPath(stagePath: StagePath) {
    let currentPipeline = this.query.pipeline;
    let currentSource = this.getSource();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const {
        stagePath: newStagePath,
        stageIndex,
        fieldIndex,
      } = stagePathPop(stagePath);
      for (
        let currentStageIndex = 0;
        currentStageIndex < stageIndex;
        currentStageIndex++
      ) {
        currentSource =
          currentSource &&
          this.modifySourceForStage(
            currentPipeline[currentStageIndex],
            currentSource
          );
      }
      if (fieldIndex !== undefined) {
        const stage = currentPipeline[stageIndex];
        const fields = getFields(stage);
        const newField = fields[fieldIndex];
        if (newField.type === 'fieldref' || newField.type !== 'turtle') {
          throw new Error('Path does not refer to a stage correctly');
        }
        currentPipeline = newField.pipeline;
        if (newStagePath === undefined) {
          throw new Error('Invalid stage path');
        }
        stagePath = newStagePath;
      } else {
        return currentSource;
      }
    }
  }

  private getIndexToInsertNewField(
    stagePath: StagePath,
    queryFieldDef: QueryFieldDef
  ) {
    const stage = this.stageAtPath(stagePath);
    const stageSource = this.sourceForStageAtPath(stagePath);
    if (stageSource === undefined) {
      throw new Error(`Missing source for ${stagePath}`);
    }
    const fieldDef = this.fieldDefForQueryFieldDef(queryFieldDef, stageSource);
    const sortOrder = sortFieldOrder(fieldDef);
    const fields = getFields(stage);
    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
      const existingField = fields[fieldIndex];
      try {
        const existingFieldDef = this.fieldDefForQueryFieldDef(
          existingField,
          stageSource
        );
        const existingSortOrder = sortFieldOrder(existingFieldDef);
        if (existingSortOrder > sortOrder) {
          return fieldIndex;
        }
      } catch (error) {
        console.error(error);
      }
    }
    return fields.length;
  }

  private insertField(stagePath: StagePath, field: QueryFieldDef) {
    const stage = this.autoExpandStageAtPath(stagePath);
    const fields = getFields(stage);
    const insertIndex = this.getIndexToInsertNewField(stagePath, field);
    fields.splice(insertIndex, 0, field);
    setFields(stage, fields);
  }

  addField(stagePath: StagePath, fieldPath: string): void {
    this.insertField(stagePath, {
      type: 'fieldref',
      path: undottify(fieldPath),
    });
  }

  loadQuery(queryPath: string): void {
    const source = this.getSource();
    if (source === undefined) {
      throw new Error('Invalid source');
    }
    const definition = this.getField(source, queryPath);
    if (definition.type !== 'turtle') {
      throw new Error('Path does not refer to query.');
    }
    definition.pipeline.forEach((stage, stageIndex) => {
      if (this.query.pipeline[stageIndex] === undefined) {
        this.query.pipeline[stageIndex] = structuredClone(stage);
      } else {
        const existingStage = this.query.pipeline[stageIndex];
        if (
          !(
            existingStage.type === 'reduce' || existingStage.type === 'project'
          ) ||
          !(stage.type === 'reduce' || stage.type === 'project')
        ) {
          throw new Error('Cannot load query with non-reduce stages');
        }
        existingStage.type = stage.type;
        if (stage.filterList) {
          existingStage.filterList = (existingStage.filterList || []).concat(
            ...stage.filterList.filter(filter => {
              return !existingStage.filterList?.find(
                existingFilter => existingFilter.code === filter.code
              );
            })
          );
        }
        if (stage.limit) {
          existingStage.limit = stage.limit;
        }
        if (stage.orderBy) {
          existingStage.orderBy = stage.orderBy;
        }
        existingStage.queryFields = stage.queryFields
          .map(field => structuredClone(field))
          .concat(
            existingStage.queryFields.filter(field => {
              return !stage.queryFields.find(
                otherField => this.nameOf(otherField) === this.nameOf(field)
              );
            })
          );
      }
    });
    this.query.annotation = structuredClone(definition.annotation);
    this.sourceArguments = structuredClone(source.parameters) || {};
    this.query.name = definition.as || definition.name;
  }

  public replaceQuery(field: TurtleDef | NamedQuery): void {
    const stage = this.query.pipeline[0];
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    const filters =
      this.query.pipeline.length === 1 && stage.queryFields.length === 0
        ? stage.filterList || []
        : [];
    const pipeline = structuredClone(field.pipeline);
    pipeline[0].filterList = [...filters, ...(pipeline[0].filterList || [])];
    let tag = {};
    if (field.annotation) {
      tag = {annotation: structuredClone(field.annotation)};
    }
    this.query = {
      ...tag,
      pipeline,
      name: field.as || field.name,
      type: 'turtle',
    };
  }

  private nameOf(field: QueryFieldDef) {
    if (field.type === 'fieldref') {
      return field.path[field.path.length - 1];
    } else {
      return field.as || field.name;
    }
  }

  replaceSavedField(
    stagePath: StagePath,
    fieldIndex: number,
    name: string
  ): void {
    const stage = this.stageAtPath(stagePath);
    const fields = getFields(stage);
    fields.splice(fieldIndex, 1, {
      type: 'fieldref',
      path: undottify(name),
    });
    setFields(stage, fields);
  }

  removeField(stagePath: StagePath, fieldIndex: number): void {
    const stage = this.stageAtPath(stagePath);
    const fields = getFields(stage);
    if (
      (stage.type === 'reduce' || stage.type === 'project') &&
      stage.orderBy
    ) {
      const orderIndex = stage.orderBy.findIndex(order => {
        const field = fields[fieldIndex];
        return order.field === this.nameOf(field);
      });
      if (orderIndex !== -1) {
        stage.orderBy.splice(orderIndex, 1);
      }
    }
    fields.splice(fieldIndex, 1);
    setFields(stage, fields);
  }

  getFieldIndex(stagePath: StagePath, fieldPath: string): number | undefined {
    const stage = this.stageAtPath(stagePath);
    const fields = getFields(stage);
    const index = fields.findIndex(
      f => f.type === 'fieldref' && dottify(f.path) === fieldPath
    );
    return index === -1 ? undefined : index;
  }

  hasField(stagePath: StagePath, fieldPath: string): boolean {
    return this.getFieldIndex(stagePath, fieldPath) !== undefined;
  }

  reorderFields(stagePath: StagePath, order: number[]): void {
    const stage = this.stageAtPath(stagePath);
    const fields = getFields(stage);
    const newFields = order.map(index => fields[index]);
    setFields(stage, newFields);
  }

  toggleField(stagePath: StagePath, fieldPath: string): void {
    this.autoExpandStageAtPath(stagePath);
    const fieldIndex = this.getFieldIndex(stagePath, fieldPath);
    if (fieldIndex !== undefined) {
      this.removeField(stagePath, fieldIndex);
    } else {
      this.addField(stagePath, fieldPath);
    }
  }

  getQuery(): TurtleDef {
    return this.query;
  }

  getSourceArguments(): Record<string, Parameter> {
    return this.sourceArguments;
  }

  addFilter(stagePath: StagePath, filter: FilterCondition): void {
    const stage = this.autoExpandStageAtPath(stagePath);
    stage.filterList = [...(stage.filterList || []), filter];
  }

  editFilter(
    stagePath: StagePath,
    fieldIndex: number | undefined,
    filterIndex: number,
    filter: FilterCondition
  ): void {
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error('Stage must be reduce');
    }
    if (fieldIndex === undefined) {
      if (stage.filterList === undefined) {
        throw new Error('Stage has no filters.');
      }
      stage.filterList[filterIndex] = filter;
    } else {
      const field = stage.queryFields[fieldIndex];
      if (field.type === 'fieldref') {
        throw new Error('Cannot edit filter on field ref.');
      }
      if (field.type === 'turtle') {
        throw new Error('Cannot edit filter on turtle.');
      }
      if (!isFilteredField(field)) {
        throw new Error('Cannot edit filter on non-filtered field.');
      }
      if (field.e.kids.filterList === undefined) {
        throw new Error('Field has no filters');
      }
      field.e.kids.filterList[filterIndex] = filter;
    }
  }

  removeFilter(
    stagePath: StagePath,
    filterIndex: number,
    fieldIndex?: number
  ): void {
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    if (fieldIndex === undefined) {
      if (stage.filterList) {
        stage.filterList.splice(filterIndex, 1);
      }
    } else {
      const field = stage.queryFields[fieldIndex];
      if (field.type === 'fieldref') {
        throw new Error('Cannot edit filter on field ref.');
      }
      if (field.type === 'turtle') {
        throw new Error('Cannot edit filter on turtle.');
      }
      if (!isFilteredField(field)) {
        throw new Error('Cannot edit filter on non-filtered field.');
      }
      if (field.e.kids.filterList === undefined) {
        throw new Error('Field has no filters');
      }
      // TODO just changed this to "filterIndex" rather than "fieldIndex"...
      // seems like it must have been broken before? Unless somewhere I passed the
      // args in the wrong order...
      field.e.kids.filterList.splice(filterIndex, 1);
    }
  }

  onDrill(filters: FilterCondition[]) {
    const stage = this.stageAtPath({stageIndex: 0});
    const oldFilters = [...(stage.filterList ?? [])];
    this.clearQuery();
    for (const filter of [...oldFilters, ...filters]) {
      this.addFilter({stageIndex: 0}, filter);
    }
  }

  hasLimit(stagePath: StagePath): boolean {
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    return stage.limit !== undefined;
  }

  addLimit(
    stagePath: StagePath,
    limit: number,
    byField?: SchemaField,
    direction?: 'asc' | 'desc'
  ): void {
    const stage = this.autoExpandStageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    stage.limit = limit;
    if (byField) {
      stage.orderBy = [
        {
          field: byField.path,
          dir: direction,
        },
      ];
    }
  }

  addOrderBy(
    stagePath: StagePath,
    byFieldIndex: number,
    direction?: 'asc' | 'desc'
  ): void {
    const stage = this.autoExpandStageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    stage.orderBy = stage.orderBy || [];
    const field = stage.queryFields[byFieldIndex];
    const name = this.nameOf(field);
    stage.orderBy = stage.orderBy.filter(orderBy => orderBy.field !== name);
    stage.orderBy.push({
      field: name,
      dir: direction,
    });
  }

  editOrderBy(
    stagePath: StagePath,
    orderByIndex: number,
    direction: 'asc' | 'desc' | undefined
  ): void {
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    stage.orderBy = stage.orderBy || [];
    stage.orderBy[orderByIndex] = {
      field: stage.orderBy[orderByIndex].field,
      dir: direction,
    };
  }

  editParameter(name: string, value: string | undefined) {
    if (!this._source?.parameters) {
      return;
    }

    if (value === undefined) {
      delete this.sourceArguments[name];
      return;
    }

    const {type} = this._source.parameters[name];
    this.sourceArguments[name] = stringToParameter(name, value, type);
  }

  removeLimit(stagePath: StagePath): void {
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    stage.limit = undefined;
  }

  setRenderer(
    stagePath: StagePath,
    fieldIndex: number | undefined,
    renderer: RendererName | undefined
  ): void {
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    if (fieldIndex === undefined) {
      this.query.annotation = updateAnnotation(this.query.annotation, renderer);
    } else {
      const fields = getFields(stage);
      const field = fields[fieldIndex];
      field.annotation = updateAnnotation(field.annotation, renderer);
    }
  }

  addStage(stagePath: StagePath | undefined, fieldIndex?: number): void {
    let query: TurtleDef;
    if (stagePath !== undefined) {
      const parentStage = this.stageAtPath(stagePath);
      if (fieldIndex === undefined) {
        throw new Error('fieldIndex must be provided if stagePath is');
      }
      if (!(parentStage.type === 'reduce' || parentStage.type === 'project')) {
        throw new Error(`Unhandled stage type ${parentStage.type}`);
      }
      const source = this.sourceForStageAtPath(stagePath);
      if (source === undefined) {
        throw new Error('Invalid source');
      }
      const field = parentStage.queryFields[fieldIndex];
      const fieldDef = this.fieldDefForQueryFieldDef(field, source);
      if (fieldDef.type === 'turtle') {
        if (field.type === 'fieldref') {
          this.replaceWithDefinition(stagePath, fieldIndex);
          query = parentStage.queryFields[fieldIndex] as TurtleDef;
        } else if (field.type === 'turtle') {
          query = field;
        } else {
          throw new Error(`Unexpected field type ${field.type}`);
        }
      } else {
        throw new Error('Invalid field to add stage to.');
      }
    } else {
      query = this.query;
    }
    query.pipeline.push({
      type: 'reduce',
      queryFields: [],
    });
  }

  removeStage(stagePath: StagePath): void {
    const {
      stagePath: parentStagePath,
      fieldIndex,
      stageIndex,
    } = stagePathParent(stagePath);
    let query;
    if (parentStagePath !== undefined) {
      const parentStage = this.stageAtPath(parentStagePath);
      if (fieldIndex === undefined) {
        throw new Error('Invalid stage path');
      }
      if (!(parentStage.type === 'reduce' || parentStage.type === 'project')) {
        throw new Error(`Unhandled stage type ${parentStage.type}`);
      }
      const field = parentStage.queryFields[fieldIndex];
      if (typeof field !== 'string' && field.type === 'turtle') {
        query = field;
      } else {
        throw new Error('Invalid field to add stage to.');
      }
    } else {
      query = this.query;
    }
    query.pipeline.splice(stageIndex, 1);
    if (query.pipeline.length === 0) {
      query.pipeline.push({
        type: 'reduce',
        queryFields: [],
      });
    }
  }

  removeOrderBy(stagePath: StagePath, orderingIndex: number): void {
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    if (stage.orderBy) {
      stage.orderBy.splice(orderingIndex, 1);
    }
  }

  canRun() {
    return this.getWriter().canRun();
  }

  renameField(stagePath: StagePath, fieldIndex: number, as: string): void {
    const stage = this.stageAtPath(stagePath);
    const fields = getFields(stage);
    const field = fields[fieldIndex];
    const fieldName = this.nameOf(field);
    // Rename references in order bys
    if (
      (stage.type === 'reduce' || stage.type === 'project') &&
      stage.orderBy
    ) {
      stage.orderBy.forEach(order => {
        if (order.field === fieldName) {
          order.field = as;
        }
      });
    }

    if (field.type === 'fieldref') {
      const source = this.sourceForStageAtPath(stagePath);
      if (source === undefined) {
        throw new Error('Invalid source');
      }
      const lookup = this.getField(source, dottify(field.path));
      if (lookup.type === 'turtle') {
        fields[fieldIndex] = {
          ...lookup,
          name: as,
        };
        return;
      }
      if (isJoined(lookup)) {
        throw new Error('Invalid field');
      }
      const newField: QueryFieldDef = {
        type: lookup.type,
        name: as,
        e: {
          node: 'field',
          path: field.path,
        },
        expressionType: lookup.expressionType,
      };
      fields[fieldIndex] = newField;
    } else {
      field.as = as;
    }
  }

  addFilterToField(
    stagePath: StagePath,
    fieldIndex: number,
    filter: FilterCondition,
    as?: string
  ): void {
    if (as !== undefined) {
      this.renameField(stagePath, fieldIndex, as);
    }
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    const source = this.sourceForStageAtPath(stagePath);
    if (source === undefined) {
      throw new Error('Invalid source');
    }
    const field = stage.queryFields[fieldIndex];
    if (field.type === 'fieldref') {
      const def = this.getField(source, dottify(field.path));
      if (def.type === 'turtle' || isJoined(def)) {
        throw new Error('Invalid field');
      }
      stage.queryFields[fieldIndex] = {
        type: def.type,
        name: as || this.nameOf(field),
        e: {
          node: 'filteredExpr',
          kids: {
            filterList: [filter],
            e: {
              node: 'field',
              path: field.path,
            },
          },
        },

        as,
        expressionType: def.expressionType,
      };
    } else if (isFilteredField(field)) {
      field.e.kids.filterList = [...(field.e.kids.filterList || []), filter];
    } else if (isRenamedField(field)) {
      if (!isBasicAtomic(field)) {
        throw new Error('Invalid field');
      }
      stage.queryFields[fieldIndex] = {
        type: field.type,
        name: as || this.nameOf(field),
        e: {
          node: 'filteredExpr',
          kids: {
            filterList: [filter],
            e: field.e,
          },
        },
        as,
        expressionType: field.expressionType,
      };
    }
  }

  addNewNestedQuery(stagePath: StagePath, name: string): void {
    const newNestedQuery: QueryFieldDef = {
      name,
      type: 'turtle',
      pipeline: [{type: 'reduce', queryFields: []}],
    };
    this.insertField(stagePath, newNestedQuery);
  }

  addNewField(stagePath: StagePath, definition: QueryFieldDef): void {
    this.insertField(stagePath, definition);
  }

  editFieldDefinition(
    stagePath: StagePath,
    fieldIndex: number,
    definition: QueryFieldDef
  ): void {
    const stage = this.stageAtPath(stagePath);
    const fields = getFields(stage);
    fields[fieldIndex] = definition;
  }

  replaceWithDefinition(
    stagePath: StagePath,
    fieldIndex: number,
    sourceDef?: SourceDef
  ): void {
    sourceDef ??= this._source;
    if (!sourceDef) {
      return;
    }
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    const field = stage.queryFields[fieldIndex];
    if (field.type !== 'fieldref') {
      throw new Error("Don't deal with this yet");
    }
    const definition = sourceDef.fields.find(
      def => (def.as || def.name) === dottify(field.path)
    );
    // TODO handle case where definition is too complex...
    if (definition === undefined) {
      throw new Error('Field is not defined..');
    }
    if (
      definition.type === 'table' ||
      definition.type === 'sql_select' ||
      definition.type === 'query_source' ||
      definition.type === 'composite'
    ) {
      throw new Error(`Unhandled definition type: ${definition.type}`);
    }
    stage.queryFields[fieldIndex] = structuredClone(definition);
  }

  setName(name: string): void {
    this.query.name = name;
  }
}
