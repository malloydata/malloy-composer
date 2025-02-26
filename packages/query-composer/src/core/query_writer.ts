/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  AtomicFieldDef,
  expressionIsCalculation,
  FieldDef,
  FilterCondition,
  isJoined,
  isLeafAtomic,
  Parameter,
  PipeSegment,
  QueryFieldDef,
  SourceDef,
  TurtleDef,
} from '@malloydata/malloy';
import uniq from 'lodash/uniq';
import {
  dottify,
  FilteredField,
  getFields,
  isFilteredField,
  isRenamedField,
  SourceUtils,
} from './source_utils';
import {
  annotationToTaglines,
  computeKind,
  computeProperty,
  snakeToTitle,
} from '../utils';
import {
  OrderByField,
  QuerySummary,
  QuerySummaryItem,
  QuerySummaryItemDataStyle,
  QuerySummaryItemFilter,
  QuerySummaryParameter,
  StageSummary,
} from '../types';
import {IndexSegment, QuerySegment} from '@malloydata/malloy/dist/model';
import {maybeQuoteIdentifier} from './utils';
import {hackyTerribleStringToFilter} from './filters';
import {codeFromExpr} from './expr';
import {
  ATOMIC_RENDERERS,
  QUERY_RENDERERS,
  rendererFromAnnotation,
} from './renderer';

export class QueryWriter extends SourceUtils {
  constructor(
    private readonly query: TurtleDef,
    source: SourceDef | undefined,
    private sourceArguments: Record<string, Parameter>
  ) {
    super(source);
  }

