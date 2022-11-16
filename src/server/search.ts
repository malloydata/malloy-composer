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

import { Runtime, SearchIndexResult, StructDef } from "@malloydata/malloy";
import { getConfig } from "./config";
import { CONNECTION_MANAGER } from "./connections";
import { URL_READER } from "./urls";
import * as path from "path";

export async function searchIndex(
  source: StructDef,
  modelPath: string,
  searchTerm: string,
  fieldPath?: string
): Promise<SearchIndexResult[] | undefined> {
  const { workingDirectory } = await getConfig();
  const modelURL = new URL("file://" + path.join(workingDirectory, modelPath));
  const sourceName = source.as || source.name;
  const connections = CONNECTION_MANAGER.getConnectionLookup(modelURL);
  const runtime = new Runtime(URL_READER, connections);
  return runtime
    .loadModel(modelURL)
    .search(sourceName, searchTerm, undefined, fieldPath);
}
