import {ModelDef} from '@malloydata/malloy';
import {getSourceDef} from '../src/core/models';

export const modelPath = '/names/names.malloy';

export const model: ModelDef = {
  name: '',
  exports: ['names', 'cohort', 'names2'],
  contents: {
    names: {
      type: 'table',
      name: 'duckdb:usa_names.parquet',
      dialect: 'duckdb',
      tablePath: 'usa_names.parquet',
      connection: 'duckdb',
      fields: [
        {
          type: 'string',
          name: 'state',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
        },
        {
          type: 'string',
          name: 'gender',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
        },
        {
          type: 'string',
          name: 'name',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
        },
        {
          type: 'number',
          numberType: 'integer',
          name: 'number',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
        },
        {
          type: 'number',
          numberType: 'integer',
          name: 'year',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 1,
                character: 10,
              },
              end: {
                line: 1,
                character: 29,
              },
            },
          },
          as: 'year_born',
        },
        {
          type: 'number',
          name: 'population',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 2,
                character: 11,
              },
              end: {
                line: 2,
                character: 39,
              },
            },
          },
          e: {
            node: 'aggregate',
            function: 'sum',
            e: {
              node: 'field',
              path: ['number'],
            },
          },
          expressionType: 'aggregate',
          code: '`number`.sum()',
        },
        {
          type: 'number',
          name: 'decade',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 3,
                character: 13,
              },
              end: {
                line: 3,
                character: 45,
              },
            },
          },
          e: {
            node: '*',
            kids: {
              left: {
                node: 'function_call',
                overload: {
                  returnType: {
                    type: 'number',
                    expressionType: 'scalar',
                    evalSpace: 'input',
                  },
                  params: [
                    {
                      name: 'value',
                      allowedTypes: [
                        {
                          type: 'number',
                          expressionType: undefined,
                          evalSpace: 'input',
                        },
                      ],
                      isVariadic: false,
                    },
                  ],
                  dialect: {
                    postgres: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    standardsql: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    duckdb: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    snowflake: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    trino: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    presto: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    mysql: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                  },
                  supportsOrderBy: undefined,
                  supportsLimit: undefined,
                  isSymmetric: undefined,
                },
                name: 'floor',
                kids: {
                  args: [
                    {
                      node: '/',
                      kids: {
                        left: {
                          node: 'field',
                          path: ['year_born'],
                        },
                        right: {
                          node: 'numberLiteral',
                          literal: '10',
                        },
                      },
                    },
                  ],
                },
                expressionType: 'scalar',
                structPath: undefined,
              },
              right: {
                node: 'numberLiteral',
                literal: '10',
              },
            },
          },
          expressionType: 'scalar',
          code: 'floor(year_born/10)*10',
        },
        {
          type: 'number',
          name: 'births_per_100k',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 4,
                character: 11,
              },
              end: {
                line: 4,
                character: 70,
              },
            },
          },
          e: {
            node: 'function_call',
            overload: {
              returnType: {
                type: 'number',
                expressionType: 'scalar',
                evalSpace: 'input',
              },
              params: [
                {
                  name: 'value',
                  allowedTypes: [
                    {
                      type: 'number',
                      expressionType: undefined,
                      evalSpace: 'input',
                    },
                  ],
                  isVariadic: false,
                },
              ],
              dialect: {
                postgres: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                standardsql: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                duckdb: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                snowflake: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                trino: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                presto: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                mysql: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
              },
              supportsOrderBy: undefined,
              supportsLimit: undefined,
              isSymmetric: undefined,
            },
            name: 'floor',
            kids: {
              args: [
                {
                  node: '*',
                  kids: {
                    left: {
                      node: '/',
                      kids: {
                        left: {
                          node: 'field',
                          path: ['population'],
                        },
                        right: {
                          node: 'all',
                          e: {
                            node: 'field',
                            path: ['population'],
                          },
                        },
                      },
                    },
                    right: {
                      node: 'numberLiteral',
                      literal: '100000',
                    },
                  },
                },
              ],
            },
            expressionType: 'ungrouped_aggregate',
            structPath: undefined,
          },
          expressionType: 'ungrouped_aggregate',
          code: 'floor(population/all(population)*100000)',
        },
        {
          type: 'turtle',
          name: 'by_name',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['name'],
                },
                {
                  type: 'fieldref',
                  path: ['population'],
                },
              ],
              limit: 10,
              filterList: [],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 5,
                character: 8,
              },
              end: {
                line: 9,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'by_state',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['state'],
                },
                {
                  type: 'fieldref',
                  path: ['births_per_100k'],
                },
              ],
              filterList: [],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 10,
                character: 8,
              },
              end: {
                line: 13,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'by_gender',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['gender'],
                },
                {
                  type: 'fieldref',
                  path: ['population'],
                },
              ],
              filterList: [],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 14,
                character: 8,
              },
              end: {
                line: 17,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'by_decade',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['decade'],
                },
                {
                  type: 'fieldref',
                  path: ['births_per_100k'],
                },
              ],
              orderBy: [
                {
                  field: 1,
                  dir: 'asc',
                },
              ],
              filterList: [],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 18,
                character: 8,
              },
              end: {
                line: 22,
                character: 3,
              },
            },
          },
        },
      ],
      location: {
        url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
        range: {
          start: {
            line: 0,
            character: 8,
          },
          end: {
            line: 22,
            character: 5,
          },
        },
      },
      parameters: {},
      as: 'names',
    },
    cohort: {
      type: 'query_source',
      name: 'QuerySource-b3b63624-76c1-4040-88d8-8b29f34d1802',
      fields: [
        {
          name: 'gender',
          type: 'string',
          resultMetadata: {
            sourceField: 'gender',
            sourceExpression: undefined,
            sourceClasses: ['gender'],
            referenceId: '78d989f2-ef9b-4775-b7e6-8b7d123da103',
            filterList: undefined,
            fieldKind: 'dimension',
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
          annotation: undefined,
        },
        {
          name: 'state',
          type: 'string',
          resultMetadata: {
            sourceField: 'state',
            sourceExpression: undefined,
            sourceClasses: ['state'],
            referenceId: '532fb076-890d-4356-953b-cebd825304f6',
            filterList: undefined,
            fieldKind: 'dimension',
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
          annotation: undefined,
        },
        {
          name: 'year_born',
          numberType: 'integer',
          type: 'number',
          resultMetadata: {
            sourceField: 'year',
            sourceExpression: undefined,
            sourceClasses: ['year'],
            referenceId: 'd5641b42-6ace-430b-9721-2bc9e5b644da',
            filterList: undefined,
            fieldKind: 'dimension',
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 1,
                character: 10,
              },
              end: {
                line: 1,
                character: 29,
              },
            },
          },
          annotation: undefined,
        },
        {
          name: 'cohort_size',
          numberType: undefined,
          type: 'number',
          resultMetadata: {
            sourceField: 'cohort_size',
            sourceExpression: 'population',
            sourceClasses: ['cohort_size'],
            referenceId: '21d605e0-6d9d-481c-8942-a5beb52f9f42',
            filterList: [],
            fieldKind: 'measure',
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 28,
                character: 13,
              },
              end: {
                line: 28,
                character: 38,
              },
            },
          },
          annotation: undefined,
        },
        {
          type: 'number',
          name: 'population',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 30,
                character: 11,
              },
              end: {
                line: 30,
                character: 42,
              },
            },
          },
          e: {
            node: 'aggregate',
            function: 'sum',
            e: {
              node: 'field',
              path: ['cohort_size'],
            },
          },
          expressionType: 'aggregate',
          code: 'cohort_size.sum()',
        },
      ],
      dialect: 'duckdb',
      primaryKey: undefined,
      connection: 'duckdb',
      resultMetadata: {
        sourceField: 'ignoreme',
        filterList: [],
        sourceClasses: ['ignoreme'],
        fieldKind: 'struct',
        limit: undefined,
        orderBy: undefined,
      },
      queryTimezone: undefined,
      query: {
        type: 'query',
        structRef: {
          type: 'table',
          name: 'duckdb:usa_names.parquet',
          dialect: 'duckdb',
          tablePath: 'usa_names.parquet',
          connection: 'duckdb',
          fields: [
            {
              type: 'string',
              name: 'state',
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 0,
                    character: 17,
                  },
                  end: {
                    line: 0,
                    character: 50,
                  },
                },
              },
            },
            {
              type: 'string',
              name: 'gender',
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 0,
                    character: 17,
                  },
                  end: {
                    line: 0,
                    character: 50,
                  },
                },
              },
            },
            {
              type: 'string',
              name: 'name',
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 0,
                    character: 17,
                  },
                  end: {
                    line: 0,
                    character: 50,
                  },
                },
              },
            },
            {
              type: 'number',
              numberType: 'integer',
              name: 'number',
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 0,
                    character: 17,
                  },
                  end: {
                    line: 0,
                    character: 50,
                  },
                },
              },
            },
            {
              type: 'number',
              numberType: 'integer',
              name: 'year',
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 1,
                    character: 10,
                  },
                  end: {
                    line: 1,
                    character: 29,
                  },
                },
              },
              as: 'year_born',
            },
            {
              type: 'number',
              name: 'population',
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 2,
                    character: 11,
                  },
                  end: {
                    line: 2,
                    character: 39,
                  },
                },
              },
              e: {
                node: 'aggregate',
                function: 'sum',
                e: {
                  node: 'field',
                  path: ['number'],
                },
              },
              expressionType: 'aggregate',
              code: '`number`.sum()',
            },
            {
              type: 'number',
              name: 'decade',
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 3,
                    character: 13,
                  },
                  end: {
                    line: 3,
                    character: 45,
                  },
                },
              },
              e: {
                node: '*',
                kids: {
                  left: {
                    node: 'function_call',
                    overload: {
                      returnType: {
                        type: 'number',
                        expressionType: 'scalar',
                        evalSpace: 'input',
                      },
                      params: [
                        {
                          name: 'value',
                          allowedTypes: [
                            {
                              type: 'number',
                              expressionType: undefined,
                              evalSpace: 'input',
                            },
                          ],
                          isVariadic: false,
                        },
                      ],
                      dialect: {
                        postgres: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        standardsql: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        duckdb: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        snowflake: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        trino: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        presto: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        mysql: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                      },
                      supportsOrderBy: undefined,
                      supportsLimit: undefined,
                      isSymmetric: undefined,
                    },
                    name: 'floor',
                    kids: {
                      args: [
                        {
                          node: '/',
                          kids: {
                            left: {
                              node: 'field',
                              path: ['year_born'],
                            },
                            right: {
                              node: 'numberLiteral',
                              literal: '10',
                            },
                          },
                        },
                      ],
                    },
                    expressionType: 'scalar',
                    structPath: undefined,
                  },
                  right: {
                    node: 'numberLiteral',
                    literal: '10',
                  },
                },
              },
              expressionType: 'scalar',
              code: 'floor(year_born/10)*10',
            },
            {
              type: 'number',
              name: 'births_per_100k',
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 4,
                    character: 11,
                  },
                  end: {
                    line: 4,
                    character: 70,
                  },
                },
              },
              e: {
                node: 'function_call',
                overload: {
                  returnType: {
                    type: 'number',
                    expressionType: 'scalar',
                    evalSpace: 'input',
                  },
                  params: [
                    {
                      name: 'value',
                      allowedTypes: [
                        {
                          type: 'number',
                          expressionType: undefined,
                          evalSpace: 'input',
                        },
                      ],
                      isVariadic: false,
                    },
                  ],
                  dialect: {
                    postgres: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    standardsql: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    duckdb: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    snowflake: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    trino: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    presto: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    mysql: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                  },
                  supportsOrderBy: undefined,
                  supportsLimit: undefined,
                  isSymmetric: undefined,
                },
                name: 'floor',
                kids: {
                  args: [
                    {
                      node: '*',
                      kids: {
                        left: {
                          node: '/',
                          kids: {
                            left: {
                              node: 'field',
                              path: ['population'],
                            },
                            right: {
                              node: 'all',
                              e: {
                                node: 'field',
                                path: ['population'],
                              },
                            },
                          },
                        },
                        right: {
                          node: 'numberLiteral',
                          literal: '100000',
                        },
                      },
                    },
                  ],
                },
                expressionType: 'ungrouped_aggregate',
                structPath: undefined,
              },
              expressionType: 'ungrouped_aggregate',
              code: 'floor(population/all(population)*100000)',
            },
            {
              type: 'turtle',
              name: 'by_name',
              pipeline: [
                {
                  type: 'reduce',
                  queryFields: [
                    {
                      type: 'fieldref',
                      path: ['name'],
                    },
                    {
                      type: 'fieldref',
                      path: ['population'],
                    },
                  ],
                  limit: 10,
                  filterList: [],
                },
              ],
              annotation: {
                inherits: undefined,
              },
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 5,
                    character: 8,
                  },
                  end: {
                    line: 9,
                    character: 3,
                  },
                },
              },
            },
            {
              type: 'turtle',
              name: 'by_state',
              pipeline: [
                {
                  type: 'reduce',
                  queryFields: [
                    {
                      type: 'fieldref',
                      path: ['state'],
                    },
                    {
                      type: 'fieldref',
                      path: ['births_per_100k'],
                    },
                  ],
                  filterList: [],
                },
              ],
              annotation: {
                inherits: undefined,
              },
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 10,
                    character: 8,
                  },
                  end: {
                    line: 13,
                    character: 3,
                  },
                },
              },
            },
            {
              type: 'turtle',
              name: 'by_gender',
              pipeline: [
                {
                  type: 'reduce',
                  queryFields: [
                    {
                      type: 'fieldref',
                      path: ['gender'],
                    },
                    {
                      type: 'fieldref',
                      path: ['population'],
                    },
                  ],
                  filterList: [],
                },
              ],
              annotation: {
                inherits: undefined,
              },
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 14,
                    character: 8,
                  },
                  end: {
                    line: 17,
                    character: 3,
                  },
                },
              },
            },
            {
              type: 'turtle',
              name: 'by_decade',
              pipeline: [
                {
                  type: 'reduce',
                  queryFields: [
                    {
                      type: 'fieldref',
                      path: ['decade'],
                    },
                    {
                      type: 'fieldref',
                      path: ['births_per_100k'],
                    },
                  ],
                  orderBy: [
                    {
                      field: 1,
                      dir: 'asc',
                    },
                  ],
                  filterList: [],
                },
              ],
              annotation: {
                inherits: undefined,
              },
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 18,
                    character: 8,
                  },
                  end: {
                    line: 22,
                    character: 3,
                  },
                },
              },
            },
          ],
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 8,
              },
              end: {
                line: 22,
                character: 5,
              },
            },
          },
          parameters: {},
          as: 'names',
          arguments: {},
        },
        pipeline: [
          {
            type: 'reduce',
            queryFields: [
              {
                type: 'fieldref',
                path: ['gender'],
              },
              {
                type: 'fieldref',
                path: ['state'],
              },
              {
                type: 'fieldref',
                path: ['year_born'],
              },
              {
                type: 'number',
                name: 'cohort_size',
                location: {
                  url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                  range: {
                    start: {
                      line: 28,
                      character: 13,
                    },
                    end: {
                      line: 28,
                      character: 38,
                    },
                  },
                },
                e: {
                  node: 'field',
                  path: ['population'],
                },
                expressionType: 'aggregate',
                code: 'population',
              },
            ],
            filterList: [],
          },
        ],
        location: {
          url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
          range: {
            start: {
              line: 26,
              character: 18,
            },
            end: {
              line: 30,
              character: 44,
            },
          },
        },
        name: undefined,
        annotation: undefined,
      },
      parameters: {},
      as: 'cohort',
      location: {
        url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
        range: {
          start: {
            line: 26,
            character: 8,
          },
          end: {
            line: 30,
            character: 44,
          },
        },
      },
    },
    names2: {
      type: 'table',
      name: 'duckdb:usa_names.parquet',
      dialect: 'duckdb',
      tablePath: 'usa_names.parquet',
      connection: 'duckdb',
      fields: [
        {
          type: 'string',
          name: 'state',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
        },
        {
          type: 'string',
          name: 'gender',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
        },
        {
          type: 'string',
          name: 'name',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
        },
        {
          type: 'number',
          numberType: 'integer',
          name: 'number',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 0,
                character: 17,
              },
              end: {
                line: 0,
                character: 50,
              },
            },
          },
        },
        {
          type: 'number',
          numberType: 'integer',
          name: 'year',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 1,
                character: 10,
              },
              end: {
                line: 1,
                character: 29,
              },
            },
          },
          as: 'year_born',
        },
        {
          type: 'number',
          name: 'population',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 2,
                character: 11,
              },
              end: {
                line: 2,
                character: 39,
              },
            },
          },
          e: {
            node: 'aggregate',
            function: 'sum',
            e: {
              node: 'field',
              path: ['number'],
            },
          },
          expressionType: 'aggregate',
          code: '`number`.sum()',
        },
        {
          type: 'number',
          name: 'decade',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 3,
                character: 13,
              },
              end: {
                line: 3,
                character: 45,
              },
            },
          },
          e: {
            node: '*',
            kids: {
              left: {
                node: 'function_call',
                overload: {
                  returnType: {
                    type: 'number',
                    expressionType: 'scalar',
                    evalSpace: 'input',
                  },
                  params: [
                    {
                      name: 'value',
                      allowedTypes: [
                        {
                          type: 'number',
                          expressionType: undefined,
                          evalSpace: 'input',
                        },
                      ],
                      isVariadic: false,
                    },
                  ],
                  dialect: {
                    postgres: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    standardsql: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    duckdb: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    snowflake: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    trino: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    presto: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                    mysql: {
                      e: {
                        node: 'genericSQLExpr',
                        kids: {
                          args: [
                            {
                              node: 'function_parameter',
                              name: 'value',
                            },
                          ],
                        },
                        src: ['FLOOR(', ')'],
                      },
                      needsWindowOrderBy: undefined,
                      between: undefined,
                      defaultOrderByArgIndex: undefined,
                    },
                  },
                  supportsOrderBy: undefined,
                  supportsLimit: undefined,
                  isSymmetric: undefined,
                },
                name: 'floor',
                kids: {
                  args: [
                    {
                      node: '/',
                      kids: {
                        left: {
                          node: 'field',
                          path: ['year_born'],
                        },
                        right: {
                          node: 'numberLiteral',
                          literal: '10',
                        },
                      },
                    },
                  ],
                },
                expressionType: 'scalar',
                structPath: undefined,
              },
              right: {
                node: 'numberLiteral',
                literal: '10',
              },
            },
          },
          expressionType: 'scalar',
          code: 'floor(year_born/10)*10',
        },
        {
          type: 'number',
          name: 'births_per_100k',
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 4,
                character: 11,
              },
              end: {
                line: 4,
                character: 70,
              },
            },
          },
          e: {
            node: 'function_call',
            overload: {
              returnType: {
                type: 'number',
                expressionType: 'scalar',
                evalSpace: 'input',
              },
              params: [
                {
                  name: 'value',
                  allowedTypes: [
                    {
                      type: 'number',
                      expressionType: undefined,
                      evalSpace: 'input',
                    },
                  ],
                  isVariadic: false,
                },
              ],
              dialect: {
                postgres: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                standardsql: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                duckdb: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                snowflake: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                trino: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                presto: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
                mysql: {
                  e: {
                    node: 'genericSQLExpr',
                    kids: {
                      args: [
                        {
                          node: 'function_parameter',
                          name: 'value',
                        },
                      ],
                    },
                    src: ['FLOOR(', ')'],
                  },
                  needsWindowOrderBy: undefined,
                  between: undefined,
                  defaultOrderByArgIndex: undefined,
                },
              },
              supportsOrderBy: undefined,
              supportsLimit: undefined,
              isSymmetric: undefined,
            },
            name: 'floor',
            kids: {
              args: [
                {
                  node: '*',
                  kids: {
                    left: {
                      node: '/',
                      kids: {
                        left: {
                          node: 'field',
                          path: ['population'],
                        },
                        right: {
                          node: 'all',
                          e: {
                            node: 'field',
                            path: ['population'],
                          },
                        },
                      },
                    },
                    right: {
                      node: 'numberLiteral',
                      literal: '100000',
                    },
                  },
                },
              ],
            },
            expressionType: 'ungrouped_aggregate',
            structPath: undefined,
          },
          expressionType: 'ungrouped_aggregate',
          code: 'floor(population/all(population)*100000)',
        },
        {
          type: 'query_source',
          name: 'cohort',
          fields: [
            {
              name: 'gender',
              type: 'string',
              resultMetadata: {
                sourceField: 'gender',
                sourceExpression: undefined,
                sourceClasses: ['gender'],
                referenceId: '78d989f2-ef9b-4775-b7e6-8b7d123da103',
                filterList: undefined,
                fieldKind: 'dimension',
              },
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 0,
                    character: 17,
                  },
                  end: {
                    line: 0,
                    character: 50,
                  },
                },
              },
              annotation: undefined,
            },
            {
              name: 'state',
              type: 'string',
              resultMetadata: {
                sourceField: 'state',
                sourceExpression: undefined,
                sourceClasses: ['state'],
                referenceId: '532fb076-890d-4356-953b-cebd825304f6',
                filterList: undefined,
                fieldKind: 'dimension',
              },
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 0,
                    character: 17,
                  },
                  end: {
                    line: 0,
                    character: 50,
                  },
                },
              },
              annotation: undefined,
            },
            {
              name: 'year_born',
              numberType: 'integer',
              type: 'number',
              resultMetadata: {
                sourceField: 'year',
                sourceExpression: undefined,
                sourceClasses: ['year'],
                referenceId: 'd5641b42-6ace-430b-9721-2bc9e5b644da',
                filterList: undefined,
                fieldKind: 'dimension',
              },
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 1,
                    character: 10,
                  },
                  end: {
                    line: 1,
                    character: 29,
                  },
                },
              },
              annotation: undefined,
            },
            {
              name: 'cohort_size',
              numberType: undefined,
              type: 'number',
              resultMetadata: {
                sourceField: 'cohort_size',
                sourceExpression: 'population',
                sourceClasses: ['cohort_size'],
                referenceId: '21d605e0-6d9d-481c-8942-a5beb52f9f42',
                filterList: [],
                fieldKind: 'measure',
              },
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 28,
                    character: 13,
                  },
                  end: {
                    line: 28,
                    character: 38,
                  },
                },
              },
              annotation: undefined,
            },
            {
              type: 'number',
              name: 'population',
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 30,
                    character: 11,
                  },
                  end: {
                    line: 30,
                    character: 42,
                  },
                },
              },
              e: {
                node: 'aggregate',
                function: 'sum',
                e: {
                  node: 'field',
                  path: ['cohort_size'],
                },
              },
              expressionType: 'aggregate',
              code: 'cohort_size.sum()',
            },
          ],
          dialect: 'duckdb',
          primaryKey: undefined,
          connection: 'duckdb',
          resultMetadata: {
            sourceField: 'ignoreme',
            filterList: [],
            sourceClasses: ['ignoreme'],
            fieldKind: 'struct',
            limit: undefined,
            orderBy: undefined,
          },
          queryTimezone: undefined,
          query: {
            type: 'query',
            structRef: {
              type: 'table',
              name: 'duckdb:usa_names.parquet',
              dialect: 'duckdb',
              tablePath: 'usa_names.parquet',
              connection: 'duckdb',
              fields: [
                {
                  type: 'string',
                  name: 'state',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 0,
                        character: 17,
                      },
                      end: {
                        line: 0,
                        character: 50,
                      },
                    },
                  },
                },
                {
                  type: 'string',
                  name: 'gender',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 0,
                        character: 17,
                      },
                      end: {
                        line: 0,
                        character: 50,
                      },
                    },
                  },
                },
                {
                  type: 'string',
                  name: 'name',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 0,
                        character: 17,
                      },
                      end: {
                        line: 0,
                        character: 50,
                      },
                    },
                  },
                },
                {
                  type: 'number',
                  numberType: 'integer',
                  name: 'number',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 0,
                        character: 17,
                      },
                      end: {
                        line: 0,
                        character: 50,
                      },
                    },
                  },
                },
                {
                  type: 'number',
                  numberType: 'integer',
                  name: 'year',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 1,
                        character: 10,
                      },
                      end: {
                        line: 1,
                        character: 29,
                      },
                    },
                  },
                  as: 'year_born',
                },
                {
                  type: 'number',
                  name: 'population',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 2,
                        character: 11,
                      },
                      end: {
                        line: 2,
                        character: 39,
                      },
                    },
                  },
                  e: {
                    node: 'aggregate',
                    function: 'sum',
                    e: {
                      node: 'field',
                      path: ['number'],
                    },
                  },
                  expressionType: 'aggregate',
                  code: '`number`.sum()',
                },
                {
                  type: 'number',
                  name: 'decade',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 3,
                        character: 13,
                      },
                      end: {
                        line: 3,
                        character: 45,
                      },
                    },
                  },
                  e: {
                    node: '*',
                    kids: {
                      left: {
                        node: 'function_call',
                        overload: {
                          returnType: {
                            type: 'number',
                            expressionType: 'scalar',
                            evalSpace: 'input',
                          },
                          params: [
                            {
                              name: 'value',
                              allowedTypes: [
                                {
                                  type: 'number',
                                  expressionType: undefined,
                                  evalSpace: 'input',
                                },
                              ],
                              isVariadic: false,
                            },
                          ],
                          dialect: {
                            postgres: {
                              e: {
                                node: 'genericSQLExpr',
                                kids: {
                                  args: [
                                    {
                                      node: 'function_parameter',
                                      name: 'value',
                                    },
                                  ],
                                },
                                src: ['FLOOR(', ')'],
                              },
                              needsWindowOrderBy: undefined,
                              between: undefined,
                              defaultOrderByArgIndex: undefined,
                            },
                            standardsql: {
                              e: {
                                node: 'genericSQLExpr',
                                kids: {
                                  args: [
                                    {
                                      node: 'function_parameter',
                                      name: 'value',
                                    },
                                  ],
                                },
                                src: ['FLOOR(', ')'],
                              },
                              needsWindowOrderBy: undefined,
                              between: undefined,
                              defaultOrderByArgIndex: undefined,
                            },
                            duckdb: {
                              e: {
                                node: 'genericSQLExpr',
                                kids: {
                                  args: [
                                    {
                                      node: 'function_parameter',
                                      name: 'value',
                                    },
                                  ],
                                },
                                src: ['FLOOR(', ')'],
                              },
                              needsWindowOrderBy: undefined,
                              between: undefined,
                              defaultOrderByArgIndex: undefined,
                            },
                            snowflake: {
                              e: {
                                node: 'genericSQLExpr',
                                kids: {
                                  args: [
                                    {
                                      node: 'function_parameter',
                                      name: 'value',
                                    },
                                  ],
                                },
                                src: ['FLOOR(', ')'],
                              },
                              needsWindowOrderBy: undefined,
                              between: undefined,
                              defaultOrderByArgIndex: undefined,
                            },
                            trino: {
                              e: {
                                node: 'genericSQLExpr',
                                kids: {
                                  args: [
                                    {
                                      node: 'function_parameter',
                                      name: 'value',
                                    },
                                  ],
                                },
                                src: ['FLOOR(', ')'],
                              },
                              needsWindowOrderBy: undefined,
                              between: undefined,
                              defaultOrderByArgIndex: undefined,
                            },
                            presto: {
                              e: {
                                node: 'genericSQLExpr',
                                kids: {
                                  args: [
                                    {
                                      node: 'function_parameter',
                                      name: 'value',
                                    },
                                  ],
                                },
                                src: ['FLOOR(', ')'],
                              },
                              needsWindowOrderBy: undefined,
                              between: undefined,
                              defaultOrderByArgIndex: undefined,
                            },
                            mysql: {
                              e: {
                                node: 'genericSQLExpr',
                                kids: {
                                  args: [
                                    {
                                      node: 'function_parameter',
                                      name: 'value',
                                    },
                                  ],
                                },
                                src: ['FLOOR(', ')'],
                              },
                              needsWindowOrderBy: undefined,
                              between: undefined,
                              defaultOrderByArgIndex: undefined,
                            },
                          },
                          supportsOrderBy: undefined,
                          supportsLimit: undefined,
                          isSymmetric: undefined,
                        },
                        name: 'floor',
                        kids: {
                          args: [
                            {
                              node: '/',
                              kids: {
                                left: {
                                  node: 'field',
                                  path: ['year_born'],
                                },
                                right: {
                                  node: 'numberLiteral',
                                  literal: '10',
                                },
                              },
                            },
                          ],
                        },
                        expressionType: 'scalar',
                        structPath: undefined,
                      },
                      right: {
                        node: 'numberLiteral',
                        literal: '10',
                      },
                    },
                  },
                  expressionType: 'scalar',
                  code: 'floor(year_born/10)*10',
                },
                {
                  type: 'number',
                  name: 'births_per_100k',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 4,
                        character: 11,
                      },
                      end: {
                        line: 4,
                        character: 70,
                      },
                    },
                  },
                  e: {
                    node: 'function_call',
                    overload: {
                      returnType: {
                        type: 'number',
                        expressionType: 'scalar',
                        evalSpace: 'input',
                      },
                      params: [
                        {
                          name: 'value',
                          allowedTypes: [
                            {
                              type: 'number',
                              expressionType: undefined,
                              evalSpace: 'input',
                            },
                          ],
                          isVariadic: false,
                        },
                      ],
                      dialect: {
                        postgres: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        standardsql: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        duckdb: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        snowflake: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        trino: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        presto: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                        mysql: {
                          e: {
                            node: 'genericSQLExpr',
                            kids: {
                              args: [
                                {
                                  node: 'function_parameter',
                                  name: 'value',
                                },
                              ],
                            },
                            src: ['FLOOR(', ')'],
                          },
                          needsWindowOrderBy: undefined,
                          between: undefined,
                          defaultOrderByArgIndex: undefined,
                        },
                      },
                      supportsOrderBy: undefined,
                      supportsLimit: undefined,
                      isSymmetric: undefined,
                    },
                    name: 'floor',
                    kids: {
                      args: [
                        {
                          node: '*',
                          kids: {
                            left: {
                              node: '/',
                              kids: {
                                left: {
                                  node: 'field',
                                  path: ['population'],
                                },
                                right: {
                                  node: 'all',
                                  e: {
                                    node: 'field',
                                    path: ['population'],
                                  },
                                },
                              },
                            },
                            right: {
                              node: 'numberLiteral',
                              literal: '100000',
                            },
                          },
                        },
                      ],
                    },
                    expressionType: 'ungrouped_aggregate',
                    structPath: undefined,
                  },
                  expressionType: 'ungrouped_aggregate',
                  code: 'floor(population/all(population)*100000)',
                },
                {
                  type: 'turtle',
                  name: 'by_name',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['name'],
                        },
                        {
                          type: 'fieldref',
                          path: ['population'],
                        },
                      ],
                      limit: 10,
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 5,
                        character: 8,
                      },
                      end: {
                        line: 9,
                        character: 3,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'by_state',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['state'],
                        },
                        {
                          type: 'fieldref',
                          path: ['births_per_100k'],
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 10,
                        character: 8,
                      },
                      end: {
                        line: 13,
                        character: 3,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'by_gender',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['gender'],
                        },
                        {
                          type: 'fieldref',
                          path: ['population'],
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 14,
                        character: 8,
                      },
                      end: {
                        line: 17,
                        character: 3,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'by_decade',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['decade'],
                        },
                        {
                          type: 'fieldref',
                          path: ['births_per_100k'],
                        },
                      ],
                      orderBy: [
                        {
                          field: 1,
                          dir: 'asc',
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 18,
                        character: 8,
                      },
                      end: {
                        line: 22,
                        character: 3,
                      },
                    },
                  },
                },
              ],
              location: {
                url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                range: {
                  start: {
                    line: 0,
                    character: 8,
                  },
                  end: {
                    line: 22,
                    character: 5,
                  },
                },
              },
              parameters: {},
              as: 'names',
              arguments: {},
            },
            pipeline: [
              {
                type: 'reduce',
                queryFields: [
                  {
                    type: 'fieldref',
                    path: ['gender'],
                  },
                  {
                    type: 'fieldref',
                    path: ['state'],
                  },
                  {
                    type: 'fieldref',
                    path: ['year_born'],
                  },
                  {
                    type: 'number',
                    name: 'cohort_size',
                    location: {
                      url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                      range: {
                        start: {
                          line: 28,
                          character: 13,
                        },
                        end: {
                          line: 28,
                          character: 38,
                        },
                      },
                    },
                    e: {
                      node: 'field',
                      path: ['population'],
                    },
                    expressionType: 'aggregate',
                    code: 'population',
                  },
                ],
                filterList: [],
              },
            ],
            location: {
              url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
              range: {
                start: {
                  line: 26,
                  character: 18,
                },
                end: {
                  line: 30,
                  character: 44,
                },
              },
            },
            name: undefined,
            annotation: undefined,
          },
          parameters: {},
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 34,
                character: 12,
              },
              end: {
                line: 37,
                character: 36,
              },
            },
          },
          arguments: {},
          join: 'one',
          matrixOperation: 'left',
          onExpression: {
            node: 'and',
            kids: {
              left: {
                node: 'and',
                kids: {
                  left: {
                    node: '=',
                    kids: {
                      left: {
                        node: 'field',
                        path: ['gender'],
                      },
                      right: {
                        node: 'field',
                        path: ['cohort', 'gender'],
                      },
                    },
                  },
                  right: {
                    node: '=',
                    kids: {
                      left: {
                        node: 'field',
                        path: ['state'],
                      },
                      right: {
                        node: 'field',
                        path: ['cohort', 'state'],
                      },
                    },
                  },
                },
              },
              right: {
                node: '=',
                kids: {
                  left: {
                    node: 'field',
                    path: ['year_born'],
                  },
                  right: {
                    node: 'field',
                    path: ['cohort', 'year_born'],
                  },
                },
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'by_name',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['name'],
                },
                {
                  type: 'fieldref',
                  path: ['population'],
                },
              ],
              limit: 10,
              filterList: [],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 5,
                character: 8,
              },
              end: {
                line: 9,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'by_state',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['state'],
                },
                {
                  type: 'fieldref',
                  path: ['births_per_100k'],
                },
              ],
              filterList: [],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 10,
                character: 8,
              },
              end: {
                line: 13,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'by_gender',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['gender'],
                },
                {
                  type: 'fieldref',
                  path: ['population'],
                },
              ],
              filterList: [],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 14,
                character: 8,
              },
              end: {
                line: 17,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'by_decade',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['decade'],
                },
                {
                  type: 'fieldref',
                  path: ['births_per_100k'],
                },
              ],
              orderBy: [
                {
                  field: 1,
                  dir: 'asc',
                },
              ],
              filterList: [],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 18,
                character: 8,
              },
              end: {
                line: 22,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'names_chart',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['name'],
                },
                {
                  type: 'fieldref',
                  path: ['births_per_100k'],
                },
                {
                  type: 'turtle',
                  name: 'by_year',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['year_born'],
                        },
                        {
                          type: 'fieldref',
                          path: ['population'],
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    blockNotes: [
                      {
                        text: '# line_chart\n',
                        at: {
                          url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                          range: {
                            start: {
                              line: 41,
                              character: 4,
                            },
                            end: {
                              line: 41,
                              character: 17,
                            },
                          },
                        },
                      },
                    ],
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 42,
                        character: 10,
                      },
                      end: {
                        line: 45,
                        character: 5,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'by_state',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['state'],
                        },
                        {
                          type: 'number',
                          name: 'per_100k',
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 49,
                                character: 17,
                              },
                              end: {
                                line: 49,
                                character: 71,
                              },
                            },
                          },
                          e: {
                            node: '*',
                            kids: {
                              left: {
                                node: '/',
                                kids: {
                                  left: {
                                    node: 'field',
                                    path: ['population'],
                                  },
                                  right: {
                                    node: 'exclude',
                                    e: {
                                      node: 'field',
                                      path: ['population'],
                                    },
                                    fields: ['name'],
                                  },
                                },
                              },
                              right: {
                                node: 'numberLiteral',
                                literal: '100000',
                              },
                            },
                          },
                          expressionType: 'ungrouped_aggregate',
                          code: 'population/exclude(population,name)*100000',
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    blockNotes: [
                      {
                        text: '# shape_mape \n',
                        at: {
                          url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                          range: {
                            start: {
                              line: 46,
                              character: 4,
                            },
                            end: {
                              line: 46,
                              character: 18,
                            },
                          },
                        },
                      },
                    ],
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 47,
                        character: 10,
                      },
                      end: {
                        line: 50,
                        character: 5,
                      },
                    },
                  },
                },
              ],
              limit: 10,
              filterList: [],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 38,
                character: 8,
              },
              end: {
                line: 52,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'iconic_names_by_state',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['name'],
                },
                {
                  type: 'fieldref',
                  path: ['state'],
                },
                {
                  type: 'fieldref',
                  path: ['gender'],
                },
                {
                  type: 'number',
                  name: 'all_name',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 56,
                        character: 6,
                      },
                      end: {
                        line: 56,
                        character: 39,
                      },
                    },
                  },
                  e: {
                    node: 'all',
                    e: {
                      node: 'field',
                      path: ['population'],
                    },
                    fields: ['name'],
                  },
                  expressionType: 'ungrouped_aggregate',
                  code: 'all(population, name)',
                },
                {
                  type: 'number',
                  name: 'name_popularity',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 57,
                        character: 6,
                      },
                      end: {
                        line: 57,
                        character: 64,
                      },
                    },
                  },
                  e: {
                    node: '/',
                    kids: {
                      left: {
                        node: 'all',
                        e: {
                          node: 'field',
                          path: ['population'],
                        },
                        fields: ['name'],
                      },
                      right: {
                        node: 'all',
                        e: {
                          node: 'field',
                          path: ['population'],
                        },
                      },
                    },
                  },
                  expressionType: 'ungrouped_aggregate',
                  code: 'all(population, name) / all(population)',
                },
                {
                  type: 'number',
                  name: 'state_popularity',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 58,
                        character: 6,
                      },
                      end: {
                        line: 58,
                        character: 61,
                      },
                    },
                  },
                  e: {
                    node: '/',
                    kids: {
                      left: {
                        node: 'field',
                        path: ['population'],
                      },
                      right: {
                        node: 'all',
                        e: {
                          node: 'field',
                          path: ['population'],
                        },
                        fields: ['state'],
                      },
                    },
                  },
                  expressionType: 'ungrouped_aggregate',
                  code: 'population / all(population, state)',
                },
              ],
              filterList: [],
            },
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['state'],
                },
                {
                  type: 'turtle',
                  name: 'by_gender',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['gender'],
                        },
                        {
                          type: 'turtle',
                          name: 'name_list_detail',
                          pipeline: [
                            {
                              type: 'reduce',
                              queryFields: [
                                {
                                  type: 'fieldref',
                                  path: ['name'],
                                },
                                {
                                  type: 'number',
                                  name: 'popularity',
                                  location: {
                                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 69,
                                        character: 10,
                                      },
                                      end: {
                                        line: 69,
                                        character: 58,
                                      },
                                    },
                                  },
                                  e: {
                                    node: '/',
                                    kids: {
                                      left: {
                                        node: 'field',
                                        path: ['state_popularity'],
                                      },
                                      right: {
                                        node: 'field',
                                        path: ['name_popularity'],
                                      },
                                    },
                                  },
                                  expressionType: 'scalar',
                                  code: 'state_popularity / name_popularity',
                                },
                              ],
                              limit: 20,
                              orderBy: [
                                {
                                  field: 2,
                                  dir: 'desc',
                                },
                              ],
                              filterList: [],
                            },
                          ],
                          annotation: {
                            inherits: undefined,
                          },
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 66,
                                character: 12,
                              },
                              end: {
                                line: 72,
                                character: 7,
                              },
                            },
                          },
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 64,
                        character: 10,
                      },
                      end: {
                        line: 73,
                        character: 5,
                      },
                    },
                  },
                },
              ],
              limit: 20,
              orderBy: [
                {
                  field: 1,
                },
              ],
              filterList: [
                {
                  node: 'filterCondition',
                  code: 'all_name > 3000',
                  e: {
                    node: '>',
                    kids: {
                      left: {
                        node: 'field',
                        path: ['all_name'],
                      },
                      right: {
                        node: 'numberLiteral',
                        literal: '3000',
                      },
                    },
                  },
                  expressionType: 'scalar',
                },
              ],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 53,
                character: 8,
              },
              end: {
                line: 76,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'gender_year',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['year_born'],
                },
                {
                  type: 'fieldref',
                  path: ['population'],
                },
                {
                  type: 'string',
                  name: 'gender',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 82,
                        character: 14,
                      },
                      end: {
                        line: 82,
                        character: 67,
                      },
                    },
                  },
                  e: {
                    node: 'case',
                    kids: {
                      caseWhen: [
                        {
                          node: '=',
                          kids: {
                            left: {
                              node: 'field',
                              path: ['gender'],
                            },
                            right: {
                              node: 'stringLiteral',
                              literal: 'F',
                            },
                          },
                        },
                      ],
                      caseThen: [
                        {
                          node: 'stringLiteral',
                          literal: 'Female',
                        },
                      ],
                      caseElse: {
                        node: 'stringLiteral',
                        literal: 'Male',
                      },
                    },
                  },
                  expressionType: 'scalar',
                  code: "gender ? pick 'Female' when 'F' else 'Male'",
                },
              ],
              filterList: [],
            },
          ],
          annotation: {
            blockNotes: [
              {
                text: '# line_chart\n',
                at: {
                  url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                  range: {
                    start: {
                      line: 78,
                      character: 2,
                    },
                    end: {
                      line: 78,
                      character: 15,
                    },
                  },
                },
              },
            ],
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 79,
                character: 8,
              },
              end: {
                line: 83,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'gender_by_state',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['state'],
                },
                {
                  type: 'number',
                  name: 'percent_female',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 88,
                        character: 17,
                      },
                      end: {
                        line: 88,
                        character: 75,
                      },
                    },
                  },
                  e: {
                    node: '/',
                    kids: {
                      left: {
                        node: 'filteredExpr',
                        kids: {
                          e: {
                            node: 'field',
                            path: ['population'],
                          },
                          filterList: [
                            {
                              node: 'filterCondition',
                              code: "gender='M'",
                              e: {
                                node: '=',
                                kids: {
                                  left: {
                                    node: 'field',
                                    path: ['gender'],
                                  },
                                  right: {
                                    node: 'stringLiteral',
                                    literal: 'M',
                                  },
                                },
                              },
                              expressionType: 'scalar',
                            },
                          ],
                        },
                      },
                      right: {
                        node: 'field',
                        path: ['population'],
                      },
                    },
                  },
                  expressionType: 'aggregate',
                  code: "population{where: gender='M'}/population",
                },
              ],
              filterList: [],
            },
          ],
          annotation: {
            blockNotes: [
              {
                text: '# shape_map\n',
                at: {
                  url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                  range: {
                    start: {
                      line: 85,
                      character: 3,
                    },
                    end: {
                      line: 85,
                      character: 15,
                    },
                  },
                },
              },
            ],
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 86,
                character: 9,
              },
              end: {
                line: 89,
                character: 5,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'gender_neutral_names',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['name'],
                },
                {
                  type: 'fieldref',
                  path: ['population'],
                },
                {
                  type: 'turtle',
                  name: 'gender_year',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['year_born'],
                        },
                        {
                          type: 'fieldref',
                          path: ['population'],
                        },
                        {
                          type: 'string',
                          name: 'gender',
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 82,
                                character: 14,
                              },
                              end: {
                                line: 82,
                                character: 67,
                              },
                            },
                          },
                          e: {
                            node: 'case',
                            kids: {
                              caseWhen: [
                                {
                                  node: '=',
                                  kids: {
                                    left: {
                                      node: 'field',
                                      path: ['gender'],
                                    },
                                    right: {
                                      node: 'stringLiteral',
                                      literal: 'F',
                                    },
                                  },
                                },
                              ],
                              caseThen: [
                                {
                                  node: 'stringLiteral',
                                  literal: 'Female',
                                },
                              ],
                              caseElse: {
                                node: 'stringLiteral',
                                literal: 'Male',
                              },
                            },
                          },
                          expressionType: 'scalar',
                          code: "gender ? pick 'Female' when 'F' else 'Male'",
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: {
                      blockNotes: [
                        {
                          text: '# line_chart\n',
                          at: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 78,
                                character: 2,
                              },
                              end: {
                                line: 78,
                                character: 15,
                              },
                            },
                          },
                        },
                      ],
                      inherits: undefined,
                    },
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 94,
                        character: 10,
                      },
                      end: {
                        line: 94,
                        character: 21,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'gender_by_state',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['state'],
                        },
                        {
                          type: 'number',
                          name: 'percent_female',
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 88,
                                character: 17,
                              },
                              end: {
                                line: 88,
                                character: 75,
                              },
                            },
                          },
                          e: {
                            node: '/',
                            kids: {
                              left: {
                                node: 'filteredExpr',
                                kids: {
                                  e: {
                                    node: 'field',
                                    path: ['population'],
                                  },
                                  filterList: [
                                    {
                                      node: 'filterCondition',
                                      code: "gender='M'",
                                      e: {
                                        node: '=',
                                        kids: {
                                          left: {
                                            node: 'field',
                                            path: ['gender'],
                                          },
                                          right: {
                                            node: 'stringLiteral',
                                            literal: 'M',
                                          },
                                        },
                                      },
                                      expressionType: 'scalar',
                                    },
                                  ],
                                },
                              },
                              right: {
                                node: 'field',
                                path: ['population'],
                              },
                            },
                          },
                          expressionType: 'aggregate',
                          code: "population{where: gender='M'}/population",
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: {
                      blockNotes: [
                        {
                          text: '# shape_map\n',
                          at: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 85,
                                character: 3,
                              },
                              end: {
                                line: 85,
                                character: 15,
                              },
                            },
                          },
                        },
                      ],
                      inherits: undefined,
                    },
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 95,
                        character: 10,
                      },
                      end: {
                        line: 95,
                        character: 25,
                      },
                    },
                  },
                },
              ],
              limit: 10,
              filterList: [
                {
                  node: 'filterCondition',
                  code: "population{where: gender='F'}/population ? > .10 & < .9",
                  e: {
                    node: 'and',
                    kids: {
                      left: {
                        node: '>',
                        kids: {
                          left: {
                            node: '/',
                            kids: {
                              left: {
                                node: 'filteredExpr',
                                kids: {
                                  e: {
                                    node: 'outputField',
                                    name: 'population',
                                  },
                                  filterList: [
                                    {
                                      node: 'filterCondition',
                                      code: "gender='F'",
                                      e: {
                                        node: '=',
                                        kids: {
                                          left: {
                                            node: 'field',
                                            path: ['gender'],
                                          },
                                          right: {
                                            node: 'stringLiteral',
                                            literal: 'F',
                                          },
                                        },
                                      },
                                      expressionType: 'scalar',
                                    },
                                  ],
                                },
                              },
                              right: {
                                node: 'outputField',
                                name: 'population',
                              },
                            },
                          },
                          right: {
                            node: 'numberLiteral',
                            literal: '.10',
                          },
                        },
                      },
                      right: {
                        node: '<',
                        kids: {
                          left: {
                            node: '/',
                            kids: {
                              left: {
                                node: 'filteredExpr',
                                kids: {
                                  e: {
                                    node: 'outputField',
                                    name: 'population',
                                  },
                                  filterList: [
                                    {
                                      node: 'filterCondition',
                                      code: "gender='F'",
                                      e: {
                                        node: '=',
                                        kids: {
                                          left: {
                                            node: 'field',
                                            path: ['gender'],
                                          },
                                          right: {
                                            node: 'stringLiteral',
                                            literal: 'F',
                                          },
                                        },
                                      },
                                      expressionType: 'scalar',
                                    },
                                  ],
                                },
                              },
                              right: {
                                node: 'outputField',
                                name: 'population',
                              },
                            },
                          },
                          right: {
                            node: 'numberLiteral',
                            literal: '.9',
                          },
                        },
                      },
                    },
                  },
                  expressionType: 'aggregate',
                },
              ],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 91,
                character: 8,
              },
              end: {
                line: 98,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'kelly_time_space_dashboard',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['name'],
                },
                {
                  type: 'fieldref',
                  path: ['population'],
                },
                {
                  type: 'turtle',
                  name: 'gender_year',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['year_born'],
                        },
                        {
                          type: 'fieldref',
                          path: ['population'],
                        },
                        {
                          type: 'string',
                          name: 'gender',
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 82,
                                character: 14,
                              },
                              end: {
                                line: 82,
                                character: 67,
                              },
                            },
                          },
                          e: {
                            node: 'case',
                            kids: {
                              caseWhen: [
                                {
                                  node: '=',
                                  kids: {
                                    left: {
                                      node: 'field',
                                      path: ['gender'],
                                    },
                                    right: {
                                      node: 'stringLiteral',
                                      literal: 'F',
                                    },
                                  },
                                },
                              ],
                              caseThen: [
                                {
                                  node: 'stringLiteral',
                                  literal: 'Female',
                                },
                              ],
                              caseElse: {
                                node: 'stringLiteral',
                                literal: 'Male',
                              },
                            },
                          },
                          expressionType: 'scalar',
                          code: "gender ? pick 'Female' when 'F' else 'Male'",
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: {
                      blockNotes: [
                        {
                          text: '# line_chart\n',
                          at: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 78,
                                character: 2,
                              },
                              end: {
                                line: 78,
                                character: 15,
                              },
                            },
                          },
                        },
                      ],
                      inherits: undefined,
                    },
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 105,
                        character: 10,
                      },
                      end: {
                        line: 105,
                        character: 21,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'gender_by_state',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['state'],
                        },
                        {
                          type: 'number',
                          name: 'percent_female',
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 88,
                                character: 17,
                              },
                              end: {
                                line: 88,
                                character: 75,
                              },
                            },
                          },
                          e: {
                            node: '/',
                            kids: {
                              left: {
                                node: 'filteredExpr',
                                kids: {
                                  e: {
                                    node: 'field',
                                    path: ['population'],
                                  },
                                  filterList: [
                                    {
                                      node: 'filterCondition',
                                      code: "gender='M'",
                                      e: {
                                        node: '=',
                                        kids: {
                                          left: {
                                            node: 'field',
                                            path: ['gender'],
                                          },
                                          right: {
                                            node: 'stringLiteral',
                                            literal: 'M',
                                          },
                                        },
                                      },
                                      expressionType: 'scalar',
                                    },
                                  ],
                                },
                              },
                              right: {
                                node: 'field',
                                path: ['population'],
                              },
                            },
                          },
                          expressionType: 'aggregate',
                          code: "population{where: gender='M'}/population",
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: {
                      blockNotes: [
                        {
                          text: '# shape_map\n',
                          at: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 85,
                                character: 3,
                              },
                              end: {
                                line: 85,
                                character: 15,
                              },
                            },
                          },
                        },
                      ],
                      inherits: undefined,
                    },
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 106,
                        character: 10,
                      },
                      end: {
                        line: 106,
                        character: 25,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'by_decade',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['decade'],
                        },
                        {
                          type: 'turtle',
                          name: 'gender_by_state',
                          pipeline: [
                            {
                              type: 'reduce',
                              queryFields: [
                                {
                                  type: 'fieldref',
                                  path: ['state'],
                                },
                                {
                                  type: 'number',
                                  name: 'percent_female',
                                  location: {
                                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 88,
                                        character: 17,
                                      },
                                      end: {
                                        line: 88,
                                        character: 75,
                                      },
                                    },
                                  },
                                  e: {
                                    node: '/',
                                    kids: {
                                      left: {
                                        node: 'filteredExpr',
                                        kids: {
                                          e: {
                                            node: 'field',
                                            path: ['population'],
                                          },
                                          filterList: [
                                            {
                                              node: 'filterCondition',
                                              code: "gender='M'",
                                              e: {
                                                node: '=',
                                                kids: {
                                                  left: {
                                                    node: 'field',
                                                    path: ['gender'],
                                                  },
                                                  right: {
                                                    node: 'stringLiteral',
                                                    literal: 'M',
                                                  },
                                                },
                                              },
                                              expressionType: 'scalar',
                                            },
                                          ],
                                        },
                                      },
                                      right: {
                                        node: 'field',
                                        path: ['population'],
                                      },
                                    },
                                  },
                                  expressionType: 'aggregate',
                                  code: "population{where: gender='M'}/population",
                                },
                              ],
                              filterList: [],
                            },
                          ],
                          annotation: {
                            inherits: {
                              blockNotes: [
                                {
                                  text: '# shape_map\n',
                                  at: {
                                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 85,
                                        character: 3,
                                      },
                                      end: {
                                        line: 85,
                                        character: 15,
                                      },
                                    },
                                  },
                                },
                              ],
                              inherits: undefined,
                            },
                          },
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 109,
                                character: 12,
                              },
                              end: {
                                line: 109,
                                character: 27,
                              },
                            },
                          },
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 107,
                        character: 10,
                      },
                      end: {
                        line: 110,
                        character: 5,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'by_state',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['state'],
                        },
                        {
                          type: 'turtle',
                          name: 'gender_year',
                          pipeline: [
                            {
                              type: 'reduce',
                              queryFields: [
                                {
                                  type: 'fieldref',
                                  path: ['year_born'],
                                },
                                {
                                  type: 'fieldref',
                                  path: ['population'],
                                },
                                {
                                  type: 'string',
                                  name: 'gender',
                                  location: {
                                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 82,
                                        character: 14,
                                      },
                                      end: {
                                        line: 82,
                                        character: 67,
                                      },
                                    },
                                  },
                                  e: {
                                    node: 'case',
                                    kids: {
                                      caseWhen: [
                                        {
                                          node: '=',
                                          kids: {
                                            left: {
                                              node: 'field',
                                              path: ['gender'],
                                            },
                                            right: {
                                              node: 'stringLiteral',
                                              literal: 'F',
                                            },
                                          },
                                        },
                                      ],
                                      caseThen: [
                                        {
                                          node: 'stringLiteral',
                                          literal: 'Female',
                                        },
                                      ],
                                      caseElse: {
                                        node: 'stringLiteral',
                                        literal: 'Male',
                                      },
                                    },
                                  },
                                  expressionType: 'scalar',
                                  code: "gender ? pick 'Female' when 'F' else 'Male'",
                                },
                              ],
                              filterList: [],
                            },
                          ],
                          annotation: {
                            inherits: {
                              blockNotes: [
                                {
                                  text: '# line_chart\n',
                                  at: {
                                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 78,
                                        character: 2,
                                      },
                                      end: {
                                        line: 78,
                                        character: 15,
                                      },
                                    },
                                  },
                                },
                              ],
                              inherits: undefined,
                            },
                          },
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 113,
                                character: 12,
                              },
                              end: {
                                line: 113,
                                character: 23,
                              },
                            },
                          },
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 111,
                        character: 10,
                      },
                      end: {
                        line: 114,
                        character: 5,
                      },
                    },
                  },
                },
              ],
              filterList: [
                {
                  node: 'filterCondition',
                  code: "name = 'Kelly'",
                  e: {
                    node: '=',
                    kids: {
                      left: {
                        node: 'field',
                        path: ['name'],
                      },
                      right: {
                        node: 'stringLiteral',
                        literal: 'Kelly',
                      },
                    },
                  },
                  expressionType: 'scalar',
                },
              ],
            },
          ],
          annotation: {
            blockNotes: [
              {
                text: '# dashboard\n',
                at: {
                  url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                  range: {
                    start: {
                      line: 100,
                      character: 2,
                    },
                    end: {
                      line: 100,
                      character: 14,
                    },
                  },
                },
              },
            ],
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 101,
                character: 8,
              },
              end: {
                line: 115,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'resurgent_names',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['name'],
                },
                {
                  type: 'fieldref',
                  path: ['population'],
                },
                {
                  type: 'turtle',
                  name: 'by_decade',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['decade'],
                        },
                        {
                          type: 'number',
                          name: 'percent_in_decade',
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 128,
                                character: 17,
                              },
                              end: {
                                line: 128,
                                character: 64,
                              },
                            },
                          },
                          e: {
                            node: '/',
                            kids: {
                              left: {
                                node: 'field',
                                path: ['population'],
                              },
                              right: {
                                node: 'all',
                                e: {
                                  node: 'field',
                                  path: ['population'],
                                },
                              },
                            },
                          },
                          expressionType: 'ungrouped_aggregate',
                          code: 'population/all(population)',
                        },
                      ],
                      limit: 2,
                      orderBy: [
                        {
                          field: 2,
                          dir: 'desc',
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 126,
                        character: 10,
                      },
                      end: {
                        line: 131,
                        character: 5,
                      },
                    },
                  },
                },
              ],
              filterList: [],
            },
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['name'],
                },
                {
                  type: 'fieldref',
                  path: ['population'],
                },
                {
                  type: 'number',
                  name: 'years_apart',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 139,
                        character: 6,
                      },
                      end: {
                        line: 139,
                        character: 64,
                      },
                    },
                  },
                  e: {
                    node: '-',
                    kids: {
                      left: {
                        node: 'aggregate',
                        function: 'max',
                        e: {
                          node: 'field',
                          path: ['by_decade', 'decade'],
                        },
                      },
                      right: {
                        node: 'aggregate',
                        function: 'min',
                        e: {
                          node: 'field',
                          path: ['by_decade', 'decade'],
                        },
                      },
                    },
                  },
                  expressionType: 'aggregate',
                  code: 'max(by_decade.decade)-min(by_decade.decade)',
                },
                {
                  type: 'number',
                  name: 'total_percentage',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 140,
                        character: 6,
                      },
                      end: {
                        line: 140,
                        character: 59,
                      },
                    },
                  },
                  e: {
                    node: 'aggregate',
                    function: 'sum',
                    e: {
                      node: 'field',
                      path: ['by_decade', 'percent_in_decade'],
                    },
                    structPath: ['by_decade'],
                  },
                  expressionType: 'aggregate',
                  code: 'by_decade.percent_in_decade.sum()',
                },
                {
                  type: 'number',
                  name: 'max_percentage',
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 141,
                        character: 6,
                      },
                      end: {
                        line: 141,
                        character: 56,
                      },
                    },
                  },
                  e: {
                    node: 'aggregate',
                    function: 'max',
                    e: {
                      node: 'field',
                      path: ['by_decade', 'percent_in_decade'],
                    },
                  },
                  expressionType: 'aggregate',
                  code: 'max(by_decade.percent_in_decade)',
                },
                {
                  type: 'turtle',
                  name: 'by_decade',
                  pipeline: [
                    {
                      type: 'project',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['by_decade', 'decade'],
                        },
                        {
                          type: 'fieldref',
                          path: ['by_decade', 'percent_in_decade'],
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 142,
                        character: 10,
                      },
                      end: {
                        line: 144,
                        character: 5,
                      },
                    },
                  },
                },
              ],
              limit: 10,
              filterList: [
                {
                  node: 'filterCondition',
                  code: 'population > 3000',
                  e: {
                    node: '>',
                    kids: {
                      left: {
                        node: 'field',
                        path: ['population'],
                      },
                      right: {
                        node: 'numberLiteral',
                        literal: '3000',
                      },
                    },
                  },
                  expressionType: 'scalar',
                },
              ],
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 123,
                character: 9,
              },
              end: {
                line: 146,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'name_dashboard',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'turtle',
                  name: 'by_name',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['decade'],
                        },
                        {
                          type: 'fieldref',
                          path: ['births_per_100k'],
                        },
                        {
                          type: 'fieldref',
                          path: ['name'],
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    blockNotes: [
                      {
                        text: '# line_chart\n',
                        at: {
                          url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                          range: {
                            start: {
                              line: 151,
                              character: 4,
                            },
                            end: {
                              line: 151,
                              character: 17,
                            },
                          },
                        },
                      },
                    ],
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 152,
                        character: 10,
                      },
                      end: {
                        line: 156,
                        character: 5,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'by_name_view',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['name'],
                        },
                        {
                          type: 'fieldref',
                          path: ['births_per_100k'],
                        },
                        {
                          type: 'fieldref',
                          path: ['gender'],
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    blockNotes: [
                      {
                        text: '# bar_chart\n',
                        at: {
                          url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                          range: {
                            start: {
                              line: 157,
                              character: 4,
                            },
                            end: {
                              line: 157,
                              character: 16,
                            },
                          },
                        },
                      },
                    ],
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 158,
                        character: 10,
                      },
                      end: {
                        line: 162,
                        character: 5,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'name_dash',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['name'],
                        },
                        {
                          type: 'fieldref',
                          path: ['population'],
                        },
                        {
                          type: 'turtle',
                          name: 'by_year',
                          pipeline: [
                            {
                              type: 'reduce',
                              queryFields: [
                                {
                                  type: 'fieldref',
                                  path: ['year_born'],
                                },
                                {
                                  type: 'fieldref',
                                  path: ['population'],
                                },
                              ],
                              filterList: [],
                            },
                          ],
                          annotation: {
                            blockNotes: [
                              {
                                text: '# line_chart\n',
                                at: {
                                  url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                  range: {
                                    start: {
                                      line: 167,
                                      character: 6,
                                    },
                                    end: {
                                      line: 167,
                                      character: 19,
                                    },
                                  },
                                },
                              },
                            ],
                            inherits: undefined,
                          },
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 168,
                                character: 12,
                              },
                              end: {
                                line: 171,
                                character: 7,
                              },
                            },
                          },
                        },
                        {
                          type: 'turtle',
                          name: 'by_state',
                          pipeline: [
                            {
                              type: 'reduce',
                              queryFields: [
                                {
                                  type: 'fieldref',
                                  path: ['state'],
                                },
                                {
                                  type: 'number',
                                  name: 'per_100k',
                                  location: {
                                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 175,
                                        character: 19,
                                      },
                                      end: {
                                        line: 175,
                                        character: 68,
                                      },
                                    },
                                  },
                                  e: {
                                    node: '*',
                                    kids: {
                                      left: {
                                        node: '/',
                                        kids: {
                                          left: {
                                            node: 'field',
                                            path: ['population'],
                                          },
                                          right: {
                                            node: 'field',
                                            path: ['cohort', 'population'],
                                          },
                                        },
                                      },
                                      right: {
                                        node: 'numberLiteral',
                                        literal: '100000',
                                      },
                                    },
                                  },
                                  expressionType: 'aggregate',
                                  code: 'population/cohort.population * 100000',
                                },
                              ],
                              filterList: [],
                            },
                          ],
                          annotation: {
                            blockNotes: [
                              {
                                text: '# shape_map\n',
                                at: {
                                  url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                  range: {
                                    start: {
                                      line: 172,
                                      character: 6,
                                    },
                                    end: {
                                      line: 172,
                                      character: 18,
                                    },
                                  },
                                },
                              },
                            ],
                            inherits: undefined,
                          },
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 173,
                                character: 12,
                              },
                              end: {
                                line: 176,
                                character: 7,
                              },
                            },
                          },
                        },
                        {
                          type: 'turtle',
                          name: 'peak_decade_state',
                          pipeline: [
                            {
                              type: 'reduce',
                              queryFields: [
                                {
                                  type: 'fieldref',
                                  path: ['state'],
                                },
                                {
                                  type: 'fieldref',
                                  path: ['decade'],
                                },
                                {
                                  type: 'number',
                                  name: 'per_100k',
                                  location: {
                                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 179,
                                        character: 19,
                                      },
                                      end: {
                                        line: 179,
                                        character: 68,
                                      },
                                    },
                                  },
                                  e: {
                                    node: '*',
                                    kids: {
                                      left: {
                                        node: '/',
                                        kids: {
                                          left: {
                                            node: 'field',
                                            path: ['population'],
                                          },
                                          right: {
                                            node: 'field',
                                            path: ['cohort', 'population'],
                                          },
                                        },
                                      },
                                      right: {
                                        node: 'numberLiteral',
                                        literal: '100000',
                                      },
                                    },
                                  },
                                  expressionType: 'aggregate',
                                  code: 'population/cohort.population * 100000',
                                },
                              ],
                              limit: 5,
                              filterList: [],
                            },
                          ],
                          annotation: {
                            blockNotes: [
                              {
                                text: '# shape_map\n',
                                at: {
                                  url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                                  range: {
                                    start: {
                                      line: 172,
                                      character: 6,
                                    },
                                    end: {
                                      line: 172,
                                      character: 18,
                                    },
                                  },
                                },
                              },
                            ],
                            inherits: undefined,
                          },
                          location: {
                            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 177,
                                character: 6,
                              },
                              end: {
                                line: 181,
                                character: 7,
                              },
                            },
                          },
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    blockNotes: [
                      {
                        text: '# dashboard\n',
                        at: {
                          url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                          range: {
                            start: {
                              line: 163,
                              character: 4,
                            },
                            end: {
                              line: 163,
                              character: 16,
                            },
                          },
                        },
                      },
                    ],
                    inherits: undefined,
                  },
                  location: {
                    url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 164,
                        character: 10,
                      },
                      end: {
                        line: 182,
                        character: 5,
                      },
                    },
                  },
                },
              ],
              filterList: [
                {
                  node: 'filterCondition',
                  code: "name = 'Lloyd' | 'Anika' | 'Jessie' | 'Kelly' | 'Todd' | 'Chris'",
                  e: {
                    node: 'in',
                    not: false,
                    kids: {
                      e: {
                        node: 'field',
                        path: ['name'],
                      },
                      oneOf: [
                        {
                          node: 'stringLiteral',
                          literal: 'Lloyd',
                        },
                        {
                          node: 'stringLiteral',
                          literal: 'Anika',
                        },
                        {
                          node: 'stringLiteral',
                          literal: 'Jessie',
                        },
                        {
                          node: 'stringLiteral',
                          literal: 'Kelly',
                        },
                        {
                          node: 'stringLiteral',
                          literal: 'Todd',
                        },
                        {
                          node: 'stringLiteral',
                          literal: 'Chris',
                        },
                      ],
                    },
                  },
                  expressionType: 'scalar',
                },
              ],
            },
          ],
          annotation: {
            blockNotes: [
              {
                text: '# dashboard\n',
                at: {
                  url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
                  range: {
                    start: {
                      line: 148,
                      character: 2,
                    },
                    end: {
                      line: 148,
                      character: 14,
                    },
                  },
                },
              },
            ],
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 149,
                character: 8,
              },
              end: {
                line: 183,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'search_index',
          pipeline: [
            {
              type: 'index',
              indexFields: [
                {
                  type: 'fieldref',
                  path: ['name'],
                },
                {
                  type: 'fieldref',
                  path: ['state'],
                },
              ],
              filterList: [],
              weightMeasure: 'population',
            },
          ],
          annotation: {
            inherits: undefined,
          },
          location: {
            url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 185,
                character: 8,
              },
              end: {
                line: 187,
                character: 3,
              },
            },
          },
        },
      ],
      location: {
        url: 'file:///Users/scullin/src/malloydata/malloy-samples/names/names.malloy',
        range: {
          start: {
            line: 33,
            character: 8,
          },
          end: {
            line: 188,
            character: 47,
          },
        },
      },
      parameters: {},
      as: 'names2',
      arguments: {},
    },
  },
};