  getQueryStringForMarkdown(modelPath: string | undefined): string {
    const malloy = this.getMalloyString('run', this.query.name);
    return `<!-- malloy-query
    name="${snakeToTitle(this.query.name)}"
    description="Add a description here."
    model="${modelPath || ''}"
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
    stage: QuerySegment | IndexSegment,
    field: QueryFieldDef,
    source: SourceDef,
    indent: string
  ):
    | {
        property: string;
        malloy: Fragment[];
        tagLines?: string[];
      }
    | undefined {
    try {
      let tagLines: string[] | undefined;
      if (field.annotation) {
        const {blockNotes, notes} = field.annotation;
        const directOnly = {blockNotes, notes};
        if (field.type === 'turtle') {
          tagLines = annotationToTaglines(field.annotation).map(tagLine =>
            tagLine.replace(/\n$/, '')
          );
        } else {
          tagLines = annotationToTaglines(directOnly).map(tagLine =>
            tagLine.replace(/\n$/, '')
          );
        }
      }
      tagLines = uniq(tagLines);

      if (field.type === 'fieldref') {
        const fieldDef = this.getField(source, dottify(field.path));
        if (isJoined(fieldDef)) {
          throw new Error("Don't know how to deal with this");
        }
        const property = computeProperty(stage, fieldDef);
        const malloy: Fragment[] = [];
        malloy.push(maybeQuoteIdentifier(dottify(field.path)));
        return {
          tagLines,
          property,
          malloy,
        };
      } else if (isRenamedField(field)) {
        const property = computeProperty(stage, field);
        const malloy: Fragment[] = [
          `${maybeQuoteIdentifier(field.as || field.name)} is ${dottify(
            field.e.path
          )}`,
        ];
        return {
          tagLines,
          property,
          malloy,
        };
      } else if (isFilteredField(field)) {
        const fieldDef = this.getField(source, dottify(field.e.kids.e.path));
        if (isJoined(fieldDef)) {
          throw new Error("Don't know how to deal with this");
        }
        const property = computeProperty(stage, fieldDef);
        const malloy: Fragment[] = [];
        const newNameIs = `${maybeQuoteIdentifier(field.name)} is `;
        malloy.push(
          `${newNameIs}${maybeQuoteIdentifier(dottify(field.e.kids.e.path))}`
        );
        if (field.e.kids.filterList && field.e.kids.filterList.length > 0) {
          malloy.push(' {', NEWLINE, INDENT, 'where:');
          malloy.push(...this.getFiltersString(field.e.kids.filterList));
          malloy.push(OUTDENT, '}');
        }
        return {
          tagLines,
          property,
          malloy,
        };
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
        return {
          tagLines,
          property: 'nest',
          malloy,
        };
      } else {
        const property = computeProperty(stage, field);
        const malloy: Fragment[] = [
          `${maybeQuoteIdentifier(field.as || field.name)} is ${field.code}`,
        ];
        return {
          tagLines,
          property,
          malloy,
        };
      }
    } catch (error) {
      console.error(error);
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
    source: SourceDef,
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
    malloy.push(' {', NEWLINE, INDENT);
    if (stage.filterList && stage.filterList.length > 0) {
      const wheres = stage.filterList.filter(
        filter => !expressionIsCalculation(filter.expressionType)
      );
      const havings = stage.filterList.filter(filter =>
        expressionIsCalculation(filter.expressionType)
      );
      if (wheres.length) {
        malloy.push('where:', ...this.getFiltersString(wheres));
      }
      if (havings.length) {
        malloy.push('having:', ...this.getFiltersString(havings));
      }
    }
    let currentProperty: string | undefined;
    let currentMalloys: Fragment[][] = [];
    let currentTagLines: string[] = [];
    const fields = getFields(stage);
    for (const field of fields) {
      const info = this.codeInfoForField(stage, field, source, indent);
      if (info) {
        if (
          (currentProperty !== undefined &&
            info.property !== currentProperty) ||
          JSON.stringify(currentTagLines) !==
            JSON.stringify(info.tagLines ?? [])
        ) {
          currentTagLines.forEach(blockNote => malloy.push(blockNote, NEWLINE));
          if (currentProperty) {
            malloy.push(
              ...this.writeMalloyForPropertyValues(
                currentProperty,
                currentMalloys
              )
            );
          }
          currentTagLines = [];
          currentMalloys = [];
        }
        currentTagLines = info.tagLines ?? [];
        currentProperty = info.property;
        currentMalloys.push(info.malloy);
      }
    }
    if (currentProperty) {
      currentTagLines.forEach(tagLine => malloy.push(tagLine, NEWLINE));
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
    const source = this.getSource();
    if (source === undefined) return '';
    const malloy: Fragment[] = [];

    let stageSource = this.getSource();
    if (this.query.annotation) {
      const tagLines = annotationToTaglines(this.query.annotation).map(
        tagLine => tagLine.replace(/\n$/, '')
      );
      tagLines.forEach(tagLine => malloy.push(tagLine, NEWLINE));
    }

    const parameters: Fragment[] = [];
    if (this._source?.parameters) {
      const parameterStrings: string[] = [];
      for (const key in this._source.parameters) {
        const {value: defaultValue} = this._source.parameters[key];
        const value = this.sourceArguments[key]?.value;
        if (value !== undefined) {
          parameterStrings.push(`${key} is ${codeFromExpr(value)}`);
        } else if (!defaultValue) {
          parameterStrings.push(`${key} is null`);
        }
      }
      if (parameterStrings.length) {
        parameters.push('(');
        if (parameterStrings.length === 1) {
          parameters.push(parameterStrings[0]);
        } else if (parameterStrings.length > 1) {
          parameters.push(NEWLINE, INDENT);
          parameterStrings.forEach((parameter, idx) => {
            parameters.push(parameter);
            if (idx < parameterStrings.length - 1) {
              parameters.push(',', NEWLINE);
            }
          });
          parameters.push(NEWLINE, OUTDENT);
        }
        parameters.push(')');
      }
    }

    const initParts: Fragment[] = [];
    initParts.push(`${forUse}: `);
    if (forUse !== 'run' && name !== undefined) {
      initParts.push(maybeQuoteIdentifier(name), ...parameters, ' is');
    }
    if (forUse !== 'view') {
      const identifier = source.as || source.name;

      initParts.push(maybeQuoteIdentifier(identifier), ...parameters);
    }
    malloy.push(...initParts);
    stageSource = source;
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
    source: SourceDef,
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

  // TODO(whscullin) - segments with only window functions are not runnable
  canRun(): boolean {
    const canRunPipeline = (stages: PipeSegment[]) => {
      if (stages.length === 0) {
        return false;
      }
      for (const stage of stages) {
        const fields = getFields(stage);
        if (fields.length === 0) {
          return false;
        }
        for (const field of fields) {
          if (field.type === 'turtle') {
            if (!canRunPipeline(field.pipeline)) {
              return false;
            }
          }
        }
      }
      return true;
    };
    return canRunPipeline(this.query.pipeline);
  }

  getQuerySummary(): QuerySummary {
    let stageSource = this.getSource();
    const parameters: QuerySummaryParameter[] = [];
    if (this._source?.parameters) {
      for (const key in this._source.parameters) {
        const {name, type, value: defaultValue} = this._source.parameters[key];
        const value = this.sourceArguments[key]?.value;
        parameters.push({name, type, value, defaultValue});
      }
    }

    const stages = this.query.pipeline.map((stage, index) => {
      if (stageSource === undefined) {
        throw new Error('Invalid source');
      }
      const summary = this.getStageSummary(stage, stageSource);
      stageSource = this.modifySourceForStage(stage, stageSource);
      if (index === this.query.pipeline.length - 1) {
        const styleItems = this.stylesForField(this.query, undefined);
        if (styleItems) {
          summary.items.push(...styleItems);
        }
      }
      return summary;
    });
    const isRunnable = this.canRun();
    const name = this.query.as ?? this.query.name;
    return {name, parameters, stages, isRunnable};
  }

  private nameOf(field: QueryFieldDef) {
    if (field.type === 'fieldref') {
      return field.path[field.path.length - 1];
    } else {
      return field.as || field.name;
    }
  }

  private stylesForField(
    field: QueryFieldDef,
    fieldIndex: number | undefined
  ): QuerySummaryItemDataStyle[] {
    const result: QuerySummaryItemDataStyle[] = [];
    const renderer = rendererFromAnnotation(field.annotation);
    if (renderer) {
      result.push({
        type: 'data_style',
        renderer,
        canRemove: true,
        allowedRenderers:
          field.type === 'turtle' ? QUERY_RENDERERS : ATOMIC_RENDERERS,
        fieldIndex,
      });
    }
    return result;
  }

  getStageSummary(stage: PipeSegment, source: SourceDef): StageSummary {
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
        const annotations: string[] = annotationToTaglines(field.annotation);
        const fieldDef = this.fieldDefForQueryFieldDef(field, source);
        if (fieldDef.type === 'turtle') {
          let stageSource = source;
          for (const stage of fieldDef.pipeline) {
            stages.push(this.getStageSummary(stage, stageSource));
            stageSource = this.modifySourceForStage(stage, stageSource);
          }
        }
        if (field.type === 'fieldref') {
          if (isJoined(fieldDef)) {
            throw new Error("Don't know how to deal with this");
          }
          items.push({
            type: 'field',
            field: fieldDef,
            saveDefinition: undefined,
            fieldIndex,
            isRefined: false,
            isRenamed: false,
            path: dottify(field.path),
            kind: computeKind(fieldDef),
            property: computeProperty(stage, fieldDef),
            name: fieldDef.as || fieldDef.name,
            styles: this.stylesForField(field, fieldIndex),
            stages,
            annotations,
          });
          if (fieldDef.type !== 'turtle' && fieldDef.type !== 'error') {
            orderByFields.push({
              name: dottify(field.path),
              fieldIndex,
              type: fieldDef.type,
            });
          }
        } else if (isRenamedField(field)) {
          if (isJoined(fieldDef)) {
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
            styles: this.stylesForField(field, fieldIndex),
            isRefined: true,
            path: field.name,
            isRenamed: true,
            name: field.as || field.name,
            kind: computeKind(fieldDef),
            property: computeProperty(stage, fieldDef),
            stages,
            annotations,
          });
        } else if (isFilteredField(field)) {
          if (isJoined(fieldDef)) {
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
              field.e.kids.filterList || []
            ),
            styles: this.stylesForField(field, fieldIndex),
            isRefined: true,
            path: field.name,
            isRenamed: field.as !== undefined,
            name: field.as || field.name,
            kind: computeKind(fieldDef),
            property: computeProperty(stage, fieldDef),
            stages,
            annotations,
          });
        } else if (field.type === 'turtle') {
          items.push({
            type: 'nested_query_definition',
            name: field.as || field.name,
            fieldIndex,
            saveDefinition: source === this.getSource() ? field : undefined,
            stages: stages,
            styles: this.stylesForField(field, fieldIndex),
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
            property: computeProperty(stage, field),
            styles: this.stylesForField(field, fieldIndex),
          });
          // mtoy to will: This is stripping more things from order by
          if (field.type !== 'error' && isLeafAtomic(field)) {
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
          error: error instanceof Error ? error.message : `${error}`,
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
          if (theField.type === 'fieldref') {
            theField = this.getField(source, dottify(theField.path));
          }
          if (!isLeafAtomic(theField) || theField.type === 'error') {
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

  fanToDef(fan: FilteredField, def: AtomicFieldDef): FieldDef {
    const malloy: Fragment[] = [dottify(fan.e.kids.e.path)];
    if (fan.e.kids.filterList && fan.e.kids.filterList.length > 0) {
      malloy.push(' {', NEWLINE, INDENT, 'where:');
      malloy.push(...this.getFiltersString(fan.e.kids.filterList));
      malloy.push(OUTDENT, '}');
    }
    const code = codeFromFragments(malloy);

    // TODO this may not be necessary? Maybe can already just use it as code?
    return {
      ...def,
      name: this.nameOf(fan),
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
