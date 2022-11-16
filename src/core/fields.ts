/*
 * Copyright 2022 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import { FieldDef, StructDef } from "@malloydata/malloy";
import { quoteIdentifier } from "../app/utils";

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
  const quotedFieldName = quoteIdentifier(fieldName);
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

const unquoteIdentifier = (identifier: string) =>
  identifier
    .split(".")
    .map((part) => part.replace(/(^`|`$)/g, ""))
    .join(".");

function findField(
  source: StructDef,
  identifier: string
): FieldDef | undefined {
  const _findField = (fields: FieldDef[], parts: string[]) => {
    const field = fields.find((field) => field.name === parts[0]);
    if (field) {
      if (parts.length > 1) {
        if (field.type === "struct") {
          return _findField(field.fields, parts.slice(1));
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
  } else if (field.aggregate) {
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
