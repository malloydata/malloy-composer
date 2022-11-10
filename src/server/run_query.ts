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

import { Malloy, Result, Runtime } from "@malloydata/malloy";
import { CONNECTION_MANAGER } from "./connections";
import { URL_READER } from "./urls";
import * as path from "path";
import { getConfig } from "./config";

export async function runQuery(
  query: string,
  queryName: string,
  modelPath: string,
): Promise<Result> {
  const { modelsPath } = await getConfig();
  const modelURL = new URL("file://" + path.join(modelsPath, modelPath));
  const connections = CONNECTION_MANAGER.getConnectionLookup(modelURL);
  const runtime = new Runtime(URL_READER, connections);
  const baseModel = await runtime.getModel(modelURL);
  const queryModel = await Malloy.compile({
    urlReader: URL_READER,
    connections,
    model: baseModel,
    parse: Malloy.parse({ source: query }),
  });
  const runnable = runtime._loadModelFromModelDef(
    queryModel._modelDef
  ).loadQueryByName(queryName);
  const rowLimit = (await runnable.getPreparedResult()).resultExplore.limit;
  return runnable.run({ rowLimit });
}
