/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createContext} from 'react';
import {StubCompile} from '../core/stub-compile';

const composerOptions = {
  compiler: new StubCompile(),
};

export interface ComposerOptionsProps {
  compiler: StubCompile;
}

export const ComposerOptionsContext =
  createContext<ComposerOptionsProps>(composerOptions);
