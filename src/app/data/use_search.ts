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

import {ModelDef, SearchIndexResult, StructDef} from '@malloydata/malloy';
import {useQuery} from '@tanstack/react-query';
import {isDuckDBWASM} from '../utils';
import * as duckDBWASM from './duckdb_wasm';

async function search(
  model: ModelDef,
  modelPath: string,
  source: StructDef | undefined,
  searchTerm: string,
  fieldPath?: string
): Promise<SearchIndexResult[]> {
  if (source === undefined) {
    return [];
  }

  if (isDuckDBWASM()) {
    const res = await duckDBWASM.search(model, source, searchTerm, fieldPath);
    if (res instanceof Error) {
      throw res;
    }
    return res as SearchIndexResult[];
  }

  const raw = await (
    await fetch('api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({modelPath, searchTerm, source, fieldPath}),
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
  modelPath: string,
  source: StructDef | undefined,
  searchTerm: string,
  fieldPath?: string
): UseSearchResult {
  const {data: searchResults, isLoading} = useQuery({
    queryKey: [source, searchTerm, fieldPath],
    queryFn: () => search(model, modelPath, source, searchTerm, fieldPath),
    refetchOnWindowFocus: true,
  });

  return {searchResults, isLoading};
}
