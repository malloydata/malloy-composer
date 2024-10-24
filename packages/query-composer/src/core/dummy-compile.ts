/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import {
  FieldDef,
  FilterCondition,
  FixedConnectionMap,
  Malloy,
  MalloyQueryData,
  Model,
  ModelDef,
  NamedQuery,
  PreparedQuery,
  QueryFieldDef,
  Runtime,
  SQLSourceDef,
  StructDef,
  TableSourceDef,
  URLReader,
} from '@malloydata/malloy';
import {maybeQuoteIdentifier} from './utils';
import {BaseConnection} from '@malloydata/malloy/connection';

const DEFAULT_NAME = 'new_query';

export class DummyReader implements URLReader {
  async readURL(_url: URL): Promise<string> {
    throw new Error('Dummy reader cannot read files');
  }
}

export class DummyConnection extends BaseConnection {
  name = 'dummy';

  dialectName = 'duckdb';

  runSQL(): Promise<MalloyQueryData> {
    throw new Error('Dummy connection cannot run SQL.');
  }

  fetchSelectSchema(_sqlSource: SQLSourceDef): Promise<SQLSourceDef | string> {
    throw new Error('Dummy connection cannot fetch schemas.');
  }

  fetchTableSchema(
    _tableName: string,
    _tablePath: string
  ): Promise<TableSourceDef | string> {
    throw new Error('Dummy connection cannot fetch schemas.');
  }
}

export class DummyCompile {
  private async _compileModel(
    modelDef: ModelDef,
    malloy: string
  ): Promise<Model> {
    const runtime = new Runtime(new DummyReader(), new DummyConnection());
    const baseModel = await runtime._loadModelFromModelDef(modelDef).getModel();
    // TODO maybe a ModelMaterializer should have a `loadExtendingModel()` or something like that for this....
    const model = await Malloy.compile({
      urlReader: new DummyReader(),
      connections: new FixedConnectionMap(
        new Map([['dummy', new DummyConnection()]]),
        'dummy'
      ),
      model: baseModel,
      parse: Malloy.parse({source: malloy}),
    });
    return model;
  }

  public async compileModel(
    modelDef: ModelDef,
    malloy: string
  ): Promise<ModelDef> {
    return (await this._compileModel(modelDef, malloy))._modelDef;
  }

  private modelDefForSource(source: StructDef): ModelDef {
    return {
      name: 'model',
      exports: [],
      contents: {[source.as || source.name]: source},
    };
  }

  public async compileFilter(
    source: StructDef,
    filter: string
  ): Promise<FilterCondition> {
    const name = source.as || source.name;
    const whereMalloy = `query: the_query is ${name} -> { group_by: one is 1; where: ${filter}}`;
    const havingMalloy = `query: the_query is ${name} -> { group_by: one is 1; having: ${filter}}`;
    const modelDef = this.modelDefForSource(source);
    let model;
    try {
      // Try first as scalar
      model = await this.compileModel(modelDef, whereMalloy);
    } catch (_e) {
      // Retry as aggregate
      model = await this.compileModel(modelDef, havingMalloy);
    }
    const theQuery = model.contents['the_query'];
    if (theQuery.type !== 'query') {
      throw new Error('Expected the_query to be a query');
    }
    const filterList = theQuery.pipeline[0].filterList;
    if (filterList === undefined) {
      throw new Error('Expected a filter list');
    }
    return filterList[0];
  }

  public async compileGroupBy(
    source: StructDef,
    name: string,
    expression: string | undefined
  ): Promise<QueryFieldDef> {
    const quotedName = maybeQuoteIdentifier(name);
    const groupBy = expression ? `${quotedName} is ${expression}` : quotedName;
    const malloy = `query: the_query is ${maybeQuoteIdentifier(
      source.as || source.name
    )} -> { group_by: ${groupBy} }`;
    const modelDef = this.modelDefForSource(source);
    const model = await this.compileModel(modelDef, malloy);
    const theQuery = model.contents['the_query'];
    if (theQuery.type !== 'query') {
      throw new Error('Expected the_query to be a query');
    }
    const segment = theQuery.pipeline[0];
    if (segment.type !== 'reduce') {
      throw new Error('Expected the query to be a reduce query');
    }
    const fieldList = segment.queryFields;
    if (fieldList === undefined) {
      throw new Error('Expected a field list');
    }
    return fieldList[0];
  }

  public async compileDimension(
    source: StructDef,
    name: string,
    dimension: string
  ): Promise<FieldDef> {
    const malloy = `query: the_query is ${
      source.as || source.name
    } -> { group_by: ${name} is ${dimension} }`;
    const modelDef = this.modelDefForSource(source);
    const model = await this.compileModel(modelDef, malloy);
    const theQuery = model.contents['the_query'];
    if (theQuery.type !== 'query') {
      throw new Error('Expected the_query to be a query');
    }
    const segment = theQuery.pipeline[0];
    if (segment.type !== 'reduce') {
      throw new Error('Expected query to be a reduce query');
    }
    const field = segment.queryFields[0];
    if (typeof field === 'string') {
      throw new Error('Expected field definition, not reference');
    } else if (field.type === 'fieldref') {
      throw new Error('Expected field definition, not field reference');
    }
    return field;
  }

  public async compileMeasure(
    source: StructDef,
    name: string,
    measure: string
  ): Promise<FieldDef> {
    const malloy = `query: the_query is ${
      source.as || source.name
    } -> { aggregate: ${name} is ${measure} }`;
    const modelDef = this.modelDefForSource(source);
    const model = await this.compileModel(modelDef, malloy);
    const theQuery = model.contents['the_query'];
    if (theQuery.type !== 'query') {
      throw new Error('Expected the_query to be a query');
    }
    const segment = theQuery.pipeline[0];
    if (segment.type !== 'reduce') {
      throw new Error('Expected query to be a reduce query');
    }
    const field = segment.queryFields[0];
    if (typeof field === 'string') {
      throw new Error('Expected field definition, not reference');
    } else if (field.type === 'fieldref') {
      throw new Error('Expected field definition, not field reference');
    }
    return field;
  }

  private async _compileQuery(
    modelDef: ModelDef,
    query: string
  ): Promise<PreparedQuery> {
    const model = await this._compileModel(modelDef, query);
    const regex = /\bquery\s*:\s*([^\s]*)\s*is\b/;
    const match = query.match(regex);
    const preparedQuery = match
      ? model.getPreparedQueryByName(match[1])
      : model.preparedQuery;
    return preparedQuery;
  }

  public async compileQueryToSQL(
    modelDef: ModelDef,
    query: string
  ): Promise<string> {
    const preparedQuery = await this._compileQuery(modelDef, query);
    return preparedQuery.preparedResult.sql;
  }

  public async compileQuery(
    modelDef: ModelDef,
    query: string
  ): Promise<NamedQuery> {
    const preparedQuery = await this._compileQuery(modelDef, query);
    const name =
      'as' in preparedQuery._query
        ? preparedQuery._query.as || preparedQuery._query.name
        : DEFAULT_NAME;
    return {
      ...preparedQuery._query,
      type: 'query',
      name,
    };
  }

  public async getSourceNameForQuery(
    modelDef: ModelDef,
    query: string
  ): Promise<string> {
    const model = await this._compileModel(modelDef, query);
    const regex = /\bquery\s*:\s*([^\s]*)\s*is\b/;
    const match = query.match(regex);
    const preparedQuery = match
      ? model.getPreparedQueryByName(match[1])
      : model.preparedQuery;
    return preparedQuery.preparedResult._sourceExploreName;
  }
}
