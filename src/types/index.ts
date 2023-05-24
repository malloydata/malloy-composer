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
  FieldDef,
  ModelDef,
  QueryFieldDef,
  StructDef,
} from "@malloydata/malloy";
import { DataStyles } from "@malloydata/render";

export interface AppListing {
  path: string;
  id: string;
}

export type ComposerConfig =
  | {
      apps: AppListing[];
      readme?: string;
    }
  | {
      readme?: string | undefined;
      apps: [
        {
          path: string;
          id: undefined;
        }
      ];
    };

export interface SourceConfig {
  title: string;
  sourceName: string;
  description: string;
}

export interface RemoteTable {
  name: string;
  url: string;
}
export interface ModelConfig {
  id: string;
  path: string;
  tables: Array<string | RemoteTable>;
  sources?: SourceConfig[];
}

export interface AppConfig {
  readme?: string;
  linkedReadmes?: string[];
  title?: string;
  models?: ModelConfig[];
}

export interface ModelInfo {
  id: string;
  model: ModelDef;
  path: string;
  styles: DataStyles;
  sources: {
    title: string;
    sourceName: string;
    description: string;
  }[];
}

export interface AppInfo {
  readme: string;
  linkedReadmes: string[];
  title?: string;
  models: ModelInfo[];
}

export interface SchemaFieldMeasure {
  name: string;
  path: string;
  type: "string" | "number" | "boolean" | "date" | "timestamp";
  kind: "measure";
}

export interface SchemaFieldDimension {
  name: string;
  path: string;
  type: "string" | "number" | "boolean" | "date" | "timestamp";
  kind: "dimension";
}

export interface SchemaFieldQuery {
  name: string;
  path: string;
  type: "query";
  kind: "query";
}

export interface SchemaFieldSource {
  name: string;
  path: string;
  type: "source";
  kind: "source";
  fields: SchemaField[];
}

export type SchemaField =
  | SchemaFieldDimension
  | SchemaFieldMeasure
  | SchemaFieldQuery
  | SchemaFieldSource;

export type RendererName =
  | "table"
  | "dashboard"
  | "text"
  | "currency"
  | "image"
  | "time"
  | "json"
  | "single_value"
  | "list"
  | "list_detail"
  | "cartesian_chart"
  | "bar_chart"
  | "scatter_chart"
  | "line_chart"
  | "point_map"
  | "segment_map"
  | "shape_map"
  | "number"
  | "percent"
  | "boolean"
  | "sparkline"
  | "bytes"
  | "link"
  | "vega";

export interface Schema {
  fields: SchemaField[];
}

export type QuerySummaryItemField =
  | QuerySummaryItemFieldScalar
  | QuerySummaryItemFieldQuery;

export interface QuerySummaryItemFieldScalar {
  type: "field";
  field: FieldDef;
  isRefined: boolean;
  isRenamed: boolean;
  saveDefinition: FieldDef | undefined;
  fieldIndex: number;
  kind: "dimension" | "measure";
  name: string;
  path: string;
  filters?: QuerySummaryItemFilter[];
  styles?: QuerySummaryItemDataStyle[];
}

export interface QuerySummaryItemFieldQuery {
  type: "field";
  field: FieldDef;
  isRefined: boolean;
  isRenamed: boolean;
  saveDefinition: FieldDef | undefined;
  fieldIndex: number;
  kind: "query";
  name: string;
  path: string;
  filters?: QuerySummaryItemFilter[];
  styles?: QuerySummaryItemDataStyle[];
  stages: StageSummary[];
}

export interface QuerySummaryItemNestedQueryDefinition {
  type: "nested_query_definition";
  name: string;
  fieldIndex: number;
  stages: StageSummary[];
  saveDefinition: FieldDef | undefined;
  styles?: QuerySummaryItemDataStyle[];
}

export interface QuerySummaryItemFieldDefinition {
  type: "field_definition";
  name: string;
  field: FieldDef;
  fieldIndex: number;
  source?: string;
  saveDefinition: FieldDef | undefined;
  kind: "dimension" | "measure";
  filters?: QuerySummaryItemFilter[];
  styles?: QuerySummaryItemDataStyle[];
}

export interface QuerySummaryItemFilter {
  type: "filter";
  filterSource: string;
  filterIndex: number;
  parsed?: Filter;
  field?: FieldDef;
  fieldPath?: string;
}

export interface QuerySummaryItemLimit {
  type: "limit";
  limit: number;
}

export interface QuerySummaryItemOrderBy {
  type: "order_by";
  byField: OrderByField;
  direction?: "asc" | "desc" | undefined;
  orderByIndex: number;
}

export interface QuerySummaryItemDataStyle {
  type: "data_style";
  renderer: RendererName;
  styleKey: string;
  canRemove: boolean;
  allowedRenderers: RendererName[];
}

