/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {QueryBuilder} from '../../src/core/query';

import {model, source} from '../../example/example_model';
import {FilterCondition, TurtleDef} from '@malloydata/malloy';
import {getSourceDef} from '../../src/core/models';

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
      qb.addOrderBy({stageIndex: 0}, 2);
    });

    it('can remove a field', () => {
      qb.removeField({stageIndex: 0}, 1);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: name
  aggregate: population
  order_by: population
}`);
    });

    it('can remove a field that is an order_by', () => {
      qb.removeField({stageIndex: 0}, 2);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: 
    name
    state
}`);
    });
  });

  describe('toggleField', () => {
    beforeEach(() => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addField({stageIndex: 0}, 'state');
    });

    it('can add a field', () => {
      qb.toggleField({stageIndex: 0}, 'population');
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: 
    name
    state
  aggregate: population
}`);
    });

    it('can remove a field', () => {
      qb.toggleField({stageIndex: 0}, 'state');
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: name
}`);
    });
  });

  describe('hasField', () => {
    beforeEach(() => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addField({stageIndex: 0}, 'state');
    });

    it('can detect a field', () => {
      expect(qb.hasField({stageIndex: 0}, 'name')).toBe(true);
    });

    it('can detect an absent field', () => {
      expect(qb.hasField({stageIndex: 0}, 'population')).toBe(false);
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

    it('preserves order_by', () => {
      qb.addOrderBy({stageIndex: 0}, 1);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: 
    name
    state
  aggregate: population
  order_by: state
}`);
      qb.reorderFields({stageIndex: 0}, [2, 0, 1]);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  aggregate: population
  group_by: 
    name
    state
  order_by: state
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

  describe('addFilterToField', () => {
    it('Adds a filter to a field', () => {
      qb.addField({stageIndex: 0}, 'population');
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  aggregate: population
}`);
      qb.addFilterToField({stageIndex: 0}, 0, FIELD_FILTER, 'lloyd_count');
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  aggregate: lloyd_count is population {
    where: name = "lloyd"
  }
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

  describe('removeLimit', () => {
    it('removes a limit', () => {
      qb.addLimit({stageIndex: 0}, 10);
      expect(qb.isEmpty()).toBe(false);
      qb.removeLimit({stageIndex: 0});
      expect(qb.isEmpty()).toBe(true);
      expect(qb.getQueryStringForNotebook()).toEqual('run: names -> {\n}');
    });
  });

  describe('hasLimit', () => {
    it('detects a limit', () => {
      qb.addLimit({stageIndex: 0}, 10);
      expect(qb.hasLimit({stageIndex: 0})).toBe(true);
    });

    it('detects no limit', () => {
      expect(qb.hasLimit({stageIndex: 0})).toBe(false);
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

  describe('removeOrderBy', () => {
    it('removes an order_by', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addOrderBy({stageIndex: 0}, 0);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n  order_by: name\n}'
      );
      qb.removeOrderBy({stageIndex: 0}, 0);
      expect(qb.getQueryStringForNotebook()).toEqual(
        'run: names -> {\n  group_by: name\n}'
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

  describe('replaceQuery', () => {
    it('replaces a query', () => {
      qb.loadQuery('by_gender');
      const turtle = source.fields[8] as TurtleDef;
      expect(turtle.type).toBe('turtle');
      expect(turtle.name).toBe('by_name');
      qb.replaceQuery(turtle);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: name
  aggregate: population
  limit: 10
}`);
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

  describe('addStage', () => {
    it('adds a stage', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addStage(undefined);
      qb.addField({stageIndex: 1}, 'name');
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: name
} -> {
  group_by: name
}`);
    });

    it('adds a nested stage', () => {
      qb.addNewNestedQuery({stageIndex: 0}, 'crows');
      qb.addStage({stageIndex: 0}, 0);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  nest: crows is {
  }-> {
  }
}`);
    });
  });

  describe('removeStage', () => {
    it('removes a stage', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addStage(undefined);
      qb.addField({stageIndex: 1}, 'name');
      qb.removeStage({stageIndex: 0});
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  group_by: name
}`);
    });

    it('removes a nested stage', () => {
      qb.addNewNestedQuery({stageIndex: 0}, 'crows');
      qb.addStage({stageIndex: 0}, 0);
      qb.removeStage({stageIndex: 0, parts: [{stageIndex: 0, fieldIndex: 0}]});
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  nest: crows is {
  }
}`);
    });
  });

  describe('expanding stages', () => {
    beforeEach(() => {
      qb.addField({stageIndex: 0}, 'by_state');
    });

    it('auto expands when applying new properties', () => {
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  nest: by_state
}`);
      qb.addLimit({stageIndex: 0, parts: [{stageIndex: 0, fieldIndex: 0}]}, 13);
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  nest: by_state is {
    group_by: state
    aggregate: births_per_100k
    limit: 13
  }
}`);
    });

    it('explicitly expands a stage', () => {
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  nest: by_state
}`);
      qb.replaceWithDefinition(
        {
          stageIndex: 0,
          parts: [],
        },
        0
      );
      expect(qb.getQueryStringForNotebook()).toEqual(`\
run: names -> {
  nest: by_state is {
    group_by: state
    aggregate: births_per_100k
  }
}`);
    });
  });

  describe('updateSource', () => {
    it('updates the source', () => {
      expect(qb.getSource()?.as).toEqual('names');
      qb.updateSource(getSourceDef(model, 'names2'));
      expect(qb.getSource()?.as).toEqual('names2');
    });
  });

  describe('canRun', () => {
    it('is false for an empty query', () => {
      expect(qb.canRun()).toBe(false);
    });

    it('is true for a valid query', () => {
      qb.addField({stageIndex: 0}, 'name');
      expect(qb.canRun()).toBe(true);
    });

    it('is false for an empty nest', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addNewNestedQuery({stageIndex: 0}, 'nest');
      expect(qb.canRun()).toBe(false);
    });

    it('is false for an empty stage', () => {
      qb.addField({stageIndex: 0}, 'name');
      qb.addStage(undefined);
      expect(qb.canRun()).toBe(false);
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
    node: '>',
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

const FIELD_FILTER: FilterCondition = {
  node: 'filterCondition',
  code: 'name = "lloyd"',
  expressionType: 'aggregate',
  e: {
    node: 'filteredExpr',
    kids: {
      e: {
        node: 'field',
        path: ['population'],
      },
      filterList: [
        {
          node: 'filterCondition',
          code: 'name = "lloyd"',
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
          expressionType: 'scalar',
        },
      ],
    },
  },
};
