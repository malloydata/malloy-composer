/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import {degenerateAggregate, generateAggregate} from '../../src/core/fields';

import {source} from '../../example/example_model';

describe('generateAggregate', () => {
  it('generates count', () => {
    expect(generateAggregate('count_distinct', 'name')).toEqual('count(name)');
  });

  it('generates average', () => {
    expect(generateAggregate('avg', 'population')).toEqual('population.avg()');
  });

  it('generates sum', () => {
    expect(generateAggregate('sum', 'population')).toEqual('population.sum()');
  });

  it('generates min', () => {
    expect(generateAggregate('min', 'population')).toEqual('min(population)');
  });

  it('generates max', () => {
    expect(generateAggregate('max', 'population')).toEqual('max(population)');
  });

  it('generates percent', () => {
    expect(generateAggregate('percent', 'found')).toEqual(
      '100 * found / all(found)'
    );
  });
});

describe('degenerateAggregate', () => {
  it('degenerates count', () => {
    expect(degenerateAggregate(source, 'count()')).toEqual({
      field: undefined,
      measureType: 'count',
      path: '',
    });
  });

  it('degenerates count_distinct', () => {
    expect(degenerateAggregate(source, 'count(name)')).toEqual({
      field: expect.objectContaining(NAME_FIELD_FRAGMENT),
      measureType: 'count_distinct',
      path: 'name',
    });
  });

  it('degenerates average', () => {
    expect(degenerateAggregate(source, 'population.avg()')).toEqual({
      field: expect.objectContaining(POPULATION_FIELD_FRAGMENT),
      measureType: 'avg',
      path: 'population',
    });
  });

  it('degenerates sum', () => {
    expect(degenerateAggregate(source, 'population.sum()')).toEqual({
      field: expect.objectContaining(POPULATION_FIELD_FRAGMENT),
      measureType: 'sum',
      path: 'population',
    });
  });

  it('degenerates min', () => {
    expect(degenerateAggregate(source, 'min(population)')).toEqual({
      field: expect.objectContaining(POPULATION_FIELD_FRAGMENT),
      measureType: 'min',
      path: 'population',
    });
  });

  it('degenerates max', () => {
    expect(degenerateAggregate(source, 'max(population)')).toEqual({
      field: expect.objectContaining(POPULATION_FIELD_FRAGMENT),
      measureType: 'max',
      path: 'population',
    });
  });

  it('degenerates percent', () => {
    expect(
      degenerateAggregate(source, '100 * population / all(population)')
    ).toEqual({
      field: expect.objectContaining(POPULATION_FIELD_FRAGMENT),
      measureType: 'percent',
      path: 'population',
    });
  });
});

const NAME_FIELD_FRAGMENT = {
  name: 'name',
  type: 'string',
};

const POPULATION_FIELD_FRAGMENT = {
  name: 'population',
  type: 'number',
  expressionType: 'aggregate',
};
