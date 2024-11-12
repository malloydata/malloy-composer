/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ModelDef, SourceDef, isSourceDef} from '@malloydata/malloy';

export function getSourceDef(modelDef: ModelDef, name: string): SourceDef {
  const result = modelDef.contents[name];
  if (isSourceDef(result)) {
    return result;
  }
  throw new Error(`Not a source: ${name}`);
}
