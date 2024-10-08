/*
 * Copyright 2023 Google LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  QuerySummary,
  QuerySummaryItem,
  StagePath,
  SchemaField,
  stagePathPop,
  StageSummary,
  OrderByField,
  QuerySummaryItemDataStyle,
  QuerySummaryItemFilter,
  stagePathParent,
} from '../types';
import {
  FieldDef,
  FilterCondition,
  PipeSegment,
  QueryFieldDef,
  Segment,
  StructDef,
  TurtleDef,
  FieldTypeDef,
  NamedQuery,
  expressionIsCalculation,
  ExpressionType,
} from '@malloydata/malloy';
import {DataStyles} from '@malloydata/render';
import {snakeToTitle} from '../utils';
import {hackyTerribleStringToFilter} from './filters';
import {maybeQuoteIdentifier} from './utils';

// TODO this is a hack to turn `string[]` paths (the new way dotted)
// paths are stored in the struct def back to the old way (just a
// dotted string), so that I can do less work right now.
function dottify(path: string[]) {
  return path.join('.');
}

function undottify(path: string) {
  return path.split('.');
}

function getFields(stage: PipeSegment): QueryFieldDef[] {
  if (stage.type === 'project' || stage.type === 'reduce') {
    return stage.queryFields;
  } else if (stage.type === 'index') {
    return stage.indexFields;
  } else {
    throw new Error(`Unexpected stage type ${stage.type}`);
  }
}

function setFields(stage: PipeSegment, fields: QueryFieldDef[]) {
  if (stage.type === 'project' || stage.type === 'reduce') {
    stage.queryFields = fields;
  } else if (stage.type === 'index') {
    // Unexported internal type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stage.indexFields = fields as any;
  } else {
    throw new Error(`Unexpected stage type ${stage.type}`);
  }
}

class SourceUtils {
  constructor(protected _source: StructDef | undefined) {}

  updateSource(source: StructDef) {
    this._source = source;
  }

  getSource() {
    return this._source;
  }

  protected fieldDefForQueryFieldDef(field: QueryFieldDef, source: StructDef) {
    if (field.type === 'fieldref') {
      return this.getField(source, dottify(field.path));
    } else {
      return field;
    }
  }

  protected getField(source: StructDef, fieldName: string): FieldDef {
    let parts = fieldName.split('.');
    let currentSource = source;
    while (parts.length > 1) {
      const part = parts[0];
      const found = currentSource.fields.find(f => (f.as || f.name) === part);
      if (found === undefined) {
        throw new Error(`Could not find (inner) ${part}`);
      }
      if (found.type === 'struct') {
        currentSource = found;
        parts = parts.slice(1);
      } else if (found.type === 'turtle') {
        let turtleSource = this.getSource();
        for (const stage of found.pipeline) {
          turtleSource = this.modifySourceForStage(stage, turtleSource);
        }
        currentSource = turtleSource;
        parts = parts.slice(1);
      } else {
        throw new Error('Inner segment in path is not a source');
      }
    }
    const found = currentSource.fields.find(f => (f.as || f.name) === parts[0]);
    if (found === undefined) {
      throw new Error(`Could not find ${parts[0]}`);
    }
    return found;
  }

  protected modifySourceForStage(
    stage: PipeSegment,
    source: StructDef
  ): StructDef {
    return Segment.nextStructDef(source, stage);
  }
}

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
  constructor(source: StructDef) {
    super(source);
    this.query = JSON.parse(JSON.stringify(BLANK_QUERY));
  }

  public getWriter(): QueryWriter {
    return new QueryWriter(this.query, this._source);
  }

  public getQuerySummary(dataStyles: DataStyles): QuerySummary | undefined {
    if (this._source === undefined) return undefined;
    // eslint-disable-next-line no-console
    console.log(this.query);
    const writer = this.getWriter();
    return writer.getQuerySummary(dataStyles);
  }

  public getQueryStringForModel(): string | undefined {
    if (this._source === undefined) return undefined;
    const writer = this.getWriter();
    return writer.getQueryStringForModel();
  }

  public getQueryStringForSource(name: string): string | undefined {
    if (this._source === undefined) return undefined;
    const writer = this.getWriter();
    return writer.getQueryStringForSource(name);
  }

  public getQueryStringForMarkdown(
    renderer: string | undefined,
    modelPath: string
  ): string | undefined {
    if (this._source === undefined) return undefined;
    const writer = this.getWriter();
    return writer.getQueryStringForMarkdown(renderer, modelPath);
  }

  public getQueryStringForNotebook(): string | undefined {
    if (this._source === undefined) return undefined;
    const writer = this.getWriter();
    return writer.getQueryStringForNotebook();
  }

  public getQueryStrings(
    renderer: string | undefined,
    modelPath: string
  ): {
    model: string;
    markdown: string;
    source: string;
    notebook: string;
    isRunnable: boolean;
  } {
    const writer = this.getWriter();
    return {
      model: writer.getQueryStringForModel(),
      source: writer.getQueryStringForSource(this.query.name),
      markdown: writer.getQueryStringForMarkdown(renderer, modelPath),
      notebook: writer.getQueryStringForNotebook(),
      isRunnable: this.canRun(),
    };
  }

  getName(): string {
    return this.query.name;
  }

  public isEmpty(): boolean {
    return JSON.stringify(this.query) === JSON.stringify(BLANK_QUERY);
  }

  public clearQuery(): void {
    this.query = JSON.parse(JSON.stringify(BLANK_QUERY));
  }

  public setQuery(query: NamedQuery): void {
    let tag = {};
    if (query.annotation) {
      tag = {annotation: JSON.parse(JSON.stringify(query.annotation))};
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
        const fieldDef = this.fieldDefForQueryFieldDef(
          error.field,
          this.sourceForStageAtPath(newStagePath)
        );
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
        currentSource = this.modifySourceForStage(
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

  private sortOrder(field: FieldDef) {
    if (field.type === 'struct') {
      return 3;
    } else if (field.type === 'turtle') {
      return 2;
    } else if (expressionIsCalculation(field.expressionType)) {
      return 1;
    } else {
      return 0;
    }
  }

  private getIndexToInsertNewField(
    stagePath: StagePath,
    queryFieldDef: QueryFieldDef
  ) {
    const stage = this.stageAtPath(stagePath);
    const stageSource = this.sourceForStageAtPath(stagePath);
    const fieldDef = this.fieldDefForQueryFieldDef(queryFieldDef, stageSource);
    const sortOrder = this.sortOrder(fieldDef);
    const fields = getFields(stage);
    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
      const existingField = fields[fieldIndex];
      try {
        const existingFieldDef = this.fieldDefForQueryFieldDef(
          existingField,
          stageSource
        );
        const existingSortOrder = this.sortOrder(existingFieldDef);
        if (existingSortOrder > sortOrder) {
          return fieldIndex;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
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
    const definition = this.getField(this.getSource(), queryPath);
    if (definition.type !== 'turtle') {
      throw new Error('Path does not refer to query.');
    }
    definition.pipeline.forEach((stage, stageIndex) => {
      if (this.query.pipeline[stageIndex] === undefined) {
        this.query.pipeline[stageIndex] = JSON.parse(JSON.stringify(stage));
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
        if (stage.by) {
          existingStage.by = {...stage.by};
          existingStage.orderBy = undefined;
        }
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
          existingStage.by = undefined;
        }
        existingStage.queryFields = stage.queryFields
          .map(field => JSON.parse(JSON.stringify(field)))
          .concat(
            existingStage.queryFields.filter(field => {
              return !stage.queryFields.find(
                otherField => this.nameOf(otherField) === this.nameOf(field)
              );
            })
          );
      }
    });
    this.query.name = definition.as || definition.name;
  }

  public replaceQuery(field: TurtleDef): void {
    const stage = this.query.pipeline[0];
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    const filters =
      this.query.pipeline.length === 1 && stage.queryFields.length === 0
        ? stage.filterList || []
        : [];
    const pipeline = JSON.parse(JSON.stringify(field.pipeline));
    pipeline[0].filterList = [...filters, ...(pipeline[0].filterList || [])];
    let tag = {};
    if (field.annotation) {
      tag = {annotation: JSON.parse(JSON.stringify(field.annotation))};
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
      if (field.e.filterList === undefined) {
        throw new Error('Field has no filters');
      }
      field.e.filterList[filterIndex] = filter;
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
      if (field.e.filterList === undefined) {
        throw new Error('Field has no filters');
      }
      // TODO just changed this to "filterIndex" rather than "fieldIndex"...
      // seems like it must have been broken before? Unless somewhere I passed the
      // args in the wrong order...
      field.e.filterList.splice(filterIndex, 1);
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

  removeLimit(stagePath: StagePath): void {
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    stage.limit = undefined;
  }

  addStage(stagePath: StagePath | undefined, fieldIndex?: number): void {
    let query;
    if (stagePath !== undefined) {
      const parentStage = this.stageAtPath(stagePath);
      if (fieldIndex === undefined) {
        throw new Error('fieldIndex must be provided if stagePath is');
      }
      if (!(parentStage.type === 'reduce' || parentStage.type === 'project')) {
        throw new Error(`Unhandled stage type ${parentStage.type}`);
      }
      const field = parentStage.queryFields[fieldIndex];
      const fieldDef = this.fieldDefForQueryFieldDef(
        field,
        this.sourceForStageAtPath(stagePath)
      );
      if (fieldDef.type === 'turtle') {
        if (field.type === 'fieldref') {
          this.replaceWithDefinition(stagePath, fieldIndex);
          query = parentStage.queryFields[fieldIndex];
        } else {
          query = field;
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
        fields: [],
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

  canRun(): boolean {
    // TODO check that all nested stages can run, too
    const stage = this.query.pipeline[0];
    const fields = getFields(stage);
    return fields.length > 0;
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
      const lookup = this.getField(source, dottify(field.path));
      if (lookup.type === 'turtle') {
        fields[fieldIndex] = {
          ...lookup,
          name: as,
        };
        return;
      }
      if (lookup.type === 'struct') {
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
    const field = stage.queryFields[fieldIndex];
    if (field.type === 'fieldref') {
      const def = this.getField(
        this.sourceForStageAtPath(stagePath),
        dottify(field.path)
      );
      if (def.type === 'turtle' || def.type === 'struct') {
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
      field.e.filterList = [...(field.e.filterList || []), filter];
    } else if (isRenamedField(field)) {
      if (field.type === 'turtle') {
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
    structDef?: StructDef
  ): void {
    if (structDef === undefined) {
      structDef = this._source;
    }
    const stage = this.stageAtPath(stagePath);
    if (!(stage.type === 'reduce' || stage.type === 'project')) {
      throw new Error(`Unhandled stage type ${stage.type}`);
    }
    const field = stage.queryFields[fieldIndex];
    if (field.type !== 'fieldref') {
      throw new Error("Don't deal with this yet");
    }
    const definition = structDef.fields.find(
      def => (def.as || def.name) === dottify(field.path)
    );
    // TODO handle case where definition is too complex...
    if (definition === undefined) {
      throw new Error('Field is not defined..');
    }
    stage.queryFields[fieldIndex] = JSON.parse(JSON.stringify(definition));
  }

  setName(name: string): void {
    this.query.name = name;
  }
}

export class QueryWriter extends SourceUtils {
  constructor(
    private readonly query: TurtleDef,
    source: StructDef
  ) {
    super(source);
  }

  getQueryStringForMarkdown(
    renderer: string | undefined,
    modelPath: string
  ): string {
    const malloy = this.getMalloyString('run', this.query.name);
    return `<!-- malloy-query
  name="${snakeToTitle(this.query.name)}"
  description="Add a description here." ${
    renderer
      ? `
  renderer="${renderer}"`
      : ''
  }
  model="${modelPath}"
-->
\`\`\`malloy
${malloy}
\`\`\``;
  }

  getQueryStringForSource(name: string): string {
    return this.getMalloyString('view', name);
  }

  getQueryStringForModel(): string {
    return this.getMalloyString('query', this.query.name);
  }

  getQueryStringForNotebook(): string {
    return this.getMalloyString('run');
  }

  private getFiltersString(filterList: FilterCondition[]): Fragment[] {
    const fragments = [];
    if (filterList.length === 1) {
      fragments.push(' ');
    } else {
      fragments.push(NEWLINE, INDENT);
    }
    for (let index = 0; index < filterList.length; index++) {
      const filter = filterList[index];
      fragments.push(filter.code);
      if (index !== filterList.length - 1) {
        fragments.push(',');
      }
      fragments.push(NEWLINE);
    }
    if (filterList.length > 1) {
      fragments.push(OUTDENT);
    }
    return fragments;
  }

  private codeInfoForField(
    stage: PipeSegment,
    field: QueryFieldDef,
    source: StructDef,
    indent: string
  ):
    | {
        property: string;
        malloy: Fragment[];
        blockNotes?: string[];
        notes?: string[];
      }
    | undefined {
    try {
      let blockNotes: string[] | undefined;
      let notes: string[] | undefined;
      if (field.annotation) {
        blockNotes = field.annotation.blockNotes.map(({text}) =>
          text.replace('\n', '')
        );
        notes = field.annotation.notes.map(({text}) => text.replace('\n', ''));
      }
      if (field.type === 'fieldref') {
        const fieldDef = this.getField(source, dottify(field.path));
        if (fieldDef.type === 'struct') {
          throw new Error("Don't know how to deal with this");
        }
        const property =
          fieldDef.type === 'turtle'
            ? 'nest'
            : expressionIsCalculation(fieldDef.expressionType)
            ? 'aggregate'
            : stage.type === 'project'
            ? 'select'
            : 'group_by';
        return {
          blockNotes,
          notes,
          property,
          malloy: [maybeQuoteIdentifier(dottify(field.path))],
        };
      } else if (isRenamedField(field)) {
        const property = expressionIsCalculation(field.expressionType)
          ? 'aggregate'
          : stage.type === 'project'
          ? 'select'
          : 'group_by';
        const malloy: Fragment[] = [
          `${maybeQuoteIdentifier(field.as || field.name)} is ${dottify(
            field.e.path
          )}`,
        ];
        return {property, malloy};
      } else if (isFilteredField(field)) {
        const fieldDef = this.getField(source, dottify(field.e.e.path));
        if (fieldDef.type === 'struct') {
          throw new Error("Don't know how to deal with this");
        }
        const property =
          fieldDef.type === 'turtle'
            ? 'nest'
            : expressionIsCalculation(fieldDef.expressionType)
            ? 'aggregate'
            : stage.type === 'project'
            ? 'select'
            : 'group_by';
        const malloy: Fragment[] = [];
        const newNameIs = `${maybeQuoteIdentifier(field.name)} is `;
        malloy.push(
          `${newNameIs}${maybeQuoteIdentifier(dottify(field.e.e.path))}`
        );
        if (field.e.filterList && field.e.filterList.length > 0) {
          const whereOrHaving =
            field.e.filterList[0].expressionType === 'aggregate'
              ? 'having:'
              : 'where:';
          malloy.push(' {', NEWLINE, INDENT, whereOrHaving);
          malloy.push(...this.getFiltersString(field.e.filterList || []));
          malloy.push(OUTDENT, '}');
        }
        return {blockNotes, property, malloy};
      } else if (field.type === 'turtle') {
        const malloy: Fragment[] = [];
        malloy.push(`${maybeQuoteIdentifier(field.as || field.name)} is`);
        let stageSource = source;
        let head = true;
        for (const stage of field.pipeline) {
          if (!head) {
            malloy.push('->');
          }
          malloy.push(
            ...this.getMalloyStringForStage(stage, stageSource, indent + '  ')
          );
          stageSource = this.modifySourceForStage(stage, stageSource);
          head = false;
        }
        return {blockNotes, property: 'nest', malloy};
      } else {
        const property = expressionIsCalculation(field.expressionType)
          ? 'aggregate'
          : stage.type === 'project'
          ? 'select'
          : 'group_by';
        const malloy: Fragment[] = [
          `${maybeQuoteIdentifier(field.as || field.name)} is ${field.code}`,
        ];
        return {blockNotes, property, malloy};
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
    return undefined;
  }

  private writeMalloyForPropertyValues(
    property: string,
    malloys: Fragment[][]
  ): Fragment[] {
    if (malloys.length === 0) {
      return [];
    } else if (malloys.length === 1) {
      return [property, ': ', ...malloys[0], NEWLINE];
    } else {
      return [
        property,
        ': ',
        NEWLINE,
        INDENT,
        ...malloys.flatMap(fragments => [...fragments, NEWLINE] as Fragment[]),
        OUTDENT,
      ];
    }
  }

  private getMalloyStringForStage(
    stage: PipeSegment,
    source: StructDef,
    indent = ''
  ): Fragment[] {
    if (
      stage.type !== 'index' &&
      stage.type !== 'project' &&
      stage.type !== 'reduce'
    ) {
      throw new Error(`Unsupported stage type ${stage.type}`);
    }
    const malloy: Fragment[] = [];
    // TODO(whscullin) Handle mixed filter types
    malloy.push(' {', NEWLINE, INDENT);
    if (stage.filterList && stage.filterList.length > 0) {
      const whereOrHaving =
        stage.filterList[0].expressionType === 'aggregate'
          ? 'having:'
          : 'where:';
      malloy.push(whereOrHaving, ...this.getFiltersString(stage.filterList));
    }
    let currentProperty: string | undefined;
    let currentMalloys: Fragment[][] = [];
    const fields = getFields(stage);
    for (const field of fields) {
      // TODO(whscullin) Handle notes
      const info = this.codeInfoForField(stage, field, source, indent);
      if (info) {
        if (
          currentProperty !== undefined &&
          info.property !== currentProperty
        ) {
          malloy.push(
            ...this.writeMalloyForPropertyValues(
              currentProperty,
              currentMalloys
            )
          );
          currentMalloys = [];
        }
        if (info.blockNotes) {
          info.blockNotes.forEach(blockNote => malloy.push(blockNote, NEWLINE));
        }
        currentProperty = info.property;
        currentMalloys.push(info.malloy);
      }
    }
    if (currentProperty) {
      malloy.push(
        ...this.writeMalloyForPropertyValues(currentProperty, currentMalloys)
      );
    }
    if (stage.limit) {
      malloy.push(`limit: ${stage.limit}`, NEWLINE);
    }
    if (stage.type !== 'index' && stage.orderBy && stage.orderBy.length > 0) {
      malloy.push('order_by: ');
      malloy.push(
        stage.orderBy
          .map(order => {
            let name: string | number;
            if (typeof order.field === 'string') {
              const names = order.field.split('.');
              name = names[names.length - 1];
            } else {
              name = order.field;
            }
            return `${
              typeof name === 'string' ? maybeQuoteIdentifier(name) : name
            }${order.dir ? ' ' + order.dir : ''}`;
          })
          .join(', '),
        NEWLINE
      );
    }
    malloy.push(OUTDENT, '}');
    return malloy;
  }

  private getMalloyString(
    forUse: 'view' | 'query' | 'run',
    name?: string
  ): string {
    if (this.getSource() === undefined) return '';
    const malloy: Fragment[] = [];
    let stageSource = this.getSource();
    if (this.query.annotation?.blockNotes) {
      malloy.push(...this.query.annotation.blockNotes.map(({text}) => text));
    }
    const initParts = [];
    initParts.push(`${forUse}:`);
    if (forUse !== 'run' && name !== undefined) {
      initParts.push(`${maybeQuoteIdentifier(name)} is`);
    }
    if (forUse !== 'view') {
      initParts.push(
        maybeQuoteIdentifier(this.getSource().as || this.getSource().name)
      );
    }
    malloy.push(initParts.join(' '));
    stageSource = this.getSource();
    for (
      let stageIndex = 0;
      stageIndex < this.query.pipeline.length;
      stageIndex++
    ) {
      const stage = this.query.pipeline[stageIndex];
      if (forUse !== 'view' || stageIndex > 0) {
        malloy.push(' ->');
      }
      malloy.push(...this.getMalloyStringForStage(stage, stageSource));
      stageSource = this.modifySourceForStage(stage, stageSource);
    }
    return codeFromFragments(malloy);
  }

  private getSummaryItemsForFilterList(
    source: StructDef,
    filterList: FilterCondition[]
  ): QuerySummaryItemFilter[] {
    const items: QuerySummaryItemFilter[] = [];
    for (
      let filterIndex = 0;
      filterIndex < filterList.length || 0;
      filterIndex++
    ) {
      const filter = filterList[filterIndex];
      const parsed = hackyTerribleStringToFilter(filter.code);
      items.push({
        type: 'filter',
        filterSource: filter.code,
        filterIndex,
        fieldPath: parsed && parsed.field,
        field: parsed && this.getField(source, parsed.field),
        parsed: parsed && parsed.filter,
      });
    }
    return items;
  }

  getQuerySummary(dataStyles: DataStyles): QuerySummary {
    const queryName = this.query.name;
    let stageSource = this.getSource();
    const stages = this.query.pipeline.map((stage, index) => {
      const summary = this.getStageSummary(stage, stageSource, dataStyles);
      stageSource = this.modifySourceForStage(stage, stageSource);
      if (index === this.query.pipeline.length - 1) {
        const styleItem = this.getStyleItemForName(
          queryName,
          'query',
          dataStyles
        );
        if (styleItem) {
          summary.items.push(styleItem);
        }
      }
      return summary;
    });
    return {stages};
  }

  private nameOf(field: QueryFieldDef) {
    if (field.type === 'fieldref') {
      return field.path[field.path.length - 1];
    } else {
      return field.as || field.name;
    }
  }

  getStyleItem(
    field: QueryFieldDef,
    source: StructDef,
    dataStyles: DataStyles
  ): QuerySummaryItemDataStyle | undefined {
    let name: string;
    let kind: 'dimension' | 'measure' | 'query' | 'source';
    if (field.type === 'fieldref') {
      name = dottify(field.path);
      const fieldDef = this.getField(source, name);
      if (fieldDef.type === 'struct') {
        throw new Error("Don't know how to deal with this");
      }
      kind =
        fieldDef.type === 'turtle'
          ? 'query'
          : expressionIsCalculation(fieldDef.expressionType)
          ? 'measure'
          : 'dimension';
    } else {
      kind =
        field.type === 'turtle'
          ? 'query'
          : expressionIsCalculation(field.expressionType)
          ? 'measure'
          : 'dimension';
    }
    return this.getStyleItemForName(name, kind, dataStyles);
  }

  private getStyleItemForName(
    name: string,
    kind: string,
    dataStyles: DataStyles
  ): QuerySummaryItemDataStyle | undefined {
    const dataStyle = dataStyles[name];
    if (dataStyle === undefined || dataStyle.renderer === undefined) {
      return undefined;
    } else {
      return {
        type: 'data_style',
        renderer: dataStyle.renderer,
        styleKey: name,
        canRemove: name in dataStyles,
        allowedRenderers:
          kind === 'query' || kind === 'source'
            ? [
                'table',
                'bar_chart',
                'dashboard',
                'json',
                'line_chart',
                'list',
                'list_detail',
                'point_map',
                'scatter_chart',
                'segment_map',
                'shape_map',
                'sparkline',
              ]
            : [
                'number',
                'boolean',
                'currency',
                'image',
                'url',
                'percent',
                'text',
                'time',
              ],
      };
    }
  }

  getStageSummary(
    stage: PipeSegment,
    source: StructDef,
    dataStyles: DataStyles
  ): StageSummary {
    if (
      stage.type !== 'index' &&
      stage.type !== 'project' &&
      stage.type !== 'reduce'
    ) {
      throw new Error(`Unsupported stage type ${stage.type}`);
    }
    const items: QuerySummaryItem[] = [];
    const orderByFields: OrderByField[] = [];
    if (stage.filterList) {
      items.push(
        ...this.getSummaryItemsForFilterList(source, stage.filterList)
      );
    }
    const fields = getFields(stage);
    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
      const field = fields[fieldIndex];
      try {
        const stages = [];
        const fieldDef = this.fieldDefForQueryFieldDef(field, source);
        if (fieldDef.type === 'turtle') {
          let stageSource = source;
          for (const stage of fieldDef.pipeline) {
            stages.push(this.getStageSummary(stage, stageSource, dataStyles));
            stageSource = this.modifySourceForStage(stage, stageSource);
          }
        }
        const styleItem = this.getStyleItem(field, source, dataStyles);
        const styleItems = styleItem ? [styleItem] : [];
        if (field.type === 'fieldref') {
          if (fieldDef.type === 'struct') {
            throw new Error("Don't know how to deal with this");
          }
          items.push({
            type: 'field',
            field: fieldDef,
            saveDefinition: undefined,
            fieldIndex,
            isRefined: false,
            styles: styleItems.filter(s => s.canRemove),
            isRenamed: false,
            path: dottify(field.path),
            kind:
              fieldDef.type === 'turtle'
                ? 'query'
                : expressionIsCalculation(fieldDef.expressionType)
                ? 'measure'
                : 'dimension',
            name: fieldDef.as || fieldDef.name,
            stages,
          });
          if (fieldDef.type !== 'turtle' && fieldDef.type !== 'error') {
            orderByFields.push({
              name: dottify(field.path),
              fieldIndex,
              type: fieldDef.type,
            });
          }
        } else if (isRenamedField(field)) {
          if (fieldDef.type === 'struct') {
            throw new Error("Don't know how to deal with this");
          }
          if (fieldDef.type !== 'turtle' && fieldDef.type !== 'error') {
            orderByFields.push({
              name: this.nameOf(field),
              fieldIndex,
              type: fieldDef.type,
            });
          }
          items.push({
            type: 'field',
            field: fieldDef,
            saveDefinition: undefined, // TODO
            fieldIndex,
            styles: styleItems.filter(s => s.canRemove),
            isRefined: true,
            path: field.name,
            isRenamed: true,
            name: field.as || field.name,
            kind:
              fieldDef.type === 'turtle'
                ? 'query'
                : expressionIsCalculation(fieldDef.expressionType)
                ? 'measure'
                : 'dimension',
            stages,
          });
        } else if (isFilteredField(field)) {
          if (fieldDef.type === 'struct') {
            throw new Error("Don't know how to deal with this");
          }
          if (fieldDef.type !== 'turtle' && fieldDef.type !== 'error') {
            orderByFields.push({
              name: this.nameOf(field),
              fieldIndex,
              type: fieldDef.type,
            });
          }
          items.push({
            type: 'field',
            field: fieldDef,
            saveDefinition:
              source === this.getSource() && fieldDef.type !== 'turtle'
                ? this.fanToDef(field, fieldDef)
                : undefined,
            fieldIndex,
            filters: this.getSummaryItemsForFilterList(
              source,
              field.e.filterList || []
            ),
            styles: styleItems.filter(s => s.canRemove),
            isRefined: true,
            path: field.name,
            isRenamed: field.as !== undefined,
            name: field.as || field.name,
            kind:
              fieldDef.type === 'turtle'
                ? 'query'
                : expressionIsCalculation(fieldDef.expressionType)
                ? 'measure'
                : 'dimension',
            stages,
          });
        } else if (field.type === 'turtle') {
          items.push({
            type: 'nested_query_definition',
            name: field.as || field.name,
            fieldIndex,
            saveDefinition: source === this.getSource() ? field : undefined,
            stages: stages,
            styles: styleItems,
          });
        } else {
          items.push({
            type: 'field_definition',
            name: field.as || field.name,
            fieldIndex,
            field,
            saveDefinition: source === this.getSource() ? field : undefined,
            source: field.code,
            kind: expressionIsCalculation(field.expressionType)
              ? 'measure'
              : 'dimension',
            styles: styleItems,
          });
          if (field.type !== 'error') {
            orderByFields.push({
              name: field.as || field.name,
              fieldIndex,
              type: field.type,
            });
          }
        }
      } catch (error) {
        items.push({
          type: 'error_field',
          field,
          name: this.nameOf(field),
          error: error.message,
          fieldIndex,
        });
      }
    }
    if (stage.limit) {
      items.push({type: 'limit', limit: stage.limit});
    }
    if (stage.type !== 'index' && stage.orderBy) {
      for (
        let orderByIndex = 0;
        orderByIndex < stage.orderBy.length;
        orderByIndex++
      ) {
        const order = stage.orderBy[orderByIndex];
        let byFieldIndex;
        if (typeof order.field === 'string') {
          byFieldIndex = stage.queryFields.findIndex(
            f => this.nameOf(f) === order.field
          );
        } else {
          byFieldIndex = order.field - 1;
        }
        const byFieldQueryDef = stage.queryFields[byFieldIndex];
        if (byFieldQueryDef !== undefined) {
          let theField;
          if (typeof byFieldQueryDef === 'string') {
            theField = this.getField(source, byFieldQueryDef);
          } else if (isFilteredField(byFieldQueryDef)) {
            theField = this.getField(source, this.nameOf(byFieldQueryDef));
          } else {
            theField = byFieldQueryDef;
          }
          if (theField.type === 'struct' || theField.type === 'turtle') {
            continue;
          }
          items.push({
            type: 'order_by',
            byField: {
              type: theField.type,
              fieldIndex: byFieldIndex,
              name: this.nameOf(theField),
            },
            direction: order.dir,
            orderByIndex,
          });
        }
      }
    }
    return {type: stage.type, items, orderByFields, inputSource: source};
  }

  fanToDef(fan: FilteredField, def: FieldTypeDef): FieldDef {
    const malloy: Fragment[] = [dottify(fan.e.e.path)];
    if (fan.e.filterList && fan.e.filterList.length > 0) {
      const whereOrHaving =
        fan.e.filterList[0].expressionType === 'aggregate'
          ? 'having:'
          : 'where:';
      malloy.push(' {', INDENT, whereOrHaving);
      malloy.push(...this.getFiltersString(fan.e.filterList || []));
      malloy.push(OUTDENT, '}');
    }
    const code = codeFromFragments(malloy);

    // TODO this may not be necessary? Maybe can already just use it as code?
    return {
      type: def.type,
      name: this.nameOf(fan),
      expressionType: def.expressionType,
      code,
    };
  }
}

const INDENT = Symbol('indent');
const NEWLINE = Symbol('newline');
const OUTDENT = Symbol('outdent');

type Fragment = string | typeof INDENT | typeof OUTDENT | typeof NEWLINE;

const TAB_WIDTH = 2;

function codeFromFragments(fragments: Fragment[]) {
  let code = '';
  let indent = 0;
  let isStartOfLine = true;
  for (const fragment of fragments) {
    if (fragment === NEWLINE) {
      code += '\n';
      isStartOfLine = true;
    } else if (fragment === OUTDENT) {
      indent--;
    } else if (fragment === INDENT) {
      indent++;
    } else {
      if (isStartOfLine) {
        code += ' '.repeat(indent * TAB_WIDTH);
        isStartOfLine = false;
      }
      code += fragment;
    }
  }
  return code;
}

type FilteredField = QueryFieldDef & {
  e: {
    type: 'filterExpression';
    filterList: FilterCondition[];
    e: {
      type: 'field';
      path: string[];
    };
  };
};

function isFilteredField(field: QueryFieldDef): field is FilteredField {
  if (field.type === 'fieldref' || field.type === 'turtle') {
    return false;
  }
  return field.e.node === 'filteredExpr' && field.e.kids.e.node === 'field';
}

type RenamedField = QueryFieldDef & {
  e: {
    node: 'field';
    path: string[];
  };
  expressionType?: ExpressionType;
};

function isRenamedField(field: QueryFieldDef): field is RenamedField {
  if (field.type === 'fieldref' || field.type === 'turtle') {
    return false;
  }
  return field.e.node === 'field';
}
