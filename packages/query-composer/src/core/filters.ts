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
  BooleanFilter,
  BooleanFilterType,
  Filter,
  InThePastUnit,
  NumberFilter,
  NumberFilterType,
  StringFilter,
  StringFilterType,
  ThisLastPeriod,
  TimeFilter,
  TimeFilterType,
} from "../types";
import { maybeQuoteIdentifier, unquoteIdentifier } from "./utils";

function alternationOf(alternator: "|" | "&", values: string[]): string {
  if (values.length === 0) {
    throw new Error("Alternation must have some values");
  } else {
    return values.join(" " + alternator + " ");
  }
}

export function numberFilterToString(
  field: string,
  filter: NumberFilter
): string {
  const quotedField = maybeQuoteIdentifier(field);
  switch (filter.type) {
    case "is_equal_to": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} = ${alternationOf(
        "|",
        filter.values.map((n) => n.toString())
      )}`;
    }
    case "is_not_equal_to": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} != ${alternationOf(
        "&",
        filter.values.map((n) => n.toString())
      )}`;
    }
    case "is_between":
      return `${quotedField}: ${filter.lowerBound} to ${filter.upperBound}`;
    case "is_greater_than":
      return `${quotedField} > ${filter.value}`;
    case "is_less_than":
      return `${quotedField} < ${filter.value}`;
    case "is_greater_than_or_equal_to":
      return `${quotedField} >= ${filter.value}`;
    case "is_less_than_or_equal_to":
      return `${quotedField} <= ${filter.value}`;
    case "is_null":
      return `${quotedField} = null`;
    case "is_not_null":
      return `${quotedField} != null`;
    case "custom":
      return `${quotedField}: ${filter.partial}`;
  }
}

export function stringFilterToString(
  field: string,
  filter: StringFilter
): string {
  const quotedField = maybeQuoteIdentifier(field);
  switch (filter.type) {
    case "is_equal_to": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} = ${alternationOf(
        "|",
        filter.values.map(quoteString)
      )}`;
    }
    case "is_not_equal_to": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} != ${alternationOf(
        "&",
        filter.values.map(quoteString)
      )}`;
    }
    case "contains": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} ~ ${alternationOf(
        "|",
        filter.values
          .map(escapePercents)
          .map((s) => `%${s}%`)
          .map(quoteString)
      )}`;
    }
    case "does_not_contain": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} !~ ${alternationOf(
        "&",
        filter.values
          .map(escapePercents)
          .map((s) => `%${s}%`)
          .map(quoteString)
      )}`;
    }
    case "starts_with": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} ~ ${alternationOf(
        "|",
        filter.values
          .map(escapePercents)
          .map((s) => `${s}%`)
          .map(quoteString)
      )}`;
    }
    case "does_not_start_with": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} !~ ${alternationOf(
        "&",
        filter.values
          .map(escapePercents)
          .map((s) => `${s}%`)
          .map(quoteString)
      )}`;
    }
    case "ends_with": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} ~ ${alternationOf(
        "|",
        filter.values
          .map(escapePercents)
          .map((s) => `%${s}`)
          .map(quoteString)
      )}`;
    }
    case "does_not_end_with": {
      if (filter.values.length === 0) {
        return `true`;
      }
      return `${quotedField} !~ ${alternationOf(
        "&",
        filter.values
          .map(escapePercents)
          .map((s) => `%${s}`)
          .map(quoteString)
      )}`;
    }
    case "is_null":
      return `${quotedField} = null`;
    case "is_not_null":
      return `${quotedField} != null`;
    case "is_blank":
      return `${quotedField} = ''`;
    case "is_not_blank":
      return `${quotedField} != ''`;
    case "custom":
      return `${quotedField}: ${filter.partial}`;
  }
}

export function booleanFilterToString(
  field: string,
  filter: BooleanFilter
): string {
  const quotedField = maybeQuoteIdentifier(field);
  switch (filter.type) {
    case "is_false":
      return `not ${quotedField}`;
    case "is_true":
      return `${quotedField}`;
    case "is_true_or_null":
      return `${quotedField}: true | null`;
    case "is_false_or_null":
      return `${quotedField}: false | null`;
    case "is_null":
      return `${quotedField} = null`;
    case "is_not_null":
      return `${quotedField} != null`;
    case "custom":
      return `${quotedField}: ${filter.partial}`;
  }
}

export function timeFilterToString(field: string, filter: TimeFilter): string {
  const quotedField = maybeQuoteIdentifier(field);
  switch (filter.type) {
    case "is_in_the_past":
      return `${quotedField}: now - ${filter.amount} ${filter.unit} for ${filter.amount} ${filter.unit}`;
    case "is_last":
      return `${quotedField}.${filter.period} = now.${filter.period} - 1 ${filter.period}`;
    case "is_this":
      return `${quotedField}.${filter.period} = now.${filter.period}`;
    case "is_on": {
      return `${quotedField}.${filter.granularity} = ${timeToString(
        filter.date,
        filter.granularity
      )}`;
    }
    case "is_after": {
      return `${quotedField}.${filter.granularity} > ${timeToString(
        filter.date,
        filter.granularity
      )}`;
    }
    case "is_before": {
      return `${quotedField}.${filter.granularity} < ${timeToString(
        filter.date,
        filter.granularity
      )}`;
    }
    case "is_between": {
      return `${quotedField}.${filter.granularity}: ${timeToString(
        filter.start,
        filter.granularity
      )} to ${timeToString(filter.end, filter.granularity)}`;
    }
    case "is_null":
      return `${quotedField} = null`;
    case "is_not_null":
      return `${quotedField} != null`;
    case "custom":
      return `${quotedField}: ${filter.partial}`;
  }
}

function escapePercents(str: string) {
  return str.replace(/%/g, "%%");
}

function quoteString(str: string) {
  return `'${str.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

