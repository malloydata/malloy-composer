/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import {QueryBuilder} from '../../src/core/query';

describe('QueryBuilder', () => {
  it('constructs', () => {
    expect(new QueryBuilder(undefined)).not.toBeNull();
  });
});
