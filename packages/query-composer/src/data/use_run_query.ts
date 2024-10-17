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
import {useCallback, useState} from 'react';

export type RunQuery = (
  query: string,
  model: malloy.ModelDef,
  modelPath: string,
  queryName: string
) => Promise<malloy.Result>;

export interface UseRunQueryResult {
  result: malloy.Result | undefined;
  error: Error | undefined;
  runQuery: (query: string, queryName: string) => void;
  reset: () => void;
  isRunning: boolean;
}

export function useRunQuery(
  model: malloy.ModelDef | undefined,
  modelPath: string | undefined,
  runQueryImp: RunQuery
): UseRunQueryResult {
  const [result, setResult] = useState<malloy.Result>();
  const [error, setError] = useState<Error>();
  const [isRunning, setIsRunning] = useState(false);

  const reset = useCallback(() => {
    setResult(undefined);
    setError(undefined);
    setIsRunning(false);
  }, []);

  const runQuery = useCallback(
    (query: string, queryName: string) => {
      reset();
      if (!model || !modelPath) {
        setError(new Error('No model'));
        return;
      }
      setIsRunning(true);
      runQueryImp(query, model, modelPath, queryName)
        .then(result => {
          setResult(result);
        })
        .catch(error => {
          setError(error);
        })
        .finally(() => {
          setIsRunning(false);
        });
    },
    [model, modelPath, reset, runQueryImp]
  );

  return {
    result,
    error,
    runQuery,
    reset,
    isRunning,
  };
}
