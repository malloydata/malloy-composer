/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import {QueryBuilder} from '../../src/core/query';

import {source} from '../../example/example_model';
import {FilterCondition} from '@malloydata/malloy';

describe('QueryBuilder', () => {
  it('constructs', () => {
    const qb = new QueryBuilder(source);
    expect(qb).not.toBeNull();
    expect(qb.isEmpty()).toBe(true);
  });

  describe('addNest', () => {
    it('Adds a nest', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addNewNestedQuery({stageIndex: 0}, 'eyrie');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  nest: eyrie is {\n  }\n}'
      );
    });
  });

  describe('addField', () => {
    it('Adds a dimension', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addField({stageIndex: 0}, 'name');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n}'
      );
    });

    it('Adds a measure', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addField({stageIndex: 0}, 'population');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  aggregate: population\n}'
      );
    });
  });

  describe('addFilter', () => {
    it('Adds a scalar filter', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addFilter({stageIndex: 0}, SCALAR_FILTER);
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  where: name = "lloyd"\n}'
      );
    });

    it('Adds an aggregate filter', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addFilter({stageIndex: 0}, AGGREGATE_FILTER);
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  having: population > 100\n}'
      );
    });
  });

  describe('addLimit', () => {
    it('adds a limit', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addLimit({stageIndex: 0}, 10);
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  limit: 10\n}'
      );
    });
  });

  describe('addOrderBy', () => {
    it('adds an order_by', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addField({stageIndex: 0}, 'name');
      qb.addOrderBy({stageIndex: 0}, 0);
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name\n}'
      );
    });

    it('adds an ascending order_by', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addField({stageIndex: 0}, 'name');
      qb.addOrderBy({stageIndex: 0}, 0, 'asc');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name asc\n}'
      );
    });

    it('adds an descending order_by', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addField({stageIndex: 0}, 'name');
      qb.addOrderBy({stageIndex: 0}, 0, 'desc');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name desc\n}'
      );
    });

    it('adds multiple order_bys', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addField({stageIndex: 0}, 'name');
      qb.addField({stageIndex: 0}, 'state');
      qb.addOrderBy({stageIndex: 0}, 0, 'desc');
      qb.addOrderBy({stageIndex: 0}, 1);
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: \n    name\n    state\n  order_by: name desc, state\n}'
      );
    });

    it("doesn't add redundant order_by", () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addField({stageIndex: 0}, 'name');
      qb.addOrderBy({stageIndex: 0}, 0, 'desc');
      qb.addOrderBy({stageIndex: 0}, 0, 'asc');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name asc\n}'
      );
    });
  });

  describe('editOrderBy', () => {
    it('updates an order_by', () => {
      const qb = new QueryBuilder(source);
      expect(qb.isEmpty()).toBe(true);
      qb.addField({stageIndex: 0}, 'name');
      qb.addOrderBy({stageIndex: 0}, 0);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name\n}'
      );
      qb.editOrderBy({stageIndex: 0}, 0, 'desc');
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name desc\n}'
      );
    });
  });
});

const SCALAR_FILTER: FilterCondition = {
  node: 'filterCondition',
  code: 'name = "lloyd"',
  expressionType: 'scalar',
  e: {
    node: '=',
    kids: {
      left: {
        node: 'field',
        path: ['name'],
      },
      right: {
        node: 'stringLiteral',
        literal: 'lloyd',
      },
    },
  },
};

const AGGREGATE_FILTER: FilterCondition = {
  node: 'filterCondition',
  code: 'population > 100',
  expressionType: 'aggregate',
  e: {
    node: '=',
    kids: {
      left: {
        node: 'field',
        path: ['population'],
      },
      right: {
        node: 'numberLiteral',
        literal: '100',
      },
    },
  },
};
