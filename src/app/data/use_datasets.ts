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

import { useQuery } from "react-query";
import * as explore from "../../types";
import { isDuckDBWASM } from "../utils";
import * as duckDBWASM from "./duckdb_wasm";

export function useDatasets(
  app: { path: string; id?: string | undefined } | undefined
): explore.AppInfo | undefined {
  const { data: directory } = useQuery(
    ["datasets", app ? app.id ?? "default" : "empty"],
    async () => {
      if (app === undefined) {
        return undefined;
      }
      if (isDuckDBWASM()) {
        return duckDBWASM.datasets(app.path);
      }
      const raw = await (
        await fetch("api/datasets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            app,
          }),
        })
      ).json();
      return raw.datasets as explore.AppInfo;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  return directory;
}
