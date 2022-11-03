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

import { DuckDBWASMConnection } from "@malloydata/db-duckdb/dist/duckdb_wasm_connection";
import * as malloy from "@malloydata/malloy";
import { QueryWriter } from "../../core/query";
import * as explore from "../../types";

export class DuckDBWasmLookup
  implements malloy.LookupConnection<DuckDBWASMConnection>
{
  connection: DuckDBWASMConnection;

  constructor() {
    this.connection = new DuckDBWASMConnection("duckdb");
  }

  async lookupConnection(_name: string): Promise<DuckDBWASMConnection> {
    await this.connection.connecting;
    return this.connection;
  }
}

export const fetchFile = async (url: URL): Promise<string> => {
  const body = await fetch(url);
  return body.text();
};

export class BrowserURLReader implements malloy.URLReader {
  private contents: Record<string, string> = {};

  setContents(url: string, value: string): void {
    this.contents[url] = value;
  }

  async readURL(url: URL): Promise<string> {
    const key = url.toString();
    if (key in this.contents) {
      return this.contents[key];
    } else {
      return fetchFile(url);
    }
  }
}

// TODO gross singleton...
const URL_READER = new BrowserURLReader();
const DUCKDB_WASM = new DuckDBWasmLookup();
const RUNTIME = new malloy.Runtime(URL_READER, DUCKDB_WASM);

interface SampleEntry {
  name: string;
  dataTables: string[];
  modelPath: string;
  readme: string;
  styles: string;
}

export async function directory(): Promise<explore.Directory> {
  const base = window.location.href;
  const samplesURL = new URL("composer.json", base);
  const response = await URL_READER.readURL(samplesURL);
  const samples = JSON.parse(response);
  const contents = await Promise.all(samples.map(async (sample: SampleEntry) => {
    const connection = await DUCKDB_WASM.lookupConnection("duckdb");
    await Promise.all(sample.dataTables.map((tableName) => {
      return connection.database?.registerFileURL(
        tableName,
        new URL(tableName, base).toString()
      );
    }));
    const modelURL = new URL(sample.modelPath, base);
    const malloy = await URL_READER.readURL(modelURL);
    // TODO README on a per model or "dataset" basis
    // const readme = sample.readme && await URL_READER.readURL(new URL(sample.readme, base));
    const styles = sample.styles && await URL_READER.readURL(new URL(sample.styles, base));
    const model = await RUNTIME.getModel(modelURL);
    return {
      type: "model",
      malloy,
      path: sample.modelPath,
      fullPath: modelURL.toString(),
      sources: model.explores,
      modelDef: model._modelDef,
      dataStyles: styles ? JSON.parse(styles) : {},
    }
  }));
  return {
    type: "directory",
    path: "/",
    fullPath: window.location.hostname,
    contents,
  };
}

export async function models(): Promise<explore.Model[]> {
  return [];
}

export async function runQuery(
  query: string,
  queryName: string,
  analysis?: explore.Analysis
): Promise<Error | malloy.Result> {
  const runnable = RUNTIME.loadModel(
    analysis.malloy + "\n" + query
  ).loadQueryByName(queryName);
  const rowLimit = (await runnable.getPreparedResult()).resultExplore.limit;
  return runnable.run({ rowLimit });
}

function mapField(
  field: malloy.Field,
  path: string | undefined
): explore.SchemaField {
  const newPath = path !== undefined ? `${path}.${field.name}` : field.name;
  if (field.isExploreField()) {
    return {
      name: field.name,
      path: newPath,
      type: "source",
      kind: "source",
      fields: field.allFields.map((field) => mapField(field, newPath)),
    };
  } else if (field.isQueryField()) {
    return {
      name: field.name,
      path: newPath,
      type: "query",
      kind: "query",
    };
  } else {
    const kind = field.isAggregate() ? "measure" : "dimension";
    return {
      name: field.name,
      path: newPath,
      type: field.type,
      kind,
    };
  }
}

export async function schema(analysis: explore.Analysis): Promise<
  | Error
  | {
      schema: explore.Schema;
      modelDef: malloy.ModelDef;
      malloy: string;
    }
> {
  const malloy = analysis.fullPath
    ? analysis.malloy // await fs.readFile(analysis.fullPath, "utf8")
    : analysis.malloy;
  const model = await RUNTIME.getModel(malloy);
  const source = model.explores.find(
    (source) => source.name === analysis.sourceName
  );
  if (source === undefined) {
    throw new Error(
      `Invalid analysis: no source with name ${analysis.sourceName}`
    );
  }
  return {
    schema: {
      fields: source.allFields.map((field) => mapField(field, undefined)),
    },
    modelDef: model._modelDef,
    malloy: malloy,
  };
}

