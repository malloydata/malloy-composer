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

import { Result, Runtime } from "@malloydata/malloy";
import { CONNECTION_MANAGER } from "./connections";
import { URL_READER } from "./urls";

export async function runQuery(
  query: string,
  modelPath: string,
): Promise<Result> {
  const modelURL = new URL("file://" + modelPath);
  const connections = CONNECTION_MANAGER.getConnectionLookup(modelURL);
  const runtime = new Runtime(URL_READER, connections);
  const runnable = runtime
    .loadModel(modelURL)
    .loadQuery(query);
  const rowLimit = (await runnable.getPreparedResult()).resultExplore.limit;
  return runnable.run({ rowLimit });
}
