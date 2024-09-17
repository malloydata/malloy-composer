import {
  FieldDef,
  FilterCondition,
  Model,
  ModelDef,
  NamedQuery,
  PreparedQuery,
  QueryFieldDef,
  StructDef,
} from "@malloydata/malloy";
import { maybeQuoteIdentifier } from "./utils";

export type CompileHandler = (
  modelDef: ModelDef,
  malloy: string
) => Promise<Model>;

const DEFAULT_NAME = "new_query";

export class DummyCompile {
  compile: CompileHandler;
  constructor({ compile }: { compile: CompileHandler }) {
    this.compile = compile;
  }
  async _compileModel(modelDef: ModelDef, malloy: string): Promise<Model> {
    // TODO maybe a ModelMaterializer should have a `loadExtendingModel()` or something like that for this....
    const model = await this.compile(modelDef, malloy);
    return model;
  }

  async compileModel(modelDef: ModelDef, malloy: string): Promise<ModelDef> {
    return (await this._compileModel(modelDef, malloy))._modelDef;
  }

  modelDefForSource(source: StructDef): ModelDef {
    return {
      name: "model",
      exports: [],
      contents: { [source.as || source.name]: source },
    };
  }

  async compileFilter(
    source: StructDef,
    filter: string
  ): Promise<FilterCondition> {
    const malloy = `query: the_query is ${
      source.as || source.name
    } -> { group_by: one is 1; where: ${filter}}`;
    const modelDef = this.modelDefForSource(source);
    const model = await this.compileModel(modelDef, malloy);
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

  async compileGroupBy(
    source: StructDef,
    name: string,
    expression: string
  ): Promise<QueryFieldDef> {
    const quotedName = maybeQuoteIdentifier(name);
    const groupBy = expression ? `${quotedName} is ${expression}` : quotedName;
    const malloy = `query: the_query is ${maybeQuoteIdentifier(
      source.as || source.name
    )} -> { group_by: ${groupBy} }`;
    const modelDef = this.modelDefForSource(source);
    const model = await this.compileModel(modelDef, malloy);
    const theQuery = model.contents["the_query"];
    if (theQuery.type !== "query") {
      throw new Error("Expected the_query to be a query");
    }
    const segment = theQuery.pipeline[0];
    if (segment.type !== "reduce") {
      throw new Error("Expected the query to be a reduce query");
    }
    const fieldList = segment.queryFields;
    if (fieldList === undefined) {
      throw new Error("Expected a field list");
    }
    return fieldList[0];
  }

  async compileDimension(
    source: StructDef,
    name: string,
    dimension: string
  ): Promise<FieldDef> {
    const malloy = `query: the_query is ${
      source.as || source.name
    } -> { group_by: ${name} is ${dimension} }`;
    const modelDef = this.modelDefForSource(source);
    const model = await this.compileModel(modelDef, malloy);
    const theQuery = model.contents["the_query"];
    if (theQuery.type !== "query") {
      throw new Error("Expected the_query to be a query");
    }
    const segment = theQuery.pipeline[0];
    if (segment.type !== "reduce") {
      throw new Error("Expected query to be a reduce query");
    }
    const field = segment.queryFields[0];
    if (typeof field === "string") {
      throw new Error("Expected field definition, not reference");
    } else if (field.type === "fieldref") {
      throw new Error("Expected field definition, not field reference");
    }
    return field;
  }

  async compileMeasure(
    source: StructDef,
    name: string,
    measure: string
  ): Promise<FieldDef> {
    const malloy = `query: the_query is ${
      source.as || source.name
    } -> { aggregate: ${name} is ${measure} }`;
    const modelDef = this.modelDefForSource(source);
    const model = await this.compileModel(modelDef, malloy);
    const theQuery = model.contents["the_query"];
    if (theQuery.type !== "query") {
      throw new Error("Expected the_query to be a query");
    }
    const segment = theQuery.pipeline[0];
    if (segment.type !== "reduce") {
      throw new Error("Expected query to be a reduce query");
    }
    const field = segment.queryFields[0];
    if (typeof field === "string") {
      throw new Error("Expected field definiton, not reference");
    } else if (field.type === "fieldref") {
      throw new Error("Expected field definition, not field reference");
    }
    return field;
  }

  async _compileQuery(
    modelDef: ModelDef,
    query: string
  ): Promise<PreparedQuery> {
    const model = await this._compileModel(modelDef, query);
    const regex = /\s*query\s*:\s*([^\s]*)\s*is/;
    const match = query.match(regex);
    const preparedQuery = match
      ? model.getPreparedQueryByName(match[1])
      : model.preparedQuery;
    return preparedQuery;
  }

  async compileQueryToSQL(modelDef: ModelDef, query: string): Promise<string> {
    const preparedQuery = await this._compileQuery(modelDef, query);
    return preparedQuery.preparedResult.sql;
  }

  async compileQuery(modelDef: ModelDef, query: string): Promise<NamedQuery> {
    const preparedQuery = await this._compileQuery(modelDef, query);
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

  async getSourceNameForQuery(
    modelDef: ModelDef,
    query: string
  ): Promise<string> {
    const model = await this._compileModel(modelDef, query);
    const regex = /\s*query\s*:\s*([^\s]*)\s*is/;
    const match = query.match(regex);
    const preparedQuery = match
      ? model.getPreparedQueryByName(match[1])
      : model.preparedQuery;
    return preparedQuery.preparedResult._sourceExploreName;
  }
}