export async function search(
  source: malloy.StructDef,
  _analysisPath: string,
  searchTerm: string,
  fieldPath?: string
): Promise<malloy.SearchIndexResult[] | undefined | Error> {
  const sourceName = source.as || source.name;
  return RUNTIME._loadModelFromModelDef({
    name: "_generated",
    contents: { [sourceName]: source },
    exports: [],
  }).search(sourceName, searchTerm, undefined, fieldPath);
}

export async function topValues(
  source: malloy.StructDef,
  analysisPath: string
): Promise<malloy.SearchValueMapResult[] | undefined> {
  const sourceName = source.as || source.name;
  return RUNTIME
    ._loadModelFromModelDef({
      name: "_generated",
      contents: { [sourceName]: source },
      exports: [],
    })
    .searchValueMap(sourceName);
}


function codeBefore(
  code: string,
  location: { line: number; character: number }
) {
  const lines = code.split("\n");
  const wellBefore = lines.slice(0, location.line);
  const before = lines[location.line].substring(0, location.character);
  return wellBefore.join("\n") + "\n" + before;
}

function codeAfter(
  code: string,
  location: { line: number; character: number }
) {
  const lines = code.split("\n");
  const wellAfter = lines.slice(location.line + 1);
  const after = lines[location.line].substring(location.character);
  return after + "\n" + wellAfter.join("\n");
}

function indent(str: string) {
  return str
    .split("\n")
    .map((line) => "  " + line)
    .join("\n");
}

function indentExceptFirstLine(str: string) {
  const lines = str.split("\n");
  return (
    lines[0] +
    "\n" +
    lines
      .slice(1)
      .map((line) => "  " + line)
      .join("\n")
  );
}

export async function saveField(
  type: "query" | "dimension" | "measure",
  field: malloy.FieldDef,
  name: string,
  analysis: explore.Analysis
): Promise<explore.Analysis> {
  const model = await RUNTIME.getModel(analysis.malloy);
  const source = model._modelDef.contents[analysis.sourceName];
  if (source.type !== "struct") {
    throw new Error("Wrong type for source.");
  }
  if (field.type === "struct") {
    throw new Error("Invalid field to save");
  }
  const fieldString =
    field.type === "turtle"
      ? new QueryWriter(field, source).getQueryStringForSource(name)
      : `${name} is ${field.code}`;
  if (fieldString === undefined) {
    throw new Error("Expected field to have code.");
  }
  const explore = model.getExploreByName(analysis.sourceName);
  const existingField = explore.allFields.find((field) => field.name === name);
  if (existingField && typeOf(existingField) !== field.type) {
    throw new Error("Cannot overwrite field of differing type");
  }
  let newMalloy;
  if (existingField) {
    const existingLocation = locationOf(existingField);
    if (existingLocation?.url === `internal://internal.malloy`) {
      newMalloy =
        codeBefore(analysis.malloy, existingLocation.range.start) +
        indentExceptFirstLine(fieldString) +
        codeAfter(analysis.malloy, existingLocation.range.end);
    } else {
      newMalloy = analysis.malloy.replace(
        /\}\s*$/,
        "\n" + indent(`${type}: ${fieldString}`) + "\n}"
      );
    }
  } else {
    newMalloy = analysis.malloy.replace(
      /\}\s*$/,
      "\n" + indent(`${type}: ${fieldString}`) + "\n}"
    );
  }
  const newModel = await RUNTIME.getModel(newMalloy);
  return {
    ...analysis,
    malloy: newMalloy,
    modelDef: newModel._modelDef,
  };
}

function locationOf(existingField: malloy.Field) {
  if (existingField.isQueryField()) {
    return (existingField as unknown as { turtleDef: malloy.TurtleDef }).turtleDef
      .location;
  } else if (existingField.isAtomicField()) {
    return (existingField as unknown as { fieldTypeDef: malloy.FieldTypeDef })
      .fieldTypeDef.location;
  }
}

function typeOf(existingField: malloy.Field) {
  if (existingField.isQueryField()) {
    return (existingField as unknown as { turtleDef: malloy.TurtleDef }).turtleDef
      .type;
  } else if (existingField.isAtomicField()) {
    return (existingField as unknown as { fieldTypeDef: malloy.FieldTypeDef })
      .fieldTypeDef.type;
  }
}
