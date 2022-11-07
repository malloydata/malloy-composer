/*
 * Copyright 2021 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import { useMutation } from "react-query";
import * as malloy from "@malloydata/malloy";
import { isDuckDBWASM, isElectron } from "../utils";
import * as duckDBWASM from "./duckdb_wasm";

async function runQuery(
  query: string,
  model: malloy.ModelDef,
  queryName: string
) {
  if (isDuckDBWASM()) {
    const result = await duckDBWASM.runQuery(query, queryName, model);
    if (result instanceof Error) {
      throw result;
    }
    return result;
  }

  // if (isElectron()) {
  //   const res = await window.malloy.runQuery(query, queryName, {
  //     ...analysis,
  //     modelDef: {} as unknown as malloy.ModelDef,
  //   });
  //   if (res instanceof Error) {
  //     throw res;
  //   }
  //   return malloy.Result.fromJSON(res);
  // }

  // const raw = await (
  //   await fetch("api/run_query", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       query,
  //       queryName,
  //       analysis: { ...analysis, modelDef: {} },
  //     }),
  //   })
  // ).json();
  // return malloy.Result.fromJSON(raw.result) as malloy.Result;
}

interface UseRunQueryResult {
  result: malloy.Result | undefined;
  runQuery: (query: string, queryName: string) => void;
  isRunning: boolean;
  clearResult: () => void;
}

export function useRunQuery(
  onError: (error: Error) => void,
  model: malloy.ModelDef
): UseRunQueryResult {
  const { data, mutateAsync, isLoading, reset } = useMutation(
    ({ query, queryName }: { query: string; queryName: string }) =>
      runQuery(query, model, queryName),
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
