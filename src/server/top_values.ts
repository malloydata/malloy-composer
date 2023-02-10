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

import { Runtime, SearchValueMapResult, StructDef } from "@malloydata/malloy";
import { getConfig } from "./config";
import { CONNECTION_MANAGER } from "./connections";
import { URL_READER } from "./urls";
import * as path from "path";

export async function topValues(
  source: StructDef,
  modelPath: string
): Promise<SearchValueMapResult[] | undefined> {
  const { workingDirectory } = await getConfig();
  const modelURL = new URL("file://" + path.join(workingDirectory, modelPath));
  const sourceName = source.as || source.name;
  const connections = CONNECTION_MANAGER.getConnectionLookup(modelURL);
  const runtime = new Runtime(URL_READER, connections);
  return runtime.loadModel(modelURL).searchValueMap(sourceName);
}
