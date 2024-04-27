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

import { Malloy, Result, Runtime } from "@malloydata/malloy";
import { CONNECTION_MANAGER } from "./connections";
import { URL_READER } from "./urls";
import * as path from "path";
import { getConfig } from "./config";
import {
  MalloySQLParser,
  MalloySQLStatementType,
} from "@malloydata/malloy-sql";
import { promises as fs } from "fs";
import * as explore from "../types";

// TODO: Clean up support for unamed queries.
export async function runQuery(
  app: explore.AppListing,
  query: string,
  queryName: string,
  modelPath: string
): Promise<Result> {
  const { workingDirectory } = await getConfig();
  const rootDirectory = path.join(workingDirectory, app.path);
  const modelURL = new URL("file://" + path.join(rootDirectory, modelPath));
  const connections = CONNECTION_MANAGER.getConnectionLookup(modelURL);
  const runtime = new Runtime(URL_READER, connections);
  console.log("MODEL PATH " + modelPath);
  console.log("MODEL PATH " + query);
  let runnable;
  if (modelPath.endsWith(".malloy")) {
    const baseModel = await runtime.getModel(modelURL);
    const queryModel = await Malloy.compile({
      urlReader: URL_READER,
      connections,
      model: baseModel,
      parse: Malloy.parse({ source: query }),
    });

    runnable = runtime
      ._loadModelFromModelDef(queryModel._modelDef)
      .loadQueryByName(queryName);
  } else if (modelPath.endsWith(".malloynb")) {
    const parse = MalloySQLParser.parse(
      await fs.readFile(modelURL, "utf8"),
      modelPath
    );
    let modelText = "";
    for (const stmt of parse.statements) {
      modelText +=
        stmt.type === MalloySQLStatementType.MALLOY ? stmt.text + "\n" : "";
    }
    const importBaseURL = new URL("file://" + rootDirectory);
    const baseModel = await runtime.getModel(modelText, { importBaseURL });
    runnable = runtime
      ._loadModelFromModelDef(baseModel._modelDef)
      .loadQuery(query);
  }

  const rowLimit = (await runnable.getPreparedResult()).resultExplore.limit;
  return runnable.run({ rowLimit });
}
