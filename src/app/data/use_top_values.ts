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

import { ModelDef, SearchValueMapResult, StructDef } from "@malloydata/malloy";
import { useQuery } from "react-query";
import { isDuckDBWASM } from "../utils";
import * as duckDBWASM from "./duckdb_wasm";

async function fetchTopValues(
  model?: ModelDef,
  modelPath?: string,
  source?: StructDef
): Promise<SearchValueMapResult[] | undefined> {
  if (source === undefined || model === undefined) {
    return undefined;
  }

  if (isDuckDBWASM()) {
    return duckDBWASM.topValues(model, source);
  }

  const raw = await (
    await fetch("api/top_values", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        modelPath,
        source,
      }),
    })
  ).json();
  return raw.result as SearchValueMapResult[];
}

export function useTopValues(
  model?: ModelDef,
  modelPath?: string,
  source?: StructDef
): SearchValueMapResult[] | undefined {
  const { data: models } = useQuery(
    ["top_values", modelPath, source?.name],
    () => fetchTopValues(model, modelPath, source),
    {
      refetchOnWindowFocus: false,
    }
  );

  return models;
}
