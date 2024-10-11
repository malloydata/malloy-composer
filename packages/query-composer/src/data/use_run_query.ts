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
import * as malloy from '@malloydata/malloy';
import {useState} from 'react';

export type RunQuery = (
  query: string,
  model: malloy.ModelDef,
  modelPath: string,
  queryName: string
) => Promise<malloy.Result>;

export interface UseRunQueryResult {
  result: malloy.Result | undefined;
  runQuery: (query: string, queryName: string) => void;
  isRunning: boolean;
  clearResult: () => void;
}

export function useRunQuery(
  onError: (error: Error) => void,
  model: malloy.ModelDef,
  modelPath: string,
  runQuery: RunQuery
): UseRunQueryResult {
  const [data, setData] = useState<malloy.Result | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setData(undefined);
    setIsLoading(false);
  };

  const runQueryRet = (query: string, queryName: string) => {
    reset();
    setIsLoading(true);
    runQuery(query, model, modelPath, queryName)
      .then(result => {
        setData(result);
      })
      .catch(onError)
      .finally(() => {
        setIsLoading(false);
      });
  };

  return {
    result: data,
    runQuery: runQueryRet,
    isRunning: isLoading,
    clearResult: reset,
  };
}
