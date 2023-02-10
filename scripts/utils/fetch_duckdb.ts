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
