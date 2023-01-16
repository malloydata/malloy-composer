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
import {
  Connection,
  FieldDef,
  FilterExpression,
  FixedConnectionMap,
  isFilteredAliasedName,
  Malloy,
  MalloyQueryData,
  Model,
  ModelDef,
  PersistSQLResults,
  PooledConnection,
  Runtime,
  StreamingConnection,
  StructDef,
  URLReader,
  NamedQuery,
  PreparedQuery,
  QueryFieldDef,
} from "@malloydata/malloy";
import { maybeQuoteIdentifier } from "./utils";

class DummyFiles implements URLReader {
  async readURL(): Promise<string> {
    return "";
  }
}

class DummyConnection implements Connection {
  name = "dummy";

  runSQL(): Promise<MalloyQueryData> {
    throw new Error("Dummy connection cannot run SQL.");
  }

  runSQLBlockAndFetchResultSchema(): Promise<{
    data: MalloyQueryData;
    schema: StructDef;
  }> {
    throw new Error("Dummy connection cannot run SQL blocks.");
  }

  fetchSchemaForSQLBlock(): Promise<
    | { structDef: StructDef; error?: undefined }
    | { error: string; structDef?: undefined }
  > {
    throw new Error("Dummy connection cannot fetch schemas.");
  }

  fetchSchemaForSQLBlocks(): Promise<{
    schemas: Record<string, StructDef>;
    errors: Record<string, string>;
  }> {
    throw new Error("Dummy connection cannot fetch schemas.");
  }

  fetchSchemaForTables(): Promise<{
    schemas: Record<string, StructDef>;
    errors: Record<string, string>;
  }> {
    throw new Error("Dummy connection cannot fetch schemas.");
  }

  isPool(): this is PooledConnection {
    return false;
  }

  canPersist(): this is PersistSQLResults {
    return false;
  }

  canStream(): this is StreamingConnection {
    return false;
  }

  async close() {
    return;
  }
}

export async function _compileModel(
  modelDef: ModelDef,
  malloy: string
): Promise<Model> {
  const runtime = new Runtime(new DummyFiles(), new DummyConnection());
  const baseModel = await runtime._loadModelFromModelDef(modelDef).getModel();
  // TODO maybe a ModelMaterializer should have a `loadExtendingModel()` or something like that for this....
  const model = await Malloy.compile({
    urlReader: new DummyFiles(),
    connections: new FixedConnectionMap(
      new Map([["dummy", new DummyConnection()]]),
      "dummy"
    ),
    model: baseModel,
    parse: Malloy.parse({ source: malloy }),
  });
  return model;
}

export async function compileModel(
  modelDef: ModelDef,
  malloy: string
): Promise<ModelDef> {
  return (await _compileModel(modelDef, malloy))._modelDef;
}

function modelDefForSource(source: StructDef): ModelDef {
  return {
    name: "model",
    exports: [],
    contents: { [source.as || source.name]: source },
  };
}

export async function compileFilter(
  source: StructDef,
  filter: string
): Promise<FilterExpression> {
  const malloy = `query: the_query is ${
    source.as || source.name
  } -> { group_by: one is 1; where: ${filter}}`;
  const modelDef = modelDefForSource(source);
  const model = await compileModel(modelDef, malloy);
  const theQuery = model.contents["the_query"];
  if (theQuery.type !== "query") {
    throw new Error("Expected the_query to be a query");
  }
  const filterList = theQuery.pipeline[0].filterList;
  if (filterList === undefined) {
    throw new Error("Expected a filter list");
  }
  return filterList[0];
}

export async function compileGroupBy(
  source: StructDef,
  name: string,
  expression: string
): Promise<QueryFieldDef> {
  const quotedName = maybeQuoteIdentifier(name);
  const groupBy = expression ? `${quotedName} is ${expression}` : quotedName;
  const malloy = `query: the_query is ${maybeQuoteIdentifier(
    source.as || source.name
  )} -> { group_by: ${groupBy} }`;
  const modelDef = modelDefForSource(source);
  const model = await compileModel(modelDef, malloy);
  const theQuery = model.contents["the_query"];
  if (theQuery.type !== "query") {
    throw new Error("Expected the_query to be a query");
  }
  const fieldList = theQuery.pipeline[0].fields;
  if (fieldList === undefined) {
    throw new Error("Expected a field list");
  }
  return fieldList[0];
}

export async function compileDimension(
  source: StructDef,
  name: string,
  dimension: string
): Promise<FieldDef> {
  const malloy = `query: the_query is ${
    source.as || source.name
  } -> { group_by: ${name} is ${dimension} }`;
  const modelDef = modelDefForSource(source);
  const model = await compileModel(modelDef, malloy);
  const theQuery = model.contents["the_query"];
  if (theQuery.type !== "query") {
    throw new Error("Expected the_query to be a query");
  }
  const field = theQuery.pipeline[0].fields[0];
  if (typeof field === "string") {
    throw new Error("Expected field definition, not reference");
  } else if (isFilteredAliasedName(field)) {
    throw new Error("Expected field definition, not filtered aliased name");
  }
  return field;
}

export async function compileMeasure(
  source: StructDef,
  name: string,
  measure: string
): Promise<FieldDef> {
  const malloy = `query: the_query is ${
    source.as || source.name
  } -> { aggregate: ${name} is ${measure} }`;
  const modelDef = modelDefForSource(source);
  const model = await compileModel(modelDef, malloy);
  const theQuery = model.contents["the_query"];
  if (theQuery.type !== "query") {
    throw new Error("Expected the_query to be a query");
  }
  const field = theQuery.pipeline[0].fields[0];
  if (typeof field === "string") {
    throw new Error("Expected field definiton, not reference");
  } else if (isFilteredAliasedName(field)) {
    throw new Error("Expected field definition, not filtered aliased name");
  }
  return field;
}

const DEFAULT_NAME = "new_query";
async function _compileQuery(
  modelDef: ModelDef,
  query: string
): Promise<PreparedQuery> {
  const model = await _compileModel(modelDef, query);
  const regex = /\s*query\s*:\s*([^\s]*)\s*is/;
  const match = query.match(regex);
  let preparedQuery = match
    ? model.getPreparedQueryByName(match[1])
    : model.preparedQuery;
  if (preparedQuery._query.pipeHead) {
    preparedQuery = preparedQuery.getFlattenedQuery(DEFAULT_NAME);
  }
  return preparedQuery;
}

export async function compileQueryToSQL(
  modelDef: ModelDef,
  query: string
): Promise<string> {
  const preparedQuery = await _compileQuery(modelDef, query);
  return preparedQuery.preparedResult.sql;
}

export async function compileQuery(
  modelDef: ModelDef,
  query: string
): Promise<NamedQuery> {
  const preparedQuery = await _compileQuery(modelDef, query);
  const name =
    "as" in preparedQuery._query
      ? preparedQuery._query.as || preparedQuery._query.name
      : DEFAULT_NAME;
  return {
    ...preparedQuery._query,
    type: "query",
    name,
  };
}

export async function getSourceNameForQuery(
  modelDef: ModelDef,
  query: string
): Promise<string> {
  const model = await _compileModel(modelDef, query);
  const regex = /\s*query\s*:\s*([^\s]*)\s*is/;
  const match = query.match(regex);
  const preparedQuery = match
    ? model.getPreparedQueryByName(match[1])
    : model.preparedQuery;
  return preparedQuery.preparedResult._sourceExploreName;
}
