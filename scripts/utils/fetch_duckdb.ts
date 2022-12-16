/*
 * Copyright 2022 Google LLC
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

/* eslint-disable no-console */
import * as fs from "fs";
import * as path from "path";

import duckdbPackage from "@malloydata/db-duckdb/package.json";
import { fetchNode } from "./fetch_node";

const DUCKDB_VERSION = duckdbPackage.dependencies.duckdb;

export const targetDuckDBMap: Record<string, string> = {
  "darwin-arm64": `duckdb-v${DUCKDB_VERSION}-node-v93-darwin-arm64.node`,
  "darwin-x64": `duckdb-v${DUCKDB_VERSION}-node-v93-darwin-x64.node`,
  "linux-x64": `duckdb-v${DUCKDB_VERSION}-node-v93-linux-x64.node`,
  "win32-x64": `duckdb-v${DUCKDB_VERSION}-node-v93-win32-x64.node`,
};

export const fetchDuckDB = async (target: string): Promise<string> => {
  const file = targetDuckDBMap[target];
  const url = `https://duckdb-node.s3.amazonaws.com/duckdb-v${DUCKDB_VERSION}-node-v93-${target}.tar.gz`;
  const directoryPath = path.resolve(
    path.join("third_party", "github.com", "duckdb", "duckdb")
  );
  fs.mkdirSync(directoryPath, { recursive: true });
  const filePath = path.join(directoryPath, file);

  await fetchNode(filePath, url);

  return filePath;
};
