/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import {SearchValueMapResult} from '@malloydata/malloy';
import {createContext} from 'react';

export interface SearchContextProps {
  topValues: SearchValueMapResult[] | undefined;
}

export const SearchContext = createContext<SearchContextProps>({
  topValues: undefined,
});