export function timeToString(
  time: Date,
  timeframe:
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "day"
    | "hour"
    | "minute"
    | "second"
): string {
  switch (timeframe) {
    case "year": {
      const year = digits(time.getUTCFullYear(), 4);
      return `@${year}`;
    }
    case "quarter": {
      const year = digits(time.getUTCFullYear(), 4);
      const quarter = Math.floor(time.getUTCMonth() / 3) + 1;
      return `@${year}-Q${quarter}`;
    }
    case "month": {
      const year = digits(time.getUTCFullYear(), 2);
      const month = digits(time.getUTCMonth() + 1, 2);
      return `@${year}-${month}`;
    }
    case "week": {
      const year = digits(time.getUTCFullYear(), 2);
      const month = digits(time.getUTCMonth() + 1, 2);
      const day = digits(time.getUTCDate(), 2);
      return `@WK${year}-${month}-${day}`;
    }
    case "day": {
      const year = digits(time.getUTCFullYear(), 2);
      const month = digits(time.getUTCMonth() + 1, 2);
      const day = digits(time.getUTCDate(), 2);
      return `@${year}-${month}-${day}`;
    }
    case "hour": {
      const year = digits(time.getUTCFullYear(), 2);
      const month = digits(time.getUTCMonth() + 1, 2);
      const day = digits(time.getUTCDate(), 2);
      const hour = digits(time.getUTCHours(), 2);
      return `@${year}-${month}-${day} ${hour}:00`;
    }
    case "minute": {
      const year = digits(time.getUTCFullYear(), 2);
      const month = digits(time.getUTCMonth() + 1, 2);
      const day = digits(time.getUTCDate(), 2);
      const hour = digits(time.getUTCHours(), 2);
      const minute = digits(time.getUTCMinutes(), 2);
      return `@${year}-${month}-${day} ${hour}:${minute}`;
    }
    case "second": {
      const year = digits(time.getUTCFullYear(), 2);
      const month = digits(time.getUTCMonth() + 1, 2);
      const day = digits(time.getUTCDate(), 2);
      const hour = digits(time.getUTCHours(), 2);
      const minute = digits(time.getUTCMinutes(), 2);
      const second = digits(time.getUTCSeconds(), 2);
      return `@${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
    default:
      throw new Error("Unknown timeframe.");
  }
}

function digits(value: number, digits: number) {
  return value.toString().padStart(digits, "0");
}

export function stringFilterChangeType(
  filter: StringFilter,
  type: StringFilterType
): StringFilter {
  switch (type) {
    case "is_equal_to":
    case "is_not_equal_to":
    case "starts_with":
    case "does_not_start_with":
    case "contains":
    case "does_not_contain":
    case "ends_with":
    case "does_not_end_with":
      return { type, values: "values" in filter ? filter.values : [] };
    case "is_blank":
    case "is_not_blank":
    case "is_null":
    case "is_not_null":
      return { type };
    case "custom":
      // TODO extract the partial and fill it in here
      return { type, partial: "" };
  }
}

export function numberFilterChangeType(
  filter: NumberFilter,
  type: NumberFilterType
): NumberFilter {
  switch (type) {
    case "is_equal_to":
    case "is_not_equal_to":
      return {
        type,
        values:
          "values" in filter
            ? filter.values
            : "value" in filter
            ? [filter.value]
            : "lowerBound" in filter
            ? [filter.lowerBound]
            : [],
      };
    case "is_greater_than":
    case "is_less_than":
    case "is_greater_than_or_equal_to":
    case "is_less_than_or_equal_to":
      return {
        type,
        value:
          "value" in filter
            ? filter.value
            : "values" in filter
            ? filter.values[0] || 0
            : 0,
      };
    case "is_between":
      return {
        type,
        lowerBound:
          "value" in filter
            ? filter.value
            : "values" in filter
            ? filter.values[0] || 0
            : 0,
        upperBound: 0,
      };
    case "is_null":
    case "is_not_null":
      return { type };
    case "custom":
      // TODO extract the partial and fill it in here
      return { type, partial: "" };
  }
}

export function timeFilterChangeType(
  filter: TimeFilter,
  type: TimeFilterType
): TimeFilter {
  switch (type) {
    case "is_in_the_past":
      return { type, unit: "days", amount: 7 };
    case "is_last":
    case "is_this":
      return { type, period: "day", amount: 1 };
    case "is_on":
    case "is_after":
    case "is_before":
      return {
        type,
        granularity: "granularity" in filter ? filter.granularity : "day",
        date:
          "date" in filter
            ? filter.date
            : "start" in filter
            ? filter.start
            : new Date(),
      };
    case "is_between":
      return {
        type,
        granularity: "granularity" in filter ? filter.granularity : "day",
        start: "date" in filter ? filter.date : new Date(),
        end: new Date(),
      };
    case "is_null":
    case "is_not_null":
      return { type };
    case "custom":
      // TODO extract the partial and fill it in here
      return { type, partial: "" };
  }
}

export function booleanFilterChangeType(
  filter: BooleanFilter,
  type: BooleanFilterType
): BooleanFilter {
  switch (type) {
    case "custom":
      // TODO extract the partial and fill it in here
      return { type, partial: "" };
    default:
      return { type };
  }
}

type HackyFilterParserResult<T> =
  | {
      field: string;
      filter: T;
    }
  | undefined;

const ID_CHAR = "[a-zA-Z_]";
const DIGIT = "[0-9]";
const ID = `${ID_CHAR}(?:${ID_CHAR}|${DIGIT})*`;
const QUOTED_ID = `\`${ID_CHAR}(?:${ID_CHAR}|${DIGIT}|\\s)*\``;
const ID_WITH_DOTS = `(?:${ID}|${QUOTED_ID})(?:\\.(?:${ID}|${QUOTED_ID}))*`;
const FIELD = `(?:${ID_WITH_DOTS})`;

const FALSE_FILTER = new RegExp(`^not (${FIELD})$`);
const TRUE_FILTER = new RegExp(`^(${FIELD})$`);
const TRUE_OR_NULL_FILTER = new RegExp(`^(${FIELD}):\\s*true\\s*\\|\\s*null$`);
const FALSE_OR_NULL_FILTER = new RegExp(
  `^(${FIELD}):\\s*false\\s*\\|\\s*null$`
);
const NULL_FILTER = new RegExp(`^(${FIELD})\\s*=\\s*null$`);
const NOT_NULL_FILTER = new RegExp(`^(${FIELD})\\s*!=\\s*null$`);
const CUSTOM_FILTER = new RegExp(`^(${FIELD}):\\s*(.*)$`);

function ALTERNATION(kind: "|" | "&", thing: string) {
  return `${thing}(?:\\s*\\${kind}\\s*${thing}\\s*)*`;
}

const STRING_ESCAPE = `(?:\\\\\\')|(?:\\\\\\\\)|(?:\\\\.)`;
const STRING = `\\'(?:${STRING_ESCAPE}|[^\\\\\\\\'])*\\'`;
const CONTAINS_STRING = `\\'%(?:${STRING_ESCAPE}|[^\\\\\\\\'])*%\\'`;
const STARTS_STRING = `\\'(?:${STRING_ESCAPE}|[^\\\\\\\\'])*%\\'`;
const ENDS_STRING = `\\'%(?:${STRING_ESCAPE}|[^\\\\\\\\'])*\\'`;
const STR_BLANK_FILTER = new RegExp(`^(${FIELD})\\s*=\\s\\'\\'$`);
const STR_NBLANK_FILTER = new RegExp(`^(${FIELD})\\s*!=\\s\\'\\'$`);
const STR_EQ_FILTER = new RegExp(
  `^(${FIELD})\\s*=\\s*(${ALTERNATION("|", STRING)})$`
);
const STR_NEQ_FILTER = new RegExp(
  `^(${FIELD})\\s*!=\\s*(${ALTERNATION("&", STRING)})$`
);
const STR_CONTAINS_FILTER = new RegExp(
  `^(${FIELD})\\s*~\\s*(${ALTERNATION("|", CONTAINS_STRING)})$`
);
const STR_NCONTAINS_FILTER = new RegExp(
  `^(${FIELD})\\s*!~\\s*(${ALTERNATION("&", CONTAINS_STRING)})$`
);
const STR_STARTS_FILTER = new RegExp(
  `^(${FIELD})\\s*~\\s*(${ALTERNATION("|", STARTS_STRING)})$`
);
const STR_ENDS_FILTER = new RegExp(
  `^(${FIELD})\\s*~\\s*(${ALTERNATION("|", ENDS_STRING)})$`
);
const STR_NSTARTS_FILTER = new RegExp(
  `^(${FIELD})\\s*!~\\s*(${ALTERNATION("&", STARTS_STRING)})$`
);
const STR_NENDS_FILTER = new RegExp(
  `^(${FIELD})\\s*!~\\s*(${ALTERNATION("&", ENDS_STRING)})$`
);
const NUMBER = `${DIGIT}+(?:\\.${DIGIT}*)?`;
const NUM_EQ_FILTER = new RegExp(
  `^(${FIELD})\\s*=\\s*(${ALTERNATION("|", NUMBER)})$`
);
const NUM_NEQ_FILTER = new RegExp(
  `^(${FIELD})\\s*!=\\s*(${ALTERNATION("&", NUMBER)})$`
);
const NUM_BET_FILTER = new RegExp(
  `^(${FIELD})\\s*:\\s*(${NUMBER})\\s*to\\s*(${NUMBER})$`
);
const NUM_GT_FILTER = new RegExp(`^(${FIELD})\\s*>\\s*(${NUMBER})$`);
const NUM_LT_FILTER = new RegExp(`^(${FIELD})\\s*<\\s*(${NUMBER})$`);
const NUM_LTE_FILTER = new RegExp(`^(${FIELD})\\s*>=\\s*(${NUMBER})$`);
const NUM_GTE_FILTER = new RegExp(`^(${FIELD})\\s*<=\\s*(${NUMBER})$`);

const TIME_UNIT = `(?:year|quarter|month|week|day|hour|minute|second)`;
const TIME_PAST_FILTER = new RegExp(
  `^(${FIELD})\\s*:\\s*now\\s*-\\s*(${NUMBER})\\s*(${TIME_UNIT})s?\\s*for\\s*\\s*(${NUMBER})\\s*(${TIME_UNIT})s?$`
);
const TIME_LAST_FILTER = new RegExp(
  `^(${FIELD})\\.(${TIME_UNIT})\\s*=\\s*now\\.(${TIME_UNIT})\\s*-\\s*1\\s*(${TIME_UNIT})$`
);
const TIME_THIS_FILTER = new RegExp(
  `^(${FIELD})\\.(${TIME_UNIT})\\s*=\\s*now\\.(${TIME_UNIT})$`
);

const YEAR = `${DIGIT}{4}`;
const DD = `${DIGIT}{2}`;
const TIME = `@${YEAR}(?:-${DD}(?:-${DD}(?: ${DD}:${DD}(?::${DD})?)?)?)?`;
const QUARTER = `@${YEAR}-Q[1234]`;
const WEEK = `@WK${YEAR}-${DD}-${DD}`;

const DATE = `(?:${TIME}|${QUARTER}|${WEEK})`;
const TIME_ON_FILTER = new RegExp(
  `^(${FIELD})\\.(${TIME_UNIT})\\s*=\\s*(${DATE})$`
);
const TIME_AFT_FILTER = new RegExp(
  `^(${FIELD})\\.(${TIME_UNIT})\\s*>\\s*(${DATE})$`
);
const TIME_BEF_FILTER = new RegExp(
  `^(${FIELD})\\.(${TIME_UNIT})\\s*<\\s*(${DATE})$`
);
const TIME_BET_FILTER = new RegExp(
  `^(${FIELD})\\.(${TIME_UNIT})\\s*:\\s*(${DATE})\\s*to\\s*(${DATE})$`
);

function extractField(fieldSyntax: string) {
  return unquoteIdentifier(fieldSyntax);
}

export function hackyTerribleStringToFilter(
  filterString: string
): HackyFilterParserResult<Filter> {
  return (
    hackyTerribleStringToBooleanFilter(filterString) ??
    hackyTerribleStringToStringFilter(filterString) ??
    hackyTerribleStringToNumberFilter(filterString) ??
    hackyTerribleStringToTimeFilter(filterString) ??
    hackyTerribleStringToAnyFilter(filterString)
  );
}

function hackyTerribleStringToBooleanFilter(
  filterString: string
): HackyFilterParserResult<BooleanFilter> {
  const isFalseMatch = filterString.match(FALSE_FILTER);
  if (isFalseMatch) {
    return {
      field: extractField(isFalseMatch[1]),
      filter: { type: "is_false" },
    };
  }
  const isTrueMatch = filterString.match(TRUE_FILTER);
  if (isTrueMatch) {
    return {
      field: extractField(isTrueMatch[1]),
      filter: { type: "is_true" },
    };
  }
  const isTrueOrNullMatch = filterString.match(TRUE_OR_NULL_FILTER);
  if (isTrueOrNullMatch) {
    return {
      field: extractField(isTrueOrNullMatch[1]),
      filter: { type: "is_true_or_null" },
    };
  }
  const isFalseOrNullMatch = filterString.match(FALSE_OR_NULL_FILTER);
  if (isFalseOrNullMatch) {
    return {
      field: extractField(isFalseOrNullMatch[1]),
      filter: { type: "is_false_or_null" },
    };
  }
}

function hackyTerribleStringToAnyFilter(
  filterString
): HackyFilterParserResult<Filter> {
  const isNullMatch = filterString.match(NULL_FILTER);
  if (isNullMatch) {
    return {
      field: extractField(isNullMatch[1]),
      filter: { type: "is_null" },
    };
  }
  const isNotNullMatch = filterString.match(NOT_NULL_FILTER);
  if (isNotNullMatch) {
    return {
      field: extractField(isNotNullMatch[1]),
      filter: { type: "is_not_null" },
    };
  }
  const isCustomMatch = filterString.match(CUSTOM_FILTER);
  if (isCustomMatch) {
    return {
      field: extractField(isCustomMatch[1]),
      filter: { type: "custom", partial: isCustomMatch[2] },
    };
  }
}

function deEscape(stringString: string) {
  return stringString.replace(/\\(.)/g, "$1");
}

function deQuote(stringString: string) {
  return stringString.substring(1, stringString.length - 1);
}

function deContains(stringString: string) {
  return stringString.substring(1, stringString.length - 1);
}

function deStarts(stringString: string) {
  return stringString.substring(0, stringString.length - 1);
}

function deEnds(stringString: string) {
  return stringString.substring(1);
}

function toNumber(numberString: string) {
  return parseFloat(numberString);
}

function getAlternationValues(kind: "|" | "&", alternation: string) {
  return alternation.split(new RegExp(`\\s*\\${kind}\\s*`));
}

function toTimeUnit(timeUnitString: string): InThePastUnit {
  if (
    [
      "year",
      "quarter",
      "month",
      "week",
      "day",
      "hour",
      "minute",
      "second",
    ].includes(timeUnitString)
  ) {
    return (timeUnitString + "s") as InThePastUnit;
  }
  throw new Error(`Invalid time unit '${timeUnitString}'`);
}

function toTimePeriod(timeUnitString: string): ThisLastPeriod {
  if (
    [
      "year",
      "quarter",
      "month",
      "week",
      "day",
      "hour",
      "minute",
      "second",
    ].includes(timeUnitString)
  ) {
    return timeUnitString as ThisLastPeriod;
  }
  throw new Error(`Invalid time period '${timeUnitString}'`);
}

function toDate(dateString: string): Date {
  const isDate = dateString.match(new RegExp(`^${TIME}$`));
  const isWeek = dateString.match(new RegExp(`^${WEEK}$`));
  if (isDate || isWeek) {
    const str = isDate ? dateString.substring(1) : dateString.substring(3);
    if (str.length === 4) {
      return new Date(parseInt(dateString.substring(0, 4)), 0, 1);
    } else if (str.length === 7) {
      return new Date(
        parseInt(str.substring(0, 4)),
        parseInt(str.substring(5, 7)) - 1,
        1
      );
    } else if (str.length === 10) {
      return new Date(
        parseInt(str.substring(0, 4)),
        parseInt(str.substring(5, 7)) - 1,
        parseInt(str.substring(8, 10))
      );
    } else if (str.length === 16) {
      return new Date(
        parseInt(str.substring(0, 4)),
        parseInt(str.substring(5, 7)) - 1,
        parseInt(str.substring(8, 10)),
        parseInt(str.substring(11, 13)),
        parseInt(str.substring(14, 16))
      );
    } else {
      return new Date(
        parseInt(str.substring(0, 4)),
        parseInt(str.substring(5, 7)) - 1,
        parseInt(str.substring(8, 10)),
        parseInt(str.substring(11, 13)),
        parseInt(str.substring(14, 16)),
        parseInt(str.substring(17, 19))
      );
    }
  } else if (dateString.match(new RegExp(`^${QUARTER}$`))) {
    return new Date(
      parseInt(dateString.substring(1, 5)),
      3 * parseInt(dateString.substring(7, 8)) - 1,
      1
    );
  }
  throw new Error(`Invalid Malloy date: ${dateString}`);
}

function hackyTerribleStringToStringFilter(
  filterString: string
): HackyFilterParserResult<StringFilter> {
  const isBlankMatch = filterString.match(STR_BLANK_FILTER);
  if (isBlankMatch) {
    return {
      field: extractField(isBlankMatch[1]),
      filter: { type: "is_blank" },
    };
  }
  const isNotBlankMatch = filterString.match(STR_NBLANK_FILTER);
  if (isNotBlankMatch) {
    return {
      field: extractField(isNotBlankMatch[1]),
      filter: { type: "is_not_blank" },
    };
  }
  const isEqualMatch = filterString.match(STR_EQ_FILTER);
  if (isEqualMatch) {
    return {
      field: extractField(isEqualMatch[1]),
      filter: {
        type: "is_equal_to",
        values: getAlternationValues("|", isEqualMatch[2])
          .map(deQuote)
          .map(deEscape),
      },
    };
  }
  const isNotEqualMatch = filterString.match(STR_NEQ_FILTER);
  if (isNotEqualMatch) {
    return {
      field: extractField(isNotEqualMatch[1]),
      filter: {
        type: "is_not_equal_to",
        values: getAlternationValues("&", isNotEqualMatch[2])
          .map(deQuote)
          .map(deEscape),
      },
    };
  }
  const isContainsMatch = filterString.match(STR_CONTAINS_FILTER);
  if (isContainsMatch) {
    return {
      field: extractField(isContainsMatch[1]),
      filter: {
        type: "contains",
        values: getAlternationValues("|", isContainsMatch[2])
          .map(deQuote)
          .map(deEscape)
          .map(deContains),
      },
    };
  }
  const isNotContainsMatch = filterString.match(STR_NCONTAINS_FILTER);
  if (isNotContainsMatch) {
    return {
      field: extractField(isNotContainsMatch[1]),
      filter: {
        type: "does_not_contain",
        values: getAlternationValues("&", isNotContainsMatch[2])
          .map(deQuote)
          .map(deEscape)
          .map(deContains),
      },
    };
  }
  const isStartsMatch = filterString.match(STR_STARTS_FILTER);
  if (isStartsMatch) {
    return {
      field: extractField(isStartsMatch[1]),
      filter: {
        type: "starts_with",
        values: getAlternationValues("|", isStartsMatch[2])
          .map(deQuote)
          .map(deEscape)
          .map(deStarts),
      },
    };
  }
  const isEndsMatch = filterString.match(STR_ENDS_FILTER);
  if (isEndsMatch) {
    return {
      field: extractField(isEndsMatch[1]),
      filter: {
        type: "ends_with",
        values: getAlternationValues("|", isEndsMatch[2])
          .map(deQuote)
          .map(deEscape)
          .map(deEnds),
      },
    };
  }
  const isNotStartsMatch = filterString.match(STR_NSTARTS_FILTER);
  if (isNotStartsMatch) {
    return {
      field: extractField(isNotStartsMatch[1]),
      filter: {
        type: "does_not_start_with",
        values: getAlternationValues("&", isNotStartsMatch[2])
          .map(deQuote)
          .map(deEscape)
          .map(deStarts),
      },
    };
  }
  const isNotEndsMatch = filterString.match(STR_NENDS_FILTER);
  if (isNotEndsMatch) {
    return {
      field: extractField(isNotEndsMatch[1]),
      filter: {
        type: "does_not_end_with",
        values: getAlternationValues("&", isNotEndsMatch[2])
          .map(deQuote)
          .map(deEscape)
          .map(deEnds),
      },
    };
  }
}

function hackyTerribleStringToNumberFilter(
  filterString: string
): HackyFilterParserResult<NumberFilter> {
  const isEqualMatch = filterString.match(NUM_EQ_FILTER);
  if (isEqualMatch) {
    return {
      field: extractField(isEqualMatch[1]),
      filter: {
        type: "is_equal_to",
        values: getAlternationValues("|", isEqualMatch[2]).map(toNumber),
      },
    };
  }
  const isNotEqualMatch = filterString.match(NUM_NEQ_FILTER);
  if (isNotEqualMatch) {
    return {
      field: extractField(isNotEqualMatch[1]),
      filter: {
        type: "is_not_equal_to",
        values: getAlternationValues("&", isNotEqualMatch[2]).map(toNumber),
      },
    };
  }
  const isGTMatch = filterString.match(NUM_GT_FILTER);
  if (isGTMatch) {
    return {
      field: extractField(isGTMatch[1]),
      filter: {
        type: "is_greater_than",
        value: toNumber(extractField(isGTMatch[2])),
      },
    };
  }
  const isLTMatch = filterString.match(NUM_LT_FILTER);
  if (isLTMatch) {
    return {
      field: extractField(isLTMatch[1]),
      filter: {
        type: "is_less_than",
        value: toNumber(extractField(isLTMatch[2])),
      },
    };
  }
  const isGTEMatch = filterString.match(NUM_GTE_FILTER);
  if (isGTEMatch) {
    return {
      field: extractField(isGTEMatch[1]),
      filter: {
        type: "is_greater_than_or_equal_to",
        value: toNumber(extractField(isGTEMatch[2])),
      },
    };
  }
  const isLTEMatch = filterString.match(NUM_LTE_FILTER);
  if (isLTEMatch) {
    return {
      field: extractField(isLTEMatch[1]),
      filter: {
        type: "is_less_than_or_equal_to",
        value: toNumber(extractField(isLTEMatch[2])),
      },
    };
  }
  const isBetweenMatch = filterString.match(NUM_BET_FILTER);
  if (isBetweenMatch) {
    return {
      field: extractField(isBetweenMatch[1]),
      filter: {
        type: "is_between",
        lowerBound: toNumber(extractField(isBetweenMatch[2])),
        upperBound: toNumber(extractField(isBetweenMatch[3])),
      },
    };
  }
}

function hackyTerribleStringToTimeFilter(
  filterString: string
): HackyFilterParserResult<TimeFilter> {
  const isPastMatch = filterString.match(TIME_PAST_FILTER);
  if (isPastMatch) {
    return {
      field: extractField(isPastMatch[1]),
      filter: {
        type: "is_in_the_past",
        amount: toNumber(extractField(isPastMatch[2])),
        unit: toTimeUnit(extractField(isPastMatch[3])),
      },
    };
  }
  const isLastMatch = filterString.match(TIME_LAST_FILTER);
  if (isLastMatch) {
    return {
      field: extractField(isLastMatch[1]),
      filter: {
        type: "is_last",
        period: toTimePeriod(extractField(isLastMatch[2])),
      },
    };
  }
  const isThisMatch = filterString.match(TIME_THIS_FILTER);
  if (isThisMatch) {
    return {
      field: extractField(isThisMatch[1]),
      filter: {
        type: "is_this",
        period: toTimePeriod(extractField(isThisMatch[2])),
      },
    };
  }
  const isOnMatch = filterString.match(TIME_ON_FILTER);
  if (isOnMatch) {
    return {
      field: extractField(isOnMatch[1]),
      filter: {
        type: "is_on",
        granularity: toTimePeriod(extractField(isOnMatch[2])),
        date: toDate(extractField(isOnMatch[3])),
      },
    };
  }
  const isAfterMatch = filterString.match(TIME_AFT_FILTER);
  if (isAfterMatch) {
    return {
      field: extractField(isAfterMatch[1]),
      filter: {
        type: "is_after",
        granularity: toTimePeriod(extractField(isAfterMatch[2])),
        date: toDate(extractField(isAfterMatch[3])),
      },
    };
  }
  const isBeforeMatch = filterString.match(TIME_BEF_FILTER);
  if (isBeforeMatch) {
    return {
      field: extractField(isBeforeMatch[1]),
      filter: {
        type: "is_before",
        granularity: toTimePeriod(extractField(isBeforeMatch[2])),
        date: toDate(extractField(isBeforeMatch[3])),
      },
    };
  }
  const isBetweenMatch = filterString.match(TIME_BET_FILTER);
  if (isBetweenMatch) {
    return {
      field: extractField(isBetweenMatch[1]),
      filter: {
        type: "is_between",
        granularity: toTimePeriod(extractField(isBetweenMatch[2])),
        start: toDate(extractField(isBetweenMatch[3])),
        end: toDate(extractField(isBetweenMatch[4])),
      },
    };
  }
}
