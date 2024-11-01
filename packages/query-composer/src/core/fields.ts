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
  expressionIsCalculation,
  FieldDef,
  isJoined,
  PipeSegment,
  Segment,
  SourceDef,
} from '@malloydata/malloy';
import {maybeQuoteIdentifier, unquoteIdentifier} from './utils';

/**
 * Pre-defined types for new measures.
 */

export type MeasureType =
  | 'count'
  | 'count_distinct'
  | 'max'
  | 'min'
  | 'avg'
  | 'sum'
  | 'percent'
  | 'custom';

/**
 * Generates a new measure string based on a pre-defined type, and
 * a field name, if needed.
 *
 * @param measureType One of the pre-defined measure values
 * @param fieldName Name of the field to incorporate
 * @returns New measure string or undefined if measureType is "custom"
 */
export function generateMeasure(
  measureType: MeasureType,
  fieldName: string
): string | undefined {
  const quotedFieldName = maybeQuoteIdentifier(fieldName);
  switch (measureType) {
    case 'count_distinct':
      return `count(${quotedFieldName})`;
    case 'avg':
    case 'sum':
      return `${quotedFieldName}.${measureType}()`;
    case 'min':
    case 'max':
      return `${measureType}(${quotedFieldName})`;
    case 'percent':
      return `100 * ${quotedFieldName} / all(${quotedFieldName})`;
  }
  return undefined;
}

/**
 * Pre-defined types for new calculations.
 */
export type CalculateType =
  | 'avg_moving'
  | 'first_value'
  | 'lag'
  | 'last_value'
  | 'lead'
  | 'max_cumulative'
  | 'max_window'
  | 'min_cumulative'
  | 'min_window'
  | 'rank'
  | 'row_number'
  | 'sum_cumulative'
  | 'sum_moving'
  | 'sum_window'
  | 'custom';

/**
 * Generates a new calculate string based on a pre-defined type, and
 * a field name, if needed.
 *
 * @param measureType One of the pre-defined measure values
 * @param fieldName Name of the field to incorporate
 * @returns New measure string or undefined if measureType is "custom"
 */
export function generateCalculate(
  calculateType: CalculateType,
  fieldName: string
): string | undefined {
  const quotedFieldName = maybeQuoteIdentifier(fieldName);
  switch (calculateType) {
    case 'row_number':
    case 'rank':
      return `${calculateType}()`;
    case 'first_value':
    case 'last_value':
    case 'max_cumulative':
    case 'max_window':
    case 'min_window':
    case 'sum_cumulative':
    case 'sum_window':
      return `${calculateType}(${quotedFieldName})`;
    // TODO(whscullin: handle offset)
    case 'lag':
    case 'lead':
      return `${calculateType}(${quotedFieldName})`;
    // TODO(whscullin: handle preceding, following)
    case 'avg_moving':
    case 'sum_moving':
  }
  return undefined;
}

function findField(
  source: SourceDef,
  identifier: string
): FieldDef | undefined {
  const modifySourceForStage = (
    stage: PipeSegment,
    source: SourceDef
  ): SourceDef => Segment.nextStructDef(source, stage);

  const _findField = (
    fields: FieldDef[],
    parts: string[]
  ): FieldDef | undefined => {
    const field = fields.find(field => (field.as || field.name) === parts[0]);
    if (field) {
      if (parts.length > 1) {
        if (isJoined(field)) {
          return _findField(field.fields, parts.slice(1));
        } else if (field.type === 'turtle') {
          let turtleSource = source;
          for (const stage of field.pipeline) {
            turtleSource = modifySourceForStage(stage, turtleSource);
          }
          return _findField(turtleSource.fields, parts.slice(1));
        } else {
          // path is too long
          return undefined;
        }
      } else {
        return field;
      }
    } else {
      // not found
      return undefined;
    }
  };
  const parts = unquoteIdentifier(identifier).split('.');
  return _findField(source.fields, parts);
}

const MEASURE_COUNT = /^count\(\)$/;
const MEASURE_COUNT_DISTINCT = /^count\((.*)\)$/;
const MEASURE_AVG = /^(.*)\.avg\(\)$/;
const MEASURE_SUM = /^(.*)\.sum\(\)$/;
const MEASURE_MIN = /^min\((.*)\)/;
const MEASURE_MAX = /^max\((.*)\)/;
const MEASURE_PERCENT = /^100 \* (.*) \/ all\((.*)\)$/;

