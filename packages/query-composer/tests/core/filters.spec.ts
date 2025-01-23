/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  booleanFilterToString,
  hackyTerribleStringToFilter,
  numberFilterToString,
  stringFilterChangeType,
  stringFilterToString,
  timeFilterToString,
  TimeFrame,
  timeToString,
} from '../../src/core/filters';
import {
  BooleanFilter,
  NumberFilter,
  StringFilter,
  StringFilterType,
  TimeFilter,
} from '../../src/types';

const BOOLEAN_FILTER_TO_STRING: [BooleanFilter, string][] = [
  [{type: 'is_true'}, 'a'],
  [{type: 'is_false'}, 'not a'],
  [{type: 'is_true_or_null'}, 'a = true | null'],
  [{type: 'is_false_or_null'}, 'a = false | null'],
  [{type: 'is_null'}, 'a = null'],
  [{type: 'is_not_null'}, 'a != null'],
];

const NUMBER_FILTER_TO_STRING_NON_EMPTY: [NumberFilter, string][] = [
  [{type: 'is_equal_to', values: [1]}, 'a = 1'],
  [{type: 'is_equal_to', values: [1, 2]}, 'a = 1 | 2'],
  [{type: 'is_not_equal_to', values: [1]}, 'a != 1'],
  [{type: 'is_not_equal_to', values: [1, 2]}, 'a != 1 & 2'],

  [{type: 'is_greater_than', value: 1}, 'a > 1'],
  [{type: 'is_less_than', value: 1}, 'a < 1'],
  [{type: 'is_greater_than_or_equal_to', value: 1}, 'a >= 1'],
  [{type: 'is_less_than_or_equal_to', value: 1}, 'a <= 1'],

  [{type: 'is_between', lowerBound: 0, upperBound: 1}, 'a ? 0 to 1'],

  [{type: 'is_null'}, 'a = null'],
  [{type: 'is_not_null'}, 'a != null'],
];

const NUMBER_FILTER_TO_STRING_EMPTY: [NumberFilter, string][] = [
  [{type: 'is_equal_to', values: []}, 'true'],
  [{type: 'is_not_equal_to', values: []}, 'true'],
];

const NUMBER_FILTER_TO_STRING: [NumberFilter, string][] = [
  ...NUMBER_FILTER_TO_STRING_NON_EMPTY,
  ...NUMBER_FILTER_TO_STRING_EMPTY,
];

const STRING_FILTER_TO_STRING_NON_EMPTY: [StringFilter, string][] = [
  [{type: 'is_equal_to', values: ['a']}, "a = 'a'"],
  [{type: 'is_equal_to', values: ['a', 'b']}, "a = 'a' | 'b'"],
  [{type: 'is_not_equal_to', values: ['a']}, "a != 'a'"],
  [{type: 'is_not_equal_to', values: ['a', 'b']}, "a != 'a' & 'b'"],

  [{type: 'starts_with', values: ['a']}, "a ~ 'a%'"],
  [{type: 'starts_with', values: ['a', 'b']}, "a ~ 'a%' | 'b%'"],
  [{type: 'does_not_start_with', values: ['a']}, "a !~ 'a%'"],
  [{type: 'does_not_start_with', values: ['a', 'b']}, "a !~ 'a%' & 'b%'"],

  [{type: 'contains', values: ['a']}, "a ~ '%a%'"],
  [{type: 'contains', values: ['a', 'b']}, "a ~ '%a%' | '%b%'"],
  [{type: 'does_not_contain', values: ['a']}, "a !~ '%a%'"],
  [{type: 'does_not_contain', values: ['a', 'b']}, "a !~ '%a%' & '%b%'"],

  [{type: 'is_greater_than', value: 'a'}, "a > 'a'"],
  [{type: 'is_greater_than_or_equal_to', value: 'a'}, "a >= 'a'"],
  [{type: 'is_less_than', value: 'a'}, "a < 'a'"],
  [{type: 'is_less_than_or_equal_to', value: 'a'}, "a <= 'a'"],

  [{type: 'is_blank'}, "a = ''"],
  [{type: 'is_not_blank'}, "a != ''"],

  [{type: 'ends_with', values: ['a']}, "a ~ '%a'"],
  [{type: 'ends_with', values: ['a', 'b']}, "a ~ '%a' | '%b'"],
  [{type: 'does_not_end_with', values: ['a']}, "a !~ '%a'"],
  [{type: 'does_not_end_with', values: ['a', 'b']}, "a !~ '%a' & '%b'"],

  [{type: 'is_null'}, 'a = null'],
  [{type: 'is_not_null'}, 'a != null'],
];

const STRING_FILTER_TO_STRING_EMPTY: [StringFilter, string][] = [
  [{type: 'is_equal_to', values: []}, 'true'],
  [{type: 'is_not_equal_to', values: []}, 'true'],
  [{type: 'starts_with', values: []}, 'true'],
  [{type: 'does_not_start_with', values: []}, 'true'],
  [{type: 'ends_with', values: []}, 'true'],
  [{type: 'does_not_end_with', values: []}, 'true'],
  [{type: 'contains', values: []}, 'true'],
  [{type: 'does_not_contain', values: []}, 'true'],
];

const STRING_FILTER_TO_STRING = [
  ...STRING_FILTER_TO_STRING_EMPTY,
  ...STRING_FILTER_TO_STRING_NON_EMPTY,
];

