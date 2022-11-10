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

import { ModelDef, SearchIndexResult, StructDef } from "@malloydata/malloy";
import { useQuery } from "react-query";
import { isDuckDBWASM } from "../utils";
import * as duckDBWASM from "./duckdb_wasm";

async function search(
  model: ModelDef,
  source: StructDef | undefined,
  searchTerm: string,
  fieldPath?: string
) {
  if (source === undefined) {
    return undefined;
  }

  if (isDuckDBWASM()) {
    const res = await duckDBWASM.search(model, source, searchTerm, fieldPath);
    if (res instanceof Error) {
      throw res;
    }
    return res;
  }

  const raw = await (
    await fetch("api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, searchTerm, source, fieldPath }),
    })
  ).json();
  return (raw.result || []) as SearchIndexResult[];
}

interface UseSearchResult {
  searchResults: SearchIndexResult[] | undefined;
  isLoading: boolean;
}

export function useSearch(
  model: ModelDef,
  source: StructDef | undefined,
  searchTerm: string,
  fieldPath?: string
): UseSearchResult {
  const { data: searchResults, isLoading } = useQuery(
    [source, searchTerm, fieldPath],
    () => search(model, source, searchTerm, fieldPath),
    {
      refetchOnWindowFocus: true,
    }
  );

  return { searchResults, isLoading };
}
