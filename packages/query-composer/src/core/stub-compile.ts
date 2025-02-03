/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
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
  SourceDef,
  TableSourceDef,
  URLReader,
} from '@malloydata/malloy';
import {maybeQuoteIdentifier} from './utils';
import {BaseConnection} from '@malloydata/malloy/connection';
import {QuerySegment} from '@malloydata/malloy/dist/model';

const DEFAULT_NAME = 'new_query';

export class StubReader implements URLReader {
  async readURL(_url: URL): Promise<string> {
    throw new Error('Stub reader cannot read files');
  }
}

export class StubConnection extends BaseConnection {
  name = 'stub';

  constructor(public dialectName: string) {
    super();
  }

  runSQL(): Promise<MalloyQueryData> {
    throw new Error('Stub connection cannot run SQL.');
  }

  fetchSelectSchema(_sqlSource: SQLSourceDef): Promise<SQLSourceDef | string> {
    throw new Error('Stub connection cannot fetch schemas.');
  }

  fetchTableSchema(
    _tableName: string,
    _tablePath: string
  ): Promise<TableSourceDef | string> {
    throw new Error('Stub connection cannot fetch schemas.');
  }
}

export class StubCompile {
  private async _compileModel(
    modelDef: ModelDef,
    malloy: string,
    dialectName: string
  ): Promise<Model> {
    const urlReader = new StubReader();
    const connection = new StubConnection(dialectName);
    const runtime = new Runtime({urlReader, connection});
    const baseModel = await runtime._loadModelFromModelDef(modelDef).getModel();
    // TODO maybe a ModelMaterializer should have a `loadExtendingModel()` or something like that for this....
    const model = await Malloy.compile({
      urlReader: new StubReader(),
      connections: new FixedConnectionMap(
        new Map([['stub', connection]]),
        'stub'
      ),
      model: baseModel,
      parse: Malloy.parse({source: malloy}),
    });
    return model;
  }

  public async compileModel(
    modelDef: ModelDef,
    malloy: string,
    dialectName: string
  ): Promise<ModelDef> {
    return (await this._compileModel(modelDef, malloy, dialectName))._modelDef;
  }

  private modelDefForSource(source: SourceDef): ModelDef {
    return {
      name: 'model',
      exports: [],
      contents: {[source.as || source.name]: source},
      queryList: [],
      dependencies: {},
    };
  }

  private async compile(
    source: SourceDef,
    malloy: string
  ): Promise<QuerySegment> {
    const modelDef = this.modelDefForSource(source);
    const model = await this.compileModel(modelDef, malloy, source.dialect);
    const theQuery = model.contents['the_query'];
    if (theQuery.type !== 'query') {
      throw new Error('Expected the_query to be a query');
    }
    const segment = theQuery.pipeline[0];
    if (segment.type !== 'reduce') {
      throw new Error('Expected the query to be a reduce query');
    }
    return segment;
  }

  public async compileFilter(
    source: SourceDef,
    filter: string
  ): Promise<FilterCondition> {
    const name = source.as || source.name;
    const whereMalloy = `query: the_query is ${name} -> { group_by: one is 1; where: ${filter}}`;
    const havingMalloy = `query: the_query is ${name} -> { group_by: one is 1; having: ${filter}}`;
    let segment: QuerySegment;
    try {
      // Try first as scalar
      segment = await this.compile(source, whereMalloy);
    } catch (_e) {
      // Retry as aggregate
      segment = await this.compile(source, havingMalloy);
    }
    const filterList = segment.filterList;
    if (filterList === undefined) {
      throw new Error('Expected a filter list');
    }
    return filterList[0];
  }

  private async compileToField(
    source: SourceDef,
    malloy: string
  ): Promise<QueryFieldDef> {
    const segment = await this.compile(source, malloy);
    const fieldList = segment.queryFields;
    if (fieldList === undefined) {
      throw new Error('Expected a field list');
    }
    const field = segment.queryFields[0];
    if (typeof field === 'string') {
      throw new Error('Expected field definition, not reference');
    } else if (field.type === 'fieldref') {
      throw new Error('Expected field definition, not field reference');
    }
    return field;
  }

  public async compileGroupBy(
    source: SourceDef,
    name: string,
    expression: string | undefined
  ): Promise<QueryFieldDef> {
    const quotedName = maybeQuoteIdentifier(name);
    const groupBy = expression ? `${quotedName} is ${expression}` : quotedName;
    const malloy = `query: the_query is ${maybeQuoteIdentifier(
      source.as || source.name
    )} -> { group_by: ${groupBy} }`;
    return this.compileToField(source, malloy);
  }

  public async compileDimension(
    source: SourceDef,
    name: string,
    dimension: string
  ): Promise<QueryFieldDef> {
    const malloy = `query: the_query is ${
      source.as || source.name
    } -> { group_by: ${name} is ${dimension} }`;
    return this.compileToField(source, malloy);
  }

  public async compileAggregate(
    source: SourceDef,
    name: string,
    aggregate: string
  ): Promise<QueryFieldDef> {
    const malloy = `query: the_query is ${
      source.as || source.name
    } -> { aggregate: ${name} is ${aggregate} }`;
    return this.compileToField(source, malloy);
  }

  public async compileCalculate(
    source: SourceDef,
    name: string,
    calculate: string
  ): Promise<QueryFieldDef> {
    const malloy = `query: the_query is ${
      source.as || source.name
    } -> { calculate: ${name} is ${calculate}; group_by: one is 1 }`;
    return this.compileToField(source, malloy);
  }

  public async compileMeasure(
    source: SourceDef,
    name: string,
    measure: string
  ) {
    let field: QueryFieldDef;
    try {
      // Try first as scalar
      field = await this.compileAggregate(source, name, measure);
    } catch (_e) {
      // Retry as aggregate
      field = await this.compileCalculate(source, name, measure);
    }
    return field;
  }

  public async compileSelect(
    source: SourceDef,
    name: string,
    expression: string | undefined
  ): Promise<QueryFieldDef> {
    const quotedName = maybeQuoteIdentifier(name);
    const select = expression ? `${quotedName} is ${expression}` : quotedName;
    const malloy = `query: the_query is ${maybeQuoteIdentifier(
      source.as || source.name
    )} -> { select: ${select} }`;
    return this.compileToField(source, malloy);
  }

  private async _compileQuery(
    modelDef: ModelDef,
    query: string,
    dialectName: string
  ): Promise<PreparedQuery> {
    const model = await this._compileModel(modelDef, query, dialectName);
    const regex = /\bquery\s*:\s*([^\s]*)\s*is\b/;
    const match = query.match(regex);
    const preparedQuery = match
      ? model.getPreparedQueryByName(match[1])
      : model.preparedQuery;
    return preparedQuery;
  }

  public async compileQueryToSQL(
    modelDef: ModelDef,
    query: string,
    dialectName: string
  ): Promise<string> {
    const preparedQuery = await this._compileQuery(
      modelDef,
      query,
      dialectName
    );
    return preparedQuery.preparedResult.sql;
  }

  public async compileQuery(
    modelDef: ModelDef,
    query: string
  ): Promise<NamedQuery> {
    const preparedQuery = await this._compileQuery(modelDef, query, 'duckdb');
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
    const model = await this._compileModel(modelDef, query, 'duckdb');
    const regex = /\bquery\s*:\s*([^\s]*)\s*is\b/;
    const match = query.match(regex);
    const preparedQuery = match
      ? model.getPreparedQueryByName(match[1])
      : model.preparedQuery;
    return preparedQuery.preparedResult._sourceExploreName;
  }
}
