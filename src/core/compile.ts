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
  FixedConnectionMap,
  Malloy,
  MalloyQueryData,
  Model,
  ModelDef,
  Runtime,
  SourceDef,
  URLReader,
  NamedQuery,
  PreparedQuery,
  QueryRunStats,
  SQLSourceDef,
  TableSourceDef,
} from '@malloydata/malloy';
import {BaseConnection} from '@malloydata/malloy/connection';

class DummyFiles implements URLReader {
  async readURL(): Promise<string> {
    return '';
  }
}

class DummyConnection extends BaseConnection {
  name = 'dummy';

  dialectName = 'duckdb';

  estimateQueryCost(_sqlCommand: string): Promise<QueryRunStats> {
    throw new Error('Dummy connection cannot estimate query cost');
  }

  runSQL(): Promise<MalloyQueryData> {
    throw new Error('Dummy connection cannot run SQL.');
  }

  runSQLBlockAndFetchResultSchema(): Promise<{
    data: MalloyQueryData;
    schema: SourceDef;
  }> {
    throw new Error('Dummy connection cannot run SQL blocks.');
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

async function compileModel(
  modelDef: ModelDef,
  malloy: string
): Promise<Model> {
  const runtime = new Runtime(new DummyFiles(), new DummyConnection());
  const baseModel = await runtime._loadModelFromModelDef(modelDef).getModel();
  // TODO maybe a ModelMaterializer should have a `loadExtendingModel()` or something like that for this....
  const model = await Malloy.compile({
    urlReader: new DummyFiles(),
    connections: new FixedConnectionMap(
      new Map([['dummy', new DummyConnection()]]),
      'dummy'
    ),
    model: baseModel,
    parse: Malloy.parse({source: malloy}),
  });
  return model;
}

const DEFAULT_NAME = 'new_query';
async function _compileQuery(
  modelDef: ModelDef,
  query: string
): Promise<PreparedQuery> {
  const model = await compileModel(modelDef, query);
  const regex = /\bquery\s*:\s*([^\s]*)\s*is\b/;
  const match = query.match(regex);
  const preparedQuery = match
    ? model.getPreparedQueryByName(match[1])
    : model.preparedQuery;
  return preparedQuery;
}

export async function compileQuery(
  modelDef: ModelDef,
  query: string
): Promise<NamedQuery> {
  const preparedQuery = await _compileQuery(modelDef, query);
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

export async function getSourceNameForQuery(
  modelDef: ModelDef,
  query: string
): Promise<string> {
  const model = await compileModel(modelDef, query);
  const regex = /\bquery\s*:\s*([^\s]*)\s*is\b/;
  const match = query.match(regex);
  const preparedQuery = match
    ? model.getPreparedQueryByName(match[1])
    : model.preparedQuery;
  return preparedQuery.preparedResult._sourceExploreName;
}
