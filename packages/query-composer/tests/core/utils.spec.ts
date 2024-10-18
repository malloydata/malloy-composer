/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as utils from '../../src/core/utils';

describe('Utils', () => {
  describe('unquoteIdentifier', () => {
    it('removes quotes', () => {
      expect(utils.unquoteIdentifier('`source`')).toEqual('source');
    });

    it('leaves unquoted values', () => {
      expect(utils.unquoteIdentifier('unquoted')).toEqual('unquoted');
    });
  });

  describe('maybeQuoteIdentifier', () => {
    it('quotes reserved words', () => {
      expect(utils.maybeQuoteIdentifier('source')).toEqual('`source`');
    });

    it('leaves not reserved words', () => {
      expect(utils.maybeQuoteIdentifier('unquoted')).toEqual('unquoted');
    });

    it('quotes nonstandard characters', () => {
      expect(utils.maybeQuoteIdentifier('is unusual?')).toEqual(
        '`is unusual?`'
      );
    });
  });
});
