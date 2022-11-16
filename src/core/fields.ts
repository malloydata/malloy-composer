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

import { FieldDef } from "@malloydata/malloy";
import { quoteIdentifier } from "../app/utils";

/**
 * Pre-defined types for new measures.
 */

export type MeasureType =
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
