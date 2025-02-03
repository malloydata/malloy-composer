/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  StubCompile,
  StubConnection,
  StubReader,
} from '../../src/core/stub-compile';

import {model, source} from '../../example/example_model';
import {SQLSourceDef} from '@malloydata/malloy';

describe('StubReader', () => {
  let stubReader: StubReader;

  beforeEach(() => {
    stubReader = new StubReader();
  });

  it('throws when asked to read a URL', async () => {
    await expect(() =>
      stubReader.readURL(new URL('file:///foo/bar'))
    ).rejects.toThrow();
  });
});

describe('StubConnection', () => {
  let stubConnection: StubConnection;

  beforeEach(() => {
    stubConnection = new StubConnection('duckdb');
  });

  it('throws when asked to run sql', () => {
    expect(() => stubConnection.runSQL()).toThrow();
  });

  it('throws when asked to fetch sql schema', () => {
    expect(() =>
      stubConnection.fetchSelectSchema({} as SQLSourceDef)
    ).toThrow();
  });

  it('throws when asked to fetch stable schema', () => {
    expect(() => stubConnection.fetchTableSchema('foo', 'bar')).toThrow();
  });
});

describe('StubCompile', () => {
  let stubCompile: StubCompile;

  beforeEach(() => {
    stubCompile = new StubCompile();
  });

  describe('compileQuery', () => {
    it('compiles a query', async () => {
      expect(await stubCompile.compileQuery(model, QUERY)).toEqual(
        expect.objectContaining(QUERY_FRAGMENT)
      );
    });
  });

  describe('compileQueryToSQL', () => {
    it('compiles a query to SQL', async () => {
      expect(await stubCompile.compileQueryToSQL(model, QUERY)).toEqual(
        QUERY_SQL
      );
    });
  });

  describe('compileFilter', () => {
    it('compiles a scalar filter', async () => {
      expect(await stubCompile.compileFilter(source, SCALAR_FILTER)).toEqual(
        expect.objectContaining(SCALAR_FILTER_FRAGMENT)
      );
    });

    it('compiles a aggregate filter', async () => {
      expect(await stubCompile.compileFilter(source, AGGREGATE_FILTER)).toEqual(
        expect.objectContaining(AGGREGATE_FILTER_FRAGMENT)
      );
    });
  });

  describe('compileDimension', () => {
    it('compiles a dimension', async () => {
      expect(
        await stubCompile.compileDimension(source, 'first_name', 'name')
      ).toEqual(expect.objectContaining(DIMENSION_FRAGMENT));
    });
  });

  describe('compileMeasure', () => {
    it('compiles a measure', async () => {
      expect(
        await stubCompile.compileMeasure(source, 'name_count', 'count()')
      ).toEqual(expect.objectContaining(MEASURE_FRAGMENT));
    });
  });

  describe('compileGroupBy', () => {
    it('compiles a measure', async () => {
      expect(
        await stubCompile.compileGroupBy(source, 'first_name', 'name')
      ).toEqual(expect.objectContaining(GROUP_BY_FRAGMENT));
    });
  });

  describe('getSourceNameForQuery', () => {
    it('gets the source name for a query', async () => {
      expect(await stubCompile.getSourceNameForQuery(model, QUERY)).toEqual(
        'names'
      );
    });
  });
});

/**
 * Compiled Query Test Data
 */

const QUERY = 'run: names -> by_name';

const QUERY_FRAGMENT = {
  name: 'new_query',
  structRef: 'names',
  type: 'query',
};

const QUERY_SQL = `\
SELECT 
   base."name" as "name",
   COALESCE(SUM(base."number"),0) as "population"
FROM usa_names.parquet as base
GROUP BY 1
ORDER BY 2 desc NULLS LAST
LIMIT 10
`;

/**
 * Compiled Filter Test Data
 */

const SCALAR_FILTER = 'name = "lloyd"';

const SCALAR_FILTER_FRAGMENT = {
  code: 'name = "lloyd"',
  expressionType: 'scalar',
  node: 'filterCondition',
};

const AGGREGATE_FILTER = 'population > 100';

const AGGREGATE_FILTER_FRAGMENT = {
  code: 'population > 100',
  expressionType: 'aggregate',
  node: 'filterCondition',
};

/**
 * Compiled Dimension Test Data
 */

const DIMENSION_FRAGMENT = {
  code: 'name',
  expressionType: 'scalar',
  name: 'first_name',
  type: 'string',
};

/**
 * Compiled Measure Test Data
 */

const MEASURE_FRAGMENT = {
  code: 'count()',
  expressionType: 'aggregate',
  name: 'name_count',
  type: 'number',
};

/**
 * Compiled GroupBy Test Data
 */

const GROUP_BY_FRAGMENT = {
  code: 'name',
  expressionType: 'scalar',
  name: 'first_name',
  type: 'string',
};
