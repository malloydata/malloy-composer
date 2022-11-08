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
import { Dataset } from "../../types";
import { isDuckDBWASM, isElectron } from "../utils";
import * as duckDBWASM from "./duckdb_wasm";

async function fetchTopValues(
  model?: ModelDef,
  source?: StructDef
): Promise<SearchValueMapResult[] | undefined> {
  if (source === undefined || model === undefined) {
    return undefined;
  }

  if (isDuckDBWASM()) {
    return duckDBWASM.topValues(model, source);
  }

  if (isElectron()) {
    const res = await window.malloy.topValues(model, source);
    if (res instanceof Error) {
      throw res;
    }
    return res;
  }
  const raw = await (
    await fetch("api/top_values", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source,
      }),
    })
  ).json();
  return raw.result as SearchValueMapResult[];
}

export function useTopValues(
  dataset?: Dataset,
  source?: StructDef
): SearchValueMapResult[] | undefined {
  const { data: models } = useQuery(
    ["top_values", dataset?.id, source?.name],
    () => fetchTopValues(dataset?.model, source),
    {
      refetchOnWindowFocus: false,
    }
  );

  return models;
}
