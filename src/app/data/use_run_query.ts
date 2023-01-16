/*
 * Copyright 2023 Google LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useMutation } from "react-query";
import * as malloy from "@malloydata/malloy";
import { isDuckDBWASM } from "../utils";
import * as duckDBWASM from "./duckdb_wasm";

async function runQuery(
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
    await fetch("api/run_query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

interface UseRunQueryResult {
  result: malloy.Result | undefined;
  runQuery: (query: string, queryName: string) => void;
  isRunning: boolean;
  clearResult: () => void;
}

export function useRunQuery(
  onError: (error: Error) => void,
  model: malloy.ModelDef,
  modelPath: string
): UseRunQueryResult {
  const { data, mutateAsync, isLoading, reset } = useMutation(
    ({ query, queryName }: { query: string; queryName: string }) =>
      runQuery(query, model, modelPath, queryName),
    { onError }
  );

  const runQueryRet = (query: string, queryName: string) => {
    reset();
    mutateAsync({ query, queryName });
  };

  return {
    result: data,
    runQuery: runQueryRet,
    isRunning: isLoading,
    clearResult: reset,
  };
}