export interface QuerySummaryItemErrorField {
  type: "error_field";
  field: QueryFieldDef;
  name: string;
  error: string;
  fieldIndex: number;
}

export type QuerySummaryItem =
  | QuerySummaryItemFilter
  | QuerySummaryItemField
  | QuerySummaryItemLimit
  | QuerySummaryItemOrderBy
  | QuerySummaryItemNestedQueryDefinition
  | QuerySummaryItemFieldDefinition
  | QuerySummaryItemDataStyle
  | QuerySummaryItemErrorField;

export interface StageSummary {
  items: QuerySummaryItem[];
  orderByFields: OrderByField[];
  inputSource: StructDef;
}

export interface QuerySummary {
  stages: StageSummary[];
}

export interface StagePath {
  stageIndex: number;
  parts?: { stageIndex: number; fieldIndex: number }[];
}

export function stagePathPush(
  stagePath: StagePath | undefined,
  part: { stageIndex: number; fieldIndex?: number }
): StagePath {
  if (stagePath === undefined) {
    return { stageIndex: part.stageIndex };
  }
  if (part.fieldIndex === undefined) {
    throw new Error("Invalid push to stage path");
  }
  return {
    stageIndex: part.stageIndex,
    parts: [
      ...(stagePath.parts || []),
      { stageIndex: stagePath.stageIndex, fieldIndex: part.fieldIndex },
    ],
  };
}

export function stagePathPop(stagePath: StagePath): {
  stagePath?: StagePath;
  stageIndex: number;
  fieldIndex?: number;
} {
  if (stagePath.parts && stagePath.parts.length > 0) {
    const part = stagePath.parts[0];
    return {
      stageIndex: part.stageIndex,
      fieldIndex: part.fieldIndex,
      stagePath: {
        stageIndex: stagePath.stageIndex,
        parts: stagePath.parts.slice(1),
      },
    };
  }
  return { stageIndex: stagePath.stageIndex };
}

export function stagePathParent(stagePath: StagePath): {
  stagePath?: StagePath;
  stageIndex: number;
  fieldIndex?: number;
} {
  if (stagePath.parts) {
    return {
      stagePath: {
        stageIndex: stagePath.parts[0].stageIndex,
        parts: stagePath.parts?.slice(1),
      },
      stageIndex: stagePath.stageIndex,
      fieldIndex: stagePath.parts[0].fieldIndex,
    };
  } else {
    return {
      stagePath: undefined,
      fieldIndex: undefined,
      stageIndex: stagePath.stageIndex,
    };
  }
}

export interface OrderByField {
  name: string;
  fieldIndex: number;
  type:
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "timestamp"
    | "json"
    | "unsupported";
}

export interface NumberEqualToFilter {
  type: "is_equal_to";
  values: number[];
}

export interface NumberNotEqualToFilter {
  type: "is_not_equal_to";
  values: number[];
}

export interface NumberGreaterThanFilter {
  type: "is_greater_than";
  value: number;
}

export interface NumberLessThanFilter {
  type: "is_less_than";
  value: number;
}

export interface NumberGreaterThanOrEqualToFilter {
  type: "is_greater_than_or_equal_to";
  value: number;
}

export interface NumberLessThanOrEqualToFilter {
  type: "is_less_than_or_equal_to";
  value: number;
}

export interface NumberBetweenFilter {
  type: "is_between";
  lowerBound: number;
  upperBound: number;
}

export interface BooleanTrueFilter {
  type: "is_true";
}

export interface BooleanFalseFilter {
  type: "is_false";
}

export interface BooleanTrueOrNullFilter {
  type: "is_true_or_null";
}

export interface BooleanFalseOrNullFilter {
  type: "is_false_or_null";
}

interface AnyIsNullFilter {
  type: "is_null";
}

interface AnyIsNotNullFilter {
  type: "is_not_null";
}

interface AnyCustomFilter {
  type: "custom";
  partial: string;
}

export interface StringEqualToFilter {
  type: "is_equal_to";
  values: string[];
}

export interface StringNotEqualToFilter {
  type: "is_not_equal_to";
  values: string[];
}

export interface StringStartsWithFilter {
  type: "starts_with";
  values: string[];
}

export interface StringNotStartsWithFilter {
  type: "does_not_start_with";
  values: string[];
}

export interface StringContainsFilter {
  type: "contains";
  values: string[];
}

export interface StringNotContainsFilter {
  type: "does_not_contain";
  values: string[];
}

export interface StringIsBlankFilter {
  type: "is_blank";
}

export interface StringIsNotBlankFilter {
  type: "is_not_blank";
}

export interface StringEndsWithFilter {
  type: "ends_with";
  values: string[];
}

export interface StringNotEndsWithFilter {
  type: "does_not_end_with";
  values: string[];
}

