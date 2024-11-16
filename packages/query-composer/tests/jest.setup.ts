/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

global.structuredClone = (val: unknown) => {
  return JSON.parse(JSON.stringify(val));
};
