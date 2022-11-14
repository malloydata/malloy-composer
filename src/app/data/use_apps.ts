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

export function useApps(): explore.ComposerConfig | undefined {
  const { data: apps } = useQuery(
    ["apps"],
    async () => {
      if (isDuckDBWASM()) {
        return duckDBWASM.apps();
      }
      const raw = await (await fetch("api/apps")).json();
      return raw as explore.ComposerConfig;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  return apps;
}