const date = new Date(Date.parse('12-12-12'));

const TIME_FILTER_TO_STRING: [TimeFilter, string][] = [
  [{type: 'is_after', granularity: 'day', date}, 'a.day > @2012-12-12'],
  [{type: 'is_before', granularity: 'day', date}, 'a.day < @2012-12-12'],
  [
    {type: 'is_between', granularity: 'day', start: date, end: date},
    'a.day ? @2012-12-12 to @2012-12-12',
  ],
  [
    {type: 'is_in_the_past', amount: 1, unit: 'days'},
    'a ? now - 1 days for 1 days',
  ],
  [{type: 'is_last', period: 'day'}, 'a.day = now.day - 1 day'],
  [{type: 'is_null'}, 'a = null'],
  [{type: 'is_not_null'}, 'a != null'],
  [{type: 'is_on', granularity: 'day', date}, 'a.day = @2012-12-12'],
  [{type: 'is_this', period: 'day'}, 'a.day = now.day'],
];

describe('booleanFilterToString', () => {
  it.each(BOOLEAN_FILTER_TO_STRING)(
    '%o Generates the string %s',
    (filter: BooleanFilter, str: string) => {
      expect(booleanFilterToString('a', filter)).toEqual(str);
    }
  );
});

describe('numberFilterToString', () => {
  it.each(NUMBER_FILTER_TO_STRING)(
    '%o Generates the string %s',
    (filter: NumberFilter, str: string) => {
      expect(numberFilterToString('a', filter)).toEqual(str);
    }
  );
});

describe('stringFilterToString', () => {
  it.each(STRING_FILTER_TO_STRING)(
    '%o Generates the string %s',
    (filter: StringFilter, str: string) => {
      expect(stringFilterToString('a', filter)).toEqual(str);
    }
  );
});

describe('timeFilterToString', () => {
  it.each(TIME_FILTER_TO_STRING)(
    '%o Generates the string %s',
    (filter: TimeFilter, str: string) => {
      expect(timeFilterToString('a', filter)).toEqual(str);
    }
  );
});

describe('hackyTerribleStringToFilter (boolean)', () => {
  it.each(BOOLEAN_FILTER_TO_STRING)(
    '%o is generated from %s',
    (filter: BooleanFilter, str: string) => {
      expect(hackyTerribleStringToFilter(str)).toEqual({field: 'a', filter});
    }
  );
});

describe('hackyTerribleStringToFilter (number)', () => {
  it.each(NUMBER_FILTER_TO_STRING_NON_EMPTY)(
    '%o is generated from %s',
    (filter: NumberFilter, str: string) => {
      expect(hackyTerribleStringToFilter(str)).toEqual({field: 'a', filter});
    }
  );
});

describe('hackyTerribleStringToFilter (string)', () => {
  it.each(STRING_FILTER_TO_STRING_NON_EMPTY)(
    '%o is generated from %s',
    (filter: StringFilter, str: string) => {
      expect(hackyTerribleStringToFilter(str)).toEqual({field: 'a', filter});
    }
  );
});

describe('hackyTerribleStringToFilter (time)', () => {
  it.each(TIME_FILTER_TO_STRING)(
    '%o is generated from %s',
    (filter: TimeFilter, str: string) => {
      expect(hackyTerribleStringToFilter(str)).toEqual({field: 'a', filter});
    }
  );
});

const STRING_FILTER_CHANGE_TYPE: [
  StringFilter,
  StringFilterType,
  StringFilter,
][] = [
  [{type: 'is_not_null'}, 'is_null', {type: 'is_null'}],
  [{type: 'is_not_null'}, 'is_equal_to', {type: 'is_equal_to', values: []}],
  [{type: 'is_equal_to', values: ['a', 'b']}, 'is_null', {type: 'is_null'}],
  [
    {type: 'is_equal_to', values: ['a', 'b']},
    'is_greater_than',
    {type: 'is_greater_than', value: 'a'},
  ],
  [
    {type: 'is_greater_than', value: 'a'},
    'is_equal_to',
    {type: 'is_equal_to', values: ['a']},
  ],
];

describe('stringFilterChangeType', () => {
  it.each(STRING_FILTER_CHANGE_TYPE)(
    '%o %s is converted to %o',
    (input, type, output) => {
      expect(stringFilterChangeType(input, type)).toEqual(output);
    }
  );
});

const DATE = new Date(1706994121000); // 2024-02-03 21:02:01 UTC

const TO_TIME_STRING: [Date, TimeFrame, string][] = [
  [DATE, 'year', '@2024'],
  [DATE, 'quarter', '@2024-Q1'],
  [DATE, 'month', '@2024-02'],
  [DATE, 'week', '@WK2024-02-03'],
  [DATE, 'day', '@2024-02-03'],
  [DATE, 'hour', '@2024-02-03 21:00'],
  [DATE, 'minute', '@2024-02-03 21:02'],
  [DATE, 'second', '@2024-02-03 21:02:01'],
];

describe('timeToString', () => {
  it.each(TO_TIME_STRING)(
    '%s, %s generates %s',
    (input: Date, format: TimeFrame, output: string) => {
      expect(timeToString(input, format)).toEqual(output);
    }
  );
});