export type NumberIsNullFilter = AnyIsNullFilter;
export type NumberIsNotNullFilter = AnyIsNotNullFilter;
export type NumberCustomFilter = AnyCustomFilter;

export type BooleanIsNullFilter = AnyIsNullFilter;
export type BooleanIsNotNullFilter = AnyIsNotNullFilter;
export type BooleanCustomFilter = AnyCustomFilter;

export type StringIsNullFilter = AnyIsNullFilter;
export type StringIsNotNullFilter = AnyIsNotNullFilter;
export type StringCustomFilter = AnyCustomFilter;

export type NumberFilter =
  | NumberEqualToFilter
  | NumberNotEqualToFilter
  | NumberGreaterThanFilter
  | NumberLessThanFilter
  | NumberGreaterThanOrEqualToFilter
  | NumberLessThanOrEqualToFilter
  | NumberBetweenFilter
  | NumberIsNullFilter
  | NumberIsNotNullFilter
  | NumberCustomFilter;

export type BooleanFilter =
  | BooleanFalseFilter
  | BooleanTrueFilter
  | BooleanFalseOrNullFilter
  | BooleanTrueOrNullFilter
  | BooleanIsNullFilter
  | BooleanIsNotNullFilter
  | BooleanCustomFilter;

export type BooleanFilterType =
  | "is_true"
  | "is_false"
  | "is_null"
  | "is_not_null"
  | "is_true_or_null"
  | "is_false_or_null"
  | "custom";

export type StringFilter =
  | StringEqualToFilter
  | StringNotEqualToFilter
  | StringStartsWithFilter
  | StringNotStartsWithFilter
  | StringContainsFilter
  | StringNotContainsFilter
  | StringIsBlankFilter
  | StringIsNotBlankFilter
  | StringEndsWithFilter
  | StringNotEndsWithFilter
  | StringIsNullFilter
  | StringIsNotNullFilter
  | StringCustomFilter;

export type StringFilterType =
  | "is_equal_to"
  | "is_not_equal_to"
  | "starts_with"
  | "does_not_start_with"
  | "contains"
  | "does_not_contain"
  | "is_blank"
  | "is_not_blank"
  | "ends_with"
  | "does_not_end_with"
  | "is_null"
  | "is_not_null"
  | "custom";

export type NumberFilterType =
  | "is_equal_to"
  | "is_not_equal_to"
  | "is_greater_than"
  | "is_less_than"
  | "is_greater_than_or_equal_to"
  | "is_less_than_or_equal_to"
  | "is_between"
  | "is_null"
  | "is_not_null"
  | "custom";

export type InThePastUnit =
  | "years"
  | "quarters"
  | "months"
  | "weeks"
  | "days"
  | "hours"
  | "minutes"
  | "seconds";

export interface TimeIsInThePastFilter {
  type: "is_in_the_past";
  amount: number;
  unit: InThePastUnit;
}

export type TimeGranularity =
  | "year"
  | "quarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second";

export type ThisLastPeriod =
  | "year"
  | "quarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second";

export interface TimeIsLastFilter {
  type: "is_last";
  period: ThisLastPeriod;
}

export interface TimeIsThisFilter {
  type: "is_this";
  period: ThisLastPeriod;
}

export interface TimeIsOnFilter {
  type: "is_on";
  granularity:
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "day"
    | "hour"
    | "minute"
    | "second";
  date: Date;
}

export interface TimeIsAfterFilter {
  type: "is_after";
  granularity:
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "day"
    | "hour"
    | "minute"
    | "second";
  date: Date;
}

export interface TimeIsBeforeFilter {
  type: "is_before";
  granularity:
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "day"
    | "hour"
    | "minute"
    | "second";
  date: Date;
}

export interface TimeIsBetweenFilter {
  type: "is_between";
  granularity:
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "day"
    | "hour"
    | "minute"
    | "second";
  start: Date;
  end: Date;
}

export type TimeFilterType =
  | "is_in_the_past"
  | "is_last"
  | "is_this"
  | "is_on"
  | "is_after"
  | "is_before"
  | "is_between"
  | "is_null"
  | "is_not_null"
  | "custom";

export type TimeIsNullFilter = AnyIsNullFilter;
export type TimeIsNotNullFilter = AnyIsNotNullFilter;
export type TimeCustomFilter = AnyCustomFilter;

export type TimeFilter =
  | TimeIsInThePastFilter
  | TimeIsLastFilter
  | TimeIsThisFilter
  | TimeIsOnFilter
  | TimeIsAfterFilter
  | TimeIsBeforeFilter
  | TimeIsBetweenFilter
  | TimeIsNullFilter
  | TimeIsNotNullFilter
  | TimeCustomFilter;

export type Filter = StringFilter | NumberFilter | BooleanFilter | TimeFilter;
