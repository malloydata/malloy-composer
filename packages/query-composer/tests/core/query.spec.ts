/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import {QueryBuilder} from '../../src/core/query';

import {model, source} from '../../example/example_model';
import {FilterCondition, SourceDef} from '@malloydata/malloy';

describe('QueryBuilder', () => {
  let qb: QueryBuilder;

  beforeEach(() => {
    qb = new QueryBuilder(source);
  });

  it('constructs', () => {
    expect(qb).not.toBeNull();
    expect(qb.isEmpty()).toBe(true);
  });

  describe('addNest', () => {
    it('Adds a nest', () => {
      qb.addNewNestedQuery({stageIndex: 0}, 'eyrie');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  nest: eyrie is {
  }
}`);
    });

    it('Adds a nested nest', () => {
      qb.addNewNestedQuery({stageIndex: 0}, 'eyrie');
      qb.addNewNestedQuery(
        {stageIndex: 0, parts: [{stageIndex: 0, fieldIndex: 0}]},
        'coop'
      );
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  nest: eyrie is {
    nest: coop is {
    }
  }
}`);
    });
  });

  describe('addField', () => {
    it('Adds a dimension', () => {
      qb.addField({stageIndex: 0}, 'name');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n}'
      );
    });

    it('Adds multiple dimensions', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addField({stageIndex: 0}, 'state');
      qb.addField({stageIndex: 0}, 'gender');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: 
    name
    state
    gender
}`);
    });

    it('Adds a measure', () => {
      qb.addField({stageIndex: 0}, 'population');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  aggregate: population\n}'
      );
    });

    it('Adds a dimension and a measure', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addField({stageIndex: 0}, 'state');
      qb.addField({stageIndex: 0}, 'population');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: 
    name
    state
  aggregate: population
}`);
    });
  });

  describe('removeField', () => {
    beforeEach(() => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addField({stageIndex: 0}, 'state');
      qb.addField({stageIndex: 0}, 'population');
    });

    it('can remove a field', () => {
      qb.removeField({stageIndex: 0}, 1);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: name
  aggregate: population
}`);
    });
  });

  describe('reorderFields', () => {
    beforeEach(() => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addField({stageIndex: 0}, 'state');
      qb.addField({stageIndex: 0}, 'population');
    });

    it('can reorder fields', () => {
      qb.reorderFields({stageIndex: 0}, [2, 0, 1]);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  aggregate: population
  group_by: 
    name
    state
}`);
    });
  });

  describe('addFilter', () => {
    it('Adds a scalar filter', () => {
      qb.addFilter({stageIndex: 0}, SCALAR_FILTER);
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  where: name = "lloyd"
}`);
    });

    it('Adds an aggregate filter', () => {
      qb.addFilter({stageIndex: 0}, AGGREGATE_FILTER);
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  having: population > 100
}`);
    });
  });

  describe('removeFilter', () => {
    beforeEach(() => {
      qb.addFilter({stageIndex: 0}, SCALAR_FILTER);
      qb.addFilter({stageIndex: 0}, AGGREGATE_FILTER);
    });

    it('can remove a filter', () => {
      qb.removeFilter({stageIndex: 0}, 0);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  having: population > 100
}`);
    });
  });

  describe('addLimit', () => {
    it('adds a limit', () => {
      qb.addLimit({stageIndex: 0}, 10);
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  limit: 10\n}'
      );
    });
  });

  describe('addOrderBy', () => {
    it('adds an order_by', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addOrderBy({stageIndex: 0}, 0);
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name\n}'
      );
    });

    it('adds an ascending order_by', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addOrderBy({stageIndex: 0}, 0, 'asc');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name asc\n}'
      );
    });

    it('adds an descending order_by', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addOrderBy({stageIndex: 0}, 0, 'desc');
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name desc\n}'
      );
    });

    it('adds multiple order_bys', () => {
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

  describe('renderers', () => {
    it('can add a renderer to a query', () => {
      qb.loadQuery('by_gender');
      qb.setRenderer({stageIndex: 0}, undefined, 'bar_chart');
      expect(qb.getQueryStringForNotebook()).toEqual(`\
# bar_chart
run: names -> {
  group_by: gender
  aggregate: population
}`);
    });

    it('can add a renderer to a field', () => {
      qb.loadQuery('by_gender');
      qb.setRenderer({stageIndex: 0}, 1, 'percent');
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: gender
  # percent
  aggregate: population
}`);
    });
  });

  describe('loadQuery', () => {
    it('can load a query by name', () => {
      qb.loadQuery('by_gender');
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: gender
  aggregate: population
}`);
      expect(qb.getName()).toEqual('by_gender');
    });
  });

  describe('clearQuery', () => {
    it('can clear the query', () => {
      qb.loadQuery('by_gender');
      expect(qb.isEmpty()).toBe(false);
      qb.clearQuery();
      expect(qb.isEmpty()).toBe(true);
    });
  });

  describe('nested queries', () => {
    beforeEach(() => {
      qb.addNewNestedQuery({stageIndex: 0}, 'eyrie');
    });

    it('Adds a dimension', () => {
      qb.addField(
        {stageIndex: 0, parts: [{stageIndex: 0, fieldIndex: 0}]},
        'name'
      );
      expect(qb.isEmpty()).toBe(false);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  nest: eyrie is {
    group_by: name
  }
}`);
    });
  });

  describe('updateSource', () => {
    it('updates the source', () => {
      expect(qb.getSource()?.as).toEqual('names');
      qb.updateSource(model.contents['names2'] as SourceDef);
      expect(qb.getSource()?.as).toEqual('names2');
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
