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
  PipeSegment,
  Segment,
  StructDef,
} from "@malloydata/malloy";
import { maybeQuoteIdentifier, unquoteIdentifier } from "./utils";

/**
 * Pre-defined types for new measures.
 */

export type MeasureType =
  | "count"
  | "count_distinct"
  | "max"
  | "min"
  | "avg"
  | "sum"
  | "percent"
  | "custom";

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
    case "count_distinct":
      return `count(distinct ${quotedFieldName})`;
    case "avg":
    case "sum":
      return `${quotedFieldName}.${measureType}()`;
    case "min":
    case "max":
      return `${measureType}(${quotedFieldName})`;
    case "percent":
      return `100 * ${quotedFieldName} / all(${quotedFieldName})`;
  }
  return;
}

function findField(
  source: StructDef,
  identifier: string
): FieldDef | undefined {
  const modifySourceForStage = (
    stage: PipeSegment,
    source: StructDef
  ): StructDef => Segment.nextStructDef(source, stage);

  const _findField = (fields: FieldDef[], parts: string[]) => {
    const field = fields.find((field) => (field.as || field.name) === parts[0]);
    if (field) {
      if (parts.length > 1) {
        if (field.type === "struct") {
          return _findField(field.fields, parts.slice(1));
        } else if (field.type === "turtle") {
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
  const parts = unquoteIdentifier(identifier).split(".");
  return _findField(source.fields, parts);
}

const MEASURE_COUNT = /^count\(\)$/;
const MEASURE_COUNT_DISTINCT = /^count\(distinct (.*)\)$/;
const MEASURE_AVG = /^(.*)\.avg\(\)$/;
const MEASURE_SUM = /^(.*)\.sum\(\)$/;
const MEASURE_MIN = /^min\((.*)\)/;
const MEASURE_MAX = /^max\((.*)\)/;
const MEASURE_PERCENT = /^100 \* (.*) \/ all\((.*)\)$/;

export function degenerateMeasure(
  source: StructDef,
  measure: string
): {
  measureType: MeasureType;
  path: string;
  field: FieldDef | undefined;
} {
  let parts: RegExpExecArray;

  parts = MEASURE_COUNT.exec(measure);
  if (parts) {
    return {
      measureType: "count",
      path: "",
      field: undefined,
    };
  }
  parts = MEASURE_COUNT_DISTINCT.exec(measure);
  if (parts) {
    return {
      measureType: "count_distinct",
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_AVG.exec(measure);
  if (parts) {
    return {
      measureType: "avg",
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_SUM.exec(measure);
  if (parts) {
    return {
      measureType: "sum",
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_MIN.exec(measure);
  if (parts) {
    return {
      measureType: "min",
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_MAX.exec(measure);
  if (parts) {
    return {
      measureType: "max",
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  parts = MEASURE_PERCENT.exec(measure);
  if (parts && parts[1] === parts[2]) {
    return {
      measureType: "percent",
      path: unquoteIdentifier(parts[1]),
      field: findField(source, parts[1]),
    };
  }
  return {
    measureType: "custom",
    path: "",
    field: undefined,
  };
}

export function sortFieldOrder(field: FieldDef): 0 | 1 | 2 | 3 {
  if (field.type === "struct") {
    return 3;
  } else if (field.type === "turtle") {
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

export type FlatField = { field: FieldDef; path: string };

export function sortFlatFields(
  fields: { field: FieldDef; path: string }[]
): FlatField[] {
  return fields.sort((a, b) => {
    const orderA = sortFieldOrder(a.field);
    const orderB = sortFieldOrder(b.field);

    return orderA === orderB
      ? a.field.name.localeCompare(b.field.name)
      : orderB - orderA;
  });
}
