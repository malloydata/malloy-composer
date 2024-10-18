/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import {QueryBuilder} from '../../src/core/query';

import {source} from '../../example/example_model';

describe('QueryBuilder', () => {
  it('constructs', () => {
    const qb = new QueryBuilder(source);
    expect(qb).not.toBeNull();
    expect(qb.isEmpty()).toBe(true);
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
});
