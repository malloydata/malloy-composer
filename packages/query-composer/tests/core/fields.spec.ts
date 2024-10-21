/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import {degenerateMeasure, generateMeasure} from '../../src/core/fields';

import {source} from '../../example/example_model';

describe('generateMeasure', () => {
  it('generates count', () => {
    expect(generateMeasure('count_distinct', 'name')).toEqual('count(name)');
  });

  it('generates average', () => {
    expect(generateMeasure('avg', 'population')).toEqual('population.avg()');
  });

  it('generates sum', () => {
    expect(generateMeasure('sum', 'population')).toEqual('population.sum()');
  });

  it('generates min', () => {
    expect(generateMeasure('min', 'population')).toEqual('min(population)');
  });

  it('generates max', () => {
    expect(generateMeasure('max', 'population')).toEqual('max(population)');
  });

  it('generates percent', () => {
    expect(generateMeasure('percent', 'found')).toEqual(
      '100 * found / all(found)'
    );
  });
});

describe('degenerateMeasure', () => {
  it('degenerates count', () => {
    expect(degenerateMeasure(source, 'count()')).toEqual({
      field: undefined,
      measureType: 'count',
      path: '',
    });
  });

  it('degenerates count_distinct', () => {
    expect(degenerateMeasure(source, 'count(name)')).toEqual({
      field: expect.objectContaining(NAME_FIELD_FRAGMENT),
      measureType: 'count_distinct',
      path: 'name',
    });
  });

  it('degenerates average', () => {
    expect(degenerateMeasure(source, 'population.avg()')).toEqual({
      field: expect.objectContaining(POPULATION_FIELD_FRAGMENT),
      measureType: 'avg',
      path: 'population',
    });
  });

  it('degenerates sum', () => {
    expect(degenerateMeasure(source, 'population.sum()')).toEqual({
      field: expect.objectContaining(POPULATION_FIELD_FRAGMENT),
      measureType: 'sum',
      path: 'population',
    });
  });

  it('degenerates min', () => {
    expect(degenerateMeasure(source, 'min(population)')).toEqual({
      field: expect.objectContaining(POPULATION_FIELD_FRAGMENT),
      measureType: 'min',
      path: 'population',
    });
  });

  it('degenerates max', () => {
    expect(degenerateMeasure(source, 'max(population)')).toEqual({
      field: expect.objectContaining(POPULATION_FIELD_FRAGMENT),
      measureType: 'max',
      path: 'population',
    });
  });

  it('degenerates percent', () => {
    expect(
      degenerateMeasure(source, '100 * population / all(population)')
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
