/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createContext} from 'react';
import {DummyCompile} from '../core/dummy-compile';

const composerOptions = {
  dummyCompiler: new DummyCompile(),
};

export interface ComposerOptionsProps {
  dummyCompiler: DummyCompile;
}

export const ComposerOptionsContext =
  createContext<ComposerOptionsProps>(composerOptions);