export function degenerateMeasure(
  source: SourceDef,
  measure: string
): {
  measureType: MeasureType;
  path: string;
  field: FieldDef | undefined;
} {
  let parts: RegExpExecArray | null;

  parts = MEASURE_COUNT.exec(measure);
  if (parts) {
    return {
      measureType: 'count',
      path: '',
      field: undefined,
    };
  }
  parts = MEASURE_COUNT_DISTINCT.exec(measure);
  if (parts) {
    return {
      measureType: 'count_distinct',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_AVG.exec(measure);
  if (parts) {
    return {
      measureType: 'avg',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_SUM.exec(measure);
  if (parts) {
    return {
      measureType: 'sum',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_MIN.exec(measure);
  if (parts) {
    return {
      measureType: 'min',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_MAX.exec(measure);
  if (parts) {
    return {
      measureType: 'max',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_PERCENT.exec(measure);
  if (parts && parts[1] === parts[2]) {
    return {
      measureType: 'percent',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  return {
    measureType: 'custom',
    path: '',
    field: undefined,
  };
}

const CALCULATE_ROW_NUMBER = /^row_number\(\)$/;
const CALCULATE_RANK = /^rank\(\)$/;
const CALCULATE_FIRST_VALUE = /^first_value\((.*)\)$/;
const CALCULATE_LAST_VALUE = /^last_value\((.*)\)$/;
const CALCULATE_MAX_CUMULATIVE = /^max_cumulative\((.*)\)$/;
const CALCULATE_MAX_WINDOW = /^max_window\((.*)\)$/;
const CALCULATE_MIN_WINDOW = /^min_window\((.*)\)$/;
const CALCULATE_SUM_CUMULATIVE = /^sum_cumulative\((.*)\)$/;
const CALCULATE_SUM_WINDOW = /^sum_window\((.*)\)$/;
const CALCULATE_LAG = /^lag\((.*)\)$/;
const CALCULATE_LEAD = /^lead\((.*)\)$/;
// const CALCULATE_AVG_MOVING = /^avg_moving\((.*)\)$/;
// const CALCULATE_SUM_MOVING = /^'sum_moving\((.*)\)$/;

export function degenerateCalculate(
  source: SourceDef,
  measure: string
): {
  calculateType: CalculateType;
  path: string;
  field: FieldDef | undefined;
} {
  let parts: RegExpExecArray | null;

  parts = CALCULATE_ROW_NUMBER.exec(measure);
  if (parts) {
    return {
      calculateType: 'row_number',
      path: '',
      field: undefined,
    };
  }
  parts = CALCULATE_RANK.exec(measure);
  if (parts) {
    return {
      calculateType: 'rank',
      path: '',
      field: undefined,
    };
  }
  parts = CALCULATE_FIRST_VALUE.exec(measure);
  if (parts) {
    return {
      calculateType: 'row_number',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = CALCULATE_LAST_VALUE.exec(measure);
  if (parts) {
    return {
      calculateType: 'last_value',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = CALCULATE_MAX_CUMULATIVE.exec(measure);
  if (parts) {
    return {
      calculateType: 'max_cumulative',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = CALCULATE_MAX_WINDOW.exec(measure);
  if (parts) {
    return {
      calculateType: 'max_window',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = CALCULATE_MIN_WINDOW.exec(measure);
  if (parts) {
    return {
      calculateType: 'min_window',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = CALCULATE_SUM_CUMULATIVE.exec(measure);
  if (parts) {
    return {
      calculateType: 'sum_cumulative',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = CALCULATE_SUM_WINDOW.exec(measure);
  if (parts) {
    return {
      calculateType: 'sum_window',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = CALCULATE_LAG.exec(measure);
  if (parts) {
    return {
      calculateType: 'lag',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = CALCULATE_LEAD.exec(measure);
  if (parts) {
    return {
      calculateType: 'lead',
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  return {
    calculateType: 'custom',
    path: '',
    field: undefined,
  };
}

export function sortFieldOrder(field: FieldDef): 0 | 1 | 2 | 3 {
  if (isJoined(field)) {
    return 3;
  } else if (field.type === 'turtle') {
    return 2;
  } else if (expressionIsCalculation(field.expressionType)) {
    return 1;
  } else {
    return 0;
  }
}

export function sortFields(fields: FieldDef[]): FieldDef[] {
  return fields.sort((a, b) => {
    const orderA = sortFieldOrder(a);
    const orderB = sortFieldOrder(b);

    return orderA === orderB ? a.name.localeCompare(b.name) : orderB - orderA;
  });
}

export type FlatField = {field: FieldDef; path: string};

export function sortFlatFields(
  fields: {field: FieldDef; path: string}[]
): FlatField[] {
  return fields.sort((a, b) => {
    const orderA = sortFieldOrder(a.field);
    const orderB = sortFieldOrder(b.field);

    return orderA === orderB
      ? a.field.name.localeCompare(b.field.name)
      : orderB - orderA;
  });
}
