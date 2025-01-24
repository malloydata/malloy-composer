/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Expr} from '@malloydata/malloy';
import {stringFromExpr, codeFromExpr} from '../../src/core/expr';

// const DATE = new Date(1706994121000); // 2024-02-03 21:02:01 UTC

const STR_EXPRS: [Expr, string][] = [
  [{node: 'null'}, 'null'],
  [{node: 'true'}, 'true'],
  [{node: 'false'}, 'false'],
  [{node: 'stringLiteral', literal: 'abc'}, 'abc'],
  [{node: 'numberLiteral', literal: '123'}, '123'],
  [
    {
      node: 'timeLiteral',
      literal: '2024-02-03 21:02:01',
      typeDef: {type: 'timestamp'},
    },
    '@2024-02-03 21:02:01',
  ],
  [
    {
      node: 'timeLiteral',
      literal: '2024-02-03',
      typeDef: {type: 'date'},
    },
    '@2024-02-03',
  ],
];

const CODE_EXPRS: [Expr, string][] = [
  [{node: 'null'}, 'null'],
  [{node: 'true'}, 'true'],
  [{node: 'false'}, 'false'],
  [{node: 'stringLiteral', literal: 'abc'}, '"abc"'],
  [{node: 'numberLiteral', literal: '123'}, '123'],
  [
    {
      node: 'timeLiteral',
      literal: '2024-02-03 21:02:01',
      typeDef: {type: 'timestamp'},
    },
    '@2024-02-03 21:02:01',
  ],
  [
    {
      node: 'timeLiteral',
      literal: '2024-02-03',
      typeDef: {type: 'date'},
    },
    '@2024-02-03',
  ],
];

describe('stringFromExpr', () => {
  it.each(STR_EXPRS)('%o generates %s', (e, str) => {
    expect(stringFromExpr(e)).toEqual(str);
  });
});

describe('codeFromExpr', () => {
  it.each(CODE_EXPRS)('%o generates %s', (e, str) => {
    expect(codeFromExpr(e)).toEqual(str);
  });
});
