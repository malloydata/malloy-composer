/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as malloy from '@malloydata/malloy';
import {isDuckDBWASM} from '../utils';
import * as duckDBWASM from './duckdb_wasm';

export async function runQuery(
  query: string,
  model: malloy.ModelDef,
  modelPath: string,
  queryName: string
) {
  if (isDuckDBWASM()) {
    const result = await duckDBWASM.runQuery(query, queryName, model);
    if (result instanceof Error) {
      throw result;
    }
    return result;
  }

  const raw = await (
    await fetch('api/run_query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        modelPath,
        queryName,
      }),
    })
  ).json();
  return malloy.Result.fromJSON(raw.result) as malloy.Result;
}