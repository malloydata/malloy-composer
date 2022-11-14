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

import { useQuery } from "react-query";
import * as explore from "../../types";
import { isDuckDBWASM } from "../utils";
import * as duckDBWASM from "./duckdb_wasm";

export function useDatasets(
  app: { root: string; id?: string | undefined } | undefined
): explore.AppInfo | undefined {
  console.log("thing", app ? app.id ?? "default" : "empty")
  const { data: directory } = useQuery(
    ["datasets", app ? app.id ?? "default" : "empty"],
    async () => {
      if (app === undefined) {
        return undefined;
      }
      if (isDuckDBWASM()) {
        return duckDBWASM.datasets(app.root);
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