export const source = getSourceDef(model, 'names');

export const topValues = [
  {
    fieldName: 'name',
    cardinality: 32403,
    values: [
      {
        fieldValue: 'James',
        weight: 7409,
      },
      {
        fieldValue: 'Leslie',
        weight: 7407,
      },
      {
        fieldValue: 'Lee',
        weight: 7313,
      },
      {
        fieldValue: 'John',
        weight: 7221,
      },
      {
        fieldValue: 'Robert',
        weight: 7174,
      },
      {
        fieldValue: 'Jessie',
        weight: 6922,
      },
      {
        fieldValue: 'William',
        weight: 6880,
      },
      {
        fieldValue: 'Michael',
        weight: 6756,
      },
      {
        fieldValue: 'Mary',
        weight: 6699,
      },
      {
        fieldValue: 'Charles',
        weight: 6624,
      },
    ],
  },
  {
    fieldName: 'state',
    cardinality: 51,
    values: [
      {
        fieldValue: 'CA',
        weight: 400762,
      },
      {
        fieldValue: 'TX',
        weight: 368987,
      },
      {
        fieldValue: 'NY',
        weight: 309532,
      },
      {
        fieldValue: 'IL',
        weight: 237839,
      },
      {
        fieldValue: 'FL',
        weight: 218192,
      },
      {
        fieldValue: 'PA',
        weight: 206944,
      },
      {
        fieldValue: 'OH',
        weight: 204165,
      },
      {
        fieldValue: 'GA',
        weight: 191367,
      },
      {
        fieldValue: 'MI',
        weight: 190023,
      },
      {
        fieldValue: 'NC',
        weight: 181647,
      },
    ],
  },
  {
    fieldName: 'gender',
    cardinality: 2,
    values: [
      {
        fieldValue: 'F',
        weight: 3510324,
      },
      {
        fieldValue: 'M',
        weight: 2801180,
      },
    ],
  },
];
