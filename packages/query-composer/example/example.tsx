import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import ExploreQueryEditor, {useQueryBuilder} from '../src';
import {ModelDef, StructDef} from '@malloydata/malloy';
import {_compileModel} from '../src/core/compile';

const model: ModelDef = {
  name: '',
  exports: ['names', 'cohort', 'names2'],
  contents: {
    names: {
      type: 'struct',
      name: 'duckdb:usa_names.parquet',
      dialect: 'duckdb',
      structSource: {
        type: 'table',
        tablePath: 'usa_names.parquet',
      },
      structRelationship: {
        type: 'basetable',
        connectionName: 'duckdb',
      },
      fields: [
        {
          type: 'string',
          name: 'state',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          name: 'population',
          type: 'number',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          e: [
            {
              type: 'aggregate',
              function: 'sum',
              e: [
                {
                  type: 'field',
                  path: ['number'],
                },
              ],
            },
          ],
          expressionType: 'aggregate',
          code: '`number`.sum()',
        },
        {
          name: 'decade',
          type: 'number',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          e: [
            {
              type: 'function_call',
              overload: {
                returnType: {
                  dataType: 'number',
                  expressionType: 'scalar',
                  evalSpace: 'input',
                },
                params: [
                  {
                    name: 'value',
                    isVariadic: false,
                    allowedTypes: [
                      {
                        dataType: 'number',
                        evalSpace: 'input',
                      },
                    ],
                  },
                ],
                dialect: {
                  postgres: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                  standardsql: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                  duckdb: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                },
              },
              name: 'floor',
              args: [
                [
                  {
                    type: 'dialect',
                    function: 'div',
                    numerator: [
                      {
                        type: 'field',
                        path: ['year_born'],
                      },
                    ],
                    denominator: [
                      {
                        type: 'dialect',
                        function: 'numberLiteral',
                        literal: '10',
                      },
                    ],
                  },
                ],
              ],
              expressionType: 'scalar',
            },
            '*',
            {
              type: 'dialect',
              function: 'numberLiteral',
              literal: '10',
            },
          ],
          expressionType: 'scalar',
          code: 'floor(year_born/10)*10',
        },
        {
          name: 'births_per_100k',
          type: 'number',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          e: [
            {
              type: 'function_call',
              overload: {
                returnType: {
                  dataType: 'number',
                  expressionType: 'scalar',
                  evalSpace: 'input',
                },
                params: [
                  {
                    name: 'value',
                    isVariadic: false,
                    allowedTypes: [
                      {
                        dataType: 'number',
                        evalSpace: 'input',
                      },
                    ],
                  },
                ],
                dialect: {
                  postgres: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                  standardsql: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                  duckdb: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                },
              },
              name: 'floor',
              args: [
                [
                  {
                    type: 'dialect',
                    function: 'div',
                    numerator: [
                      {
                        type: 'field',
                        path: ['population'],
                      },
                    ],
                    denominator: [
                      {
                        type: 'all',
                        e: [
                          {
                            type: 'field',
                            path: ['population'],
                          },
                        ],
                      },
                    ],
                  },
                  '*',
                  {
                    type: 'dialect',
                    function: 'numberLiteral',
                    literal: '100000',
                  },
                ],
              ],
              expressionType: 'ungrouped_aggregate',
            },
          ],
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
      as: 'names',
    },
    cohort: {
      fields: [
        {
          name: 'gender',
          type: 'string',
          resultMetadata: {
            sourceField: 'gender',
            sourceClasses: ['gender'],
            fieldKind: 'dimension',
          },
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          name: 'state',
          type: 'string',
          resultMetadata: {
            sourceField: 'state',
            sourceClasses: ['state'],
            fieldKind: 'dimension',
          },
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          name: 'year_born',
          numberType: 'integer',
          type: 'number',
          resultMetadata: {
            sourceField: 'year',
            sourceClasses: ['year'],
            fieldKind: 'dimension',
          },
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
        },
        {
          name: 'cohort_size',
          type: 'number',
          resultMetadata: {
            sourceField: 'cohort_size',
            sourceExpression: 'population',
            filterList: [],
            sourceClasses: ['cohort_size'],
            fieldKind: 'measure',
          },
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
        },
        {
          name: 'population',
          type: 'number',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          e: [
            {
              type: 'aggregate',
              function: 'sum',
              e: [
                {
                  type: 'field',
                  path: ['cohort_size'],
                },
              ],
            },
          ],
          expressionType: 'aggregate',
          code: 'cohort_size.sum()',
        },
      ],
      name: 'result',
      dialect: 'duckdb',
      structRelationship: {
        type: 'basetable',
        connectionName: 'duckdb',
      },
      structSource: {
        type: 'query',
        query: {
          type: 'query',
          structRef: {
            type: 'struct',
            name: 'duckdb:usa_names.parquet',
            dialect: 'duckdb',
            structSource: {
              type: 'table',
              tablePath: 'usa_names.parquet',
            },
            structRelationship: {
              type: 'basetable',
              connectionName: 'duckdb',
            },
            fields: [
              {
                type: 'string',
                name: 'state',
                location: {
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                name: 'population',
                type: 'number',
                location: {
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                e: [
                  {
                    type: 'aggregate',
                    function: 'sum',
                    e: [
                      {
                        type: 'field',
                        path: ['number'],
                      },
                    ],
                  },
                ],
                expressionType: 'aggregate',
                code: '`number`.sum()',
              },
              {
                name: 'decade',
                type: 'number',
                location: {
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                e: [
                  {
                    type: 'function_call',
                    overload: {
                      returnType: {
                        dataType: 'number',
                        expressionType: 'scalar',
                        evalSpace: 'input',
                      },
                      params: [
                        {
                          name: 'value',
                          isVariadic: false,
                          allowedTypes: [
                            {
                              dataType: 'number',
                              evalSpace: 'input',
                            },
                          ],
                        },
                      ],
                      dialect: {
                        postgres: {
                          e: [
                            {
                              type: 'sql_expression',
                              e: [
                                'FLOOR(',
                                {
                                  type: 'function_parameter',
                                  name: 'value',
                                },
                                ')',
                              ],
                            },
                          ],
                        },
                        standardsql: {
                          e: [
                            {
                              type: 'sql_expression',
                              e: [
                                'FLOOR(',
                                {
                                  type: 'function_parameter',
                                  name: 'value',
                                },
                                ')',
                              ],
                            },
                          ],
                        },
                        duckdb: {
                          e: [
                            {
                              type: 'sql_expression',
                              e: [
                                'FLOOR(',
                                {
                                  type: 'function_parameter',
                                  name: 'value',
                                },
                                ')',
                              ],
                            },
                          ],
                        },
                      },
                    },
                    name: 'floor',
                    args: [
                      [
                        {
                          type: 'dialect',
                          function: 'div',
                          numerator: [
                            {
                              type: 'field',
                              path: ['year_born'],
                            },
                          ],
                          denominator: [
                            {
                              type: 'dialect',
                              function: 'numberLiteral',
                              literal: '10',
                            },
                          ],
                        },
                      ],
                    ],
                    expressionType: 'scalar',
                  },
                  '*',
                  {
                    type: 'dialect',
                    function: 'numberLiteral',
                    literal: '10',
                  },
                ],
                expressionType: 'scalar',
                code: 'floor(year_born/10)*10',
              },
              {
                name: 'births_per_100k',
                type: 'number',
                location: {
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                e: [
                  {
                    type: 'function_call',
                    overload: {
                      returnType: {
                        dataType: 'number',
                        expressionType: 'scalar',
                        evalSpace: 'input',
                      },
                      params: [
                        {
                          name: 'value',
                          isVariadic: false,
                          allowedTypes: [
                            {
                              dataType: 'number',
                              evalSpace: 'input',
                            },
                          ],
                        },
                      ],
                      dialect: {
                        postgres: {
                          e: [
                            {
                              type: 'sql_expression',
                              e: [
                                'FLOOR(',
                                {
                                  type: 'function_parameter',
                                  name: 'value',
                                },
                                ')',
                              ],
                            },
                          ],
                        },
                        standardsql: {
                          e: [
                            {
                              type: 'sql_expression',
                              e: [
                                'FLOOR(',
                                {
                                  type: 'function_parameter',
                                  name: 'value',
                                },
                                ')',
                              ],
                            },
                          ],
                        },
                        duckdb: {
                          e: [
                            {
                              type: 'sql_expression',
                              e: [
                                'FLOOR(',
                                {
                                  type: 'function_parameter',
                                  name: 'value',
                                },
                                ')',
                              ],
                            },
                          ],
                        },
                      },
                    },
                    name: 'floor',
                    args: [
                      [
                        {
                          type: 'dialect',
                          function: 'div',
                          numerator: [
                            {
                              type: 'field',
                              path: ['population'],
                            },
                          ],
                          denominator: [
                            {
                              type: 'all',
                              e: [
                                {
                                  type: 'field',
                                  path: ['population'],
                                },
                              ],
                            },
                          ],
                        },
                        '*',
                        {
                          type: 'dialect',
                          function: 'numberLiteral',
                          literal: '100000',
                        },
                      ],
                    ],
                    expressionType: 'ungrouped_aggregate',
                  },
                ],
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
                annotation: {},
                location: {
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                annotation: {},
                location: {
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                annotation: {},
                location: {
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                annotation: {},
                location: {
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
              url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            as: 'names',
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
                  name: 'cohort_size',
                  type: 'number',
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                  e: [
                    {
                      type: 'field',
                      path: ['population'],
                    },
                  ],
                  expressionType: 'aggregate',
                  code: 'population',
                },
              ],
              filterList: [],
            },
          ],
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
        },
      },
      resultMetadata: {
        sourceField: 'ignoreme',
        filterList: [],
        sourceClasses: ['ignoreme'],
        fieldKind: 'struct',
      },
      type: 'struct',
      as: 'cohort',
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
      type: 'struct',
      name: 'duckdb:usa_names.parquet',
      dialect: 'duckdb',
      structSource: {
        type: 'table',
        tablePath: 'usa_names.parquet',
      },
      structRelationship: {
        type: 'basetable',
        connectionName: 'duckdb',
      },
      fields: [
        {
          type: 'string',
          name: 'state',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          name: 'population',
          type: 'number',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          e: [
            {
              type: 'aggregate',
              function: 'sum',
              e: [
                {
                  type: 'field',
                  path: ['number'],
                },
              ],
            },
          ],
          expressionType: 'aggregate',
          code: '`number`.sum()',
        },
        {
          name: 'decade',
          type: 'number',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          e: [
            {
              type: 'function_call',
              overload: {
                returnType: {
                  dataType: 'number',
                  expressionType: 'scalar',
                  evalSpace: 'input',
                },
                params: [
                  {
                    name: 'value',
                    isVariadic: false,
                    allowedTypes: [
                      {
                        dataType: 'number',
                        evalSpace: 'input',
                      },
                    ],
                  },
                ],
                dialect: {
                  postgres: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                  standardsql: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                  duckdb: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                },
              },
              name: 'floor',
              args: [
                [
                  {
                    type: 'dialect',
                    function: 'div',
                    numerator: [
                      {
                        type: 'field',
                        path: ['year_born'],
                      },
                    ],
                    denominator: [
                      {
                        type: 'dialect',
                        function: 'numberLiteral',
                        literal: '10',
                      },
                    ],
                  },
                ],
              ],
              expressionType: 'scalar',
            },
            '*',
            {
              type: 'dialect',
              function: 'numberLiteral',
              literal: '10',
            },
          ],
          expressionType: 'scalar',
          code: 'floor(year_born/10)*10',
        },
        {
          name: 'births_per_100k',
          type: 'number',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          e: [
            {
              type: 'function_call',
              overload: {
                returnType: {
                  dataType: 'number',
                  expressionType: 'scalar',
                  evalSpace: 'input',
                },
                params: [
                  {
                    name: 'value',
                    isVariadic: false,
                    allowedTypes: [
                      {
                        dataType: 'number',
                        evalSpace: 'input',
                      },
                    ],
                  },
                ],
                dialect: {
                  postgres: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                  standardsql: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                  duckdb: {
                    e: [
                      {
                        type: 'sql_expression',
                        e: [
                          'FLOOR(',
                          {
                            type: 'function_parameter',
                            name: 'value',
                          },
                          ')',
                        ],
                      },
                    ],
                  },
                },
              },
              name: 'floor',
              args: [
                [
                  {
                    type: 'dialect',
                    function: 'div',
                    numerator: [
                      {
                        type: 'field',
                        path: ['population'],
                      },
                    ],
                    denominator: [
                      {
                        type: 'all',
                        e: [
                          {
                            type: 'field',
                            path: ['population'],
                          },
                        ],
                      },
                    ],
                  },
                  '*',
                  {
                    type: 'dialect',
                    function: 'numberLiteral',
                    literal: '100000',
                  },
                ],
              ],
              expressionType: 'ungrouped_aggregate',
            },
          ],
          expressionType: 'ungrouped_aggregate',
          code: 'floor(population/all(population)*100000)',
        },
        {
          fields: [
            {
              name: 'gender',
              type: 'string',
              resultMetadata: {
                sourceField: 'gender',
                sourceClasses: ['gender'],
                fieldKind: 'dimension',
              },
              location: {
                url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
              name: 'state',
              type: 'string',
              resultMetadata: {
                sourceField: 'state',
                sourceClasses: ['state'],
                fieldKind: 'dimension',
              },
              location: {
                url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
              name: 'year_born',
              numberType: 'integer',
              type: 'number',
              resultMetadata: {
                sourceField: 'year',
                sourceClasses: ['year'],
                fieldKind: 'dimension',
              },
              location: {
                url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            },
            {
              name: 'cohort_size',
              type: 'number',
              resultMetadata: {
                sourceField: 'cohort_size',
                sourceExpression: 'population',
                filterList: [],
                sourceClasses: ['cohort_size'],
                fieldKind: 'measure',
              },
              location: {
                url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            },
            {
              name: 'population',
              type: 'number',
              location: {
                url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
              e: [
                {
                  type: 'aggregate',
                  function: 'sum',
                  e: [
                    {
                      type: 'field',
                      path: ['cohort_size'],
                    },
                  ],
                },
              ],
              expressionType: 'aggregate',
              code: 'cohort_size.sum()',
            },
          ],
          name: 'cohort',
          dialect: 'duckdb',
          structRelationship: {
            type: 'one',
            matrixOperation: 'left',
            onExpression: [
              '((',
              {
                type: 'field',
                path: ['gender'],
              },
              '=',
              {
                type: 'field',
                path: ['cohort', 'gender'],
              },
              ')and(',
              {
                type: 'field',
                path: ['state'],
              },
              '=',
              {
                type: 'field',
                path: ['cohort', 'state'],
              },
              '))and(',
              {
                type: 'field',
                path: ['year_born'],
              },
              '=',
              {
                type: 'field',
                path: ['cohort', 'year_born'],
              },
              ')',
            ],
          },
          structSource: {
            type: 'query',
            query: {
              type: 'query',
              structRef: {
                type: 'struct',
                name: 'duckdb:usa_names.parquet',
                dialect: 'duckdb',
                structSource: {
                  type: 'table',
                  tablePath: 'usa_names.parquet',
                },
                structRelationship: {
                  type: 'basetable',
                  connectionName: 'duckdb',
                },
                fields: [
                  {
                    type: 'string',
                    name: 'state',
                    location: {
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                    name: 'population',
                    type: 'number',
                    location: {
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                    e: [
                      {
                        type: 'aggregate',
                        function: 'sum',
                        e: [
                          {
                            type: 'field',
                            path: ['number'],
                          },
                        ],
                      },
                    ],
                    expressionType: 'aggregate',
                    code: '`number`.sum()',
                  },
                  {
                    name: 'decade',
                    type: 'number',
                    location: {
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                    e: [
                      {
                        type: 'function_call',
                        overload: {
                          returnType: {
                            dataType: 'number',
                            expressionType: 'scalar',
                            evalSpace: 'input',
                          },
                          params: [
                            {
                              name: 'value',
                              isVariadic: false,
                              allowedTypes: [
                                {
                                  dataType: 'number',
                                  evalSpace: 'input',
                                },
                              ],
                            },
                          ],
                          dialect: {
                            postgres: {
                              e: [
                                {
                                  type: 'sql_expression',
                                  e: [
                                    'FLOOR(',
                                    {
                                      type: 'function_parameter',
                                      name: 'value',
                                    },
                                    ')',
                                  ],
                                },
                              ],
                            },
                            standardsql: {
                              e: [
                                {
                                  type: 'sql_expression',
                                  e: [
                                    'FLOOR(',
                                    {
                                      type: 'function_parameter',
                                      name: 'value',
                                    },
                                    ')',
                                  ],
                                },
                              ],
                            },
                            duckdb: {
                              e: [
                                {
                                  type: 'sql_expression',
                                  e: [
                                    'FLOOR(',
                                    {
                                      type: 'function_parameter',
                                      name: 'value',
                                    },
                                    ')',
                                  ],
                                },
                              ],
                            },
                          },
                        },
                        name: 'floor',
                        args: [
                          [
                            {
                              type: 'dialect',
                              function: 'div',
                              numerator: [
                                {
                                  type: 'field',
                                  path: ['year_born'],
                                },
                              ],
                              denominator: [
                                {
                                  type: 'dialect',
                                  function: 'numberLiteral',
                                  literal: '10',
                                },
                              ],
                            },
                          ],
                        ],
                        expressionType: 'scalar',
                      },
                      '*',
                      {
                        type: 'dialect',
                        function: 'numberLiteral',
                        literal: '10',
                      },
                    ],
                    expressionType: 'scalar',
                    code: 'floor(year_born/10)*10',
                  },
                  {
                    name: 'births_per_100k',
                    type: 'number',
                    location: {
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                    e: [
                      {
                        type: 'function_call',
                        overload: {
                          returnType: {
                            dataType: 'number',
                            expressionType: 'scalar',
                            evalSpace: 'input',
                          },
                          params: [
                            {
                              name: 'value',
                              isVariadic: false,
                              allowedTypes: [
                                {
                                  dataType: 'number',
                                  evalSpace: 'input',
                                },
                              ],
                            },
                          ],
                          dialect: {
                            postgres: {
                              e: [
                                {
                                  type: 'sql_expression',
                                  e: [
                                    'FLOOR(',
                                    {
                                      type: 'function_parameter',
                                      name: 'value',
                                    },
                                    ')',
                                  ],
                                },
                              ],
                            },
                            standardsql: {
                              e: [
                                {
                                  type: 'sql_expression',
                                  e: [
                                    'FLOOR(',
                                    {
                                      type: 'function_parameter',
                                      name: 'value',
                                    },
                                    ')',
                                  ],
                                },
                              ],
                            },
                            duckdb: {
                              e: [
                                {
                                  type: 'sql_expression',
                                  e: [
                                    'FLOOR(',
                                    {
                                      type: 'function_parameter',
                                      name: 'value',
                                    },
                                    ')',
                                  ],
                                },
                              ],
                            },
                          },
                        },
                        name: 'floor',
                        args: [
                          [
                            {
                              type: 'dialect',
                              function: 'div',
                              numerator: [
                                {
                                  type: 'field',
                                  path: ['population'],
                                },
                              ],
                              denominator: [
                                {
                                  type: 'all',
                                  e: [
                                    {
                                      type: 'field',
                                      path: ['population'],
                                    },
                                  ],
                                },
                              ],
                            },
                            '*',
                            {
                              type: 'dialect',
                              function: 'numberLiteral',
                              literal: '100000',
                            },
                          ],
                        ],
                        expressionType: 'ungrouped_aggregate',
                      },
                    ],
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
                    annotation: {},
                    location: {
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                    annotation: {},
                    location: {
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                    annotation: {},
                    location: {
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                    annotation: {},
                    location: {
                      url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                  url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                as: 'names',
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
                      name: 'cohort_size',
                      type: 'number',
                      location: {
                        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                      e: [
                        {
                          type: 'field',
                          path: ['population'],
                        },
                      ],
                      expressionType: 'aggregate',
                      code: 'population',
                    },
                  ],
                  filterList: [],
                },
              ],
              location: {
                url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
            },
          },
          resultMetadata: {
            sourceField: 'ignoreme',
            filterList: [],
            sourceClasses: ['ignoreme'],
            fieldKind: 'struct',
          },
          type: 'struct',
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
                  name: 'by_year_line_chart',
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
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 41,
                        character: 10,
                      },
                      end: {
                        line: 44,
                        character: 5,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'by_state_shape_map',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['state'],
                        },
                        {
                          name: 'per_100k',
                          type: 'number',
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 47,
                                character: 17,
                              },
                              end: {
                                line: 47,
                                character: 71,
                              },
                            },
                          },
                          e: [
                            {
                              type: 'dialect',
                              function: 'div',
                              numerator: [
                                {
                                  type: 'field',
                                  path: ['population'],
                                },
                              ],
                              denominator: [
                                {
                                  type: 'exclude',
                                  e: [
                                    {
                                      type: 'field',
                                      path: ['population'],
                                    },
                                  ],
                                  fields: ['name'],
                                },
                              ],
                            },
                            '*',
                            {
                              type: 'dialect',
                              function: 'numberLiteral',
                              literal: '100000',
                            },
                          ],
                          expressionType: 'ungrouped_aggregate',
                          code: 'population/exclude(population,name)*100000',
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 45,
                        character: 10,
                      },
                      end: {
                        line: 48,
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 38,
                character: 8,
              },
              end: {
                line: 50,
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
                  name: 'all_name',
                  type: 'number',
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 54,
                        character: 6,
                      },
                      end: {
                        line: 54,
                        character: 39,
                      },
                    },
                  },
                  e: [
                    {
                      type: 'all',
                      e: [
                        {
                          type: 'field',
                          path: ['population'],
                        },
                      ],
                      fields: ['name'],
                    },
                  ],
                  expressionType: 'ungrouped_aggregate',
                  code: 'all(population, name)',
                },
                {
                  name: 'name_popularity',
                  type: 'number',
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 55,
                        character: 6,
                      },
                      end: {
                        line: 55,
                        character: 64,
                      },
                    },
                  },
                  e: [
                    {
                      type: 'dialect',
                      function: 'div',
                      numerator: [
                        {
                          type: 'all',
                          e: [
                            {
                              type: 'field',
                              path: ['population'],
                            },
                          ],
                          fields: ['name'],
                        },
                      ],
                      denominator: [
                        {
                          type: 'all',
                          e: [
                            {
                              type: 'field',
                              path: ['population'],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  expressionType: 'ungrouped_aggregate',
                  code: 'all(population, name) / all(population)',
                },
                {
                  name: 'state_popularity',
                  type: 'number',
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 56,
                        character: 6,
                      },
                      end: {
                        line: 56,
                        character: 61,
                      },
                    },
                  },
                  e: [
                    {
                      type: 'dialect',
                      function: 'div',
                      numerator: [
                        {
                          type: 'field',
                          path: ['population'],
                        },
                      ],
                      denominator: [
                        {
                          type: 'all',
                          e: [
                            {
                              type: 'field',
                              path: ['population'],
                            },
                          ],
                          fields: ['state'],
                        },
                      ],
                    },
                  ],
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
                                  name: 'popularity',
                                  type: 'number',
                                  location: {
                                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 67,
                                        character: 10,
                                      },
                                      end: {
                                        line: 67,
                                        character: 58,
                                      },
                                    },
                                  },
                                  e: [
                                    {
                                      type: 'dialect',
                                      function: 'div',
                                      numerator: [
                                        {
                                          type: 'field',
                                          path: ['state_popularity'],
                                        },
                                      ],
                                      denominator: [
                                        {
                                          type: 'field',
                                          path: ['name_popularity'],
                                        },
                                      ],
                                    },
                                  ],
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
                          annotation: {},
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 64,
                                character: 12,
                              },
                              end: {
                                line: 70,
                                character: 7,
                              },
                            },
                          },
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 62,
                        character: 10,
                      },
                      end: {
                        line: 71,
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
                  code: 'all_name > 3000',
                  expression: [
                    {
                      type: 'field',
                      path: ['all_name'],
                    },
                    '>',
                    {
                      type: 'dialect',
                      function: 'numberLiteral',
                      literal: '3000',
                    },
                  ],
                  expressionType: 'scalar',
                },
              ],
            },
          ],
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 51,
                character: 8,
              },
              end: {
                line: 74,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'gender_year_line_chart',
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
                  name: 'gender',
                  type: 'string',
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 79,
                        character: 14,
                      },
                      end: {
                        line: 79,
                        character: 67,
                      },
                    },
                  },
                  e: [
                    'CASE WHEN ',
                    {
                      type: 'field',
                      path: ['gender'],
                    },
                    '=',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'F',
                    },
                    ' THEN ',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'Female',
                    },
                    ' ELSE ',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'Male',
                    },
                    ' END',
                  ],
                  expressionType: 'scalar',
                  code: "gender ? pick 'Female' when 'F' else 'Male'",
                },
              ],
              filterList: [],
            },
          ],
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 76,
                character: 8,
              },
              end: {
                line: 80,
                character: 3,
              },
            },
          },
        },
        {
          type: 'turtle',
          name: 'gender_by_state_shape_map',
          pipeline: [
            {
              type: 'reduce',
              queryFields: [
                {
                  type: 'fieldref',
                  path: ['state'],
                },
                {
                  name: 'percent_female',
                  type: 'number',
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 84,
                        character: 17,
                      },
                      end: {
                        line: 84,
                        character: 75,
                      },
                    },
                  },
                  e: [
                    {
                      type: 'dialect',
                      function: 'div',
                      numerator: [
                        {
                          type: 'filterExpression',
                          e: [
                            {
                              type: 'field',
                              path: ['population'],
                            },
                          ],
                          filterList: [
                            {
                              code: "gender='M'",
                              expression: [
                                {
                                  type: 'field',
                                  path: ['gender'],
                                },
                                '=',
                                {
                                  type: 'dialect',
                                  function: 'stringLiteral',
                                  literal: 'M',
                                },
                              ],
                              expressionType: 'scalar',
                            },
                          ],
                        },
                      ],
                      denominator: [
                        {
                          type: 'field',
                          path: ['population'],
                        },
                      ],
                    },
                  ],
                  expressionType: 'aggregate',
                  code: "population{where: gender='M'}/population",
                },
              ],
              filterList: [],
            },
          ],
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 82,
                character: 9,
              },
              end: {
                line: 85,
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
                  name: 'gender_year_line_chart',
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
                          name: 'gender',
                          type: 'string',
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 79,
                                character: 14,
                              },
                              end: {
                                line: 79,
                                character: 67,
                              },
                            },
                          },
                          e: [
                            'CASE WHEN ',
                            {
                              type: 'field',
                              path: ['gender'],
                            },
                            '=',
                            {
                              type: 'dialect',
                              function: 'stringLiteral',
                              literal: 'F',
                            },
                            ' THEN ',
                            {
                              type: 'dialect',
                              function: 'stringLiteral',
                              literal: 'Female',
                            },
                            ' ELSE ',
                            {
                              type: 'dialect',
                              function: 'stringLiteral',
                              literal: 'Male',
                            },
                            ' END',
                          ],
                          expressionType: 'scalar',
                          code: "gender ? pick 'Female' when 'F' else 'Male'",
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: {},
                  },
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 90,
                        character: 10,
                      },
                      end: {
                        line: 90,
                        character: 32,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'gender_by_state_shape_map',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['state'],
                        },
                        {
                          name: 'percent_female',
                          type: 'number',
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 84,
                                character: 17,
                              },
                              end: {
                                line: 84,
                                character: 75,
                              },
                            },
                          },
                          e: [
                            {
                              type: 'dialect',
                              function: 'div',
                              numerator: [
                                {
                                  type: 'filterExpression',
                                  e: [
                                    {
                                      type: 'field',
                                      path: ['population'],
                                    },
                                  ],
                                  filterList: [
                                    {
                                      code: "gender='M'",
                                      expression: [
                                        {
                                          type: 'field',
                                          path: ['gender'],
                                        },
                                        '=',
                                        {
                                          type: 'dialect',
                                          function: 'stringLiteral',
                                          literal: 'M',
                                        },
                                      ],
                                      expressionType: 'scalar',
                                    },
                                  ],
                                },
                              ],
                              denominator: [
                                {
                                  type: 'field',
                                  path: ['population'],
                                },
                              ],
                            },
                          ],
                          expressionType: 'aggregate',
                          code: "population{where: gender='M'}/population",
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: {},
                  },
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 91,
                        character: 10,
                      },
                      end: {
                        line: 91,
                        character: 35,
                      },
                    },
                  },
                },
              ],
              limit: 10,
              filterList: [
                {
                  code: "population{where: gender='F'}/population ? > .10 & < .9",
                  expression: [
                    '(',
                    {
                      type: 'dialect',
                      function: 'div',
                      numerator: [
                        {
                          type: 'filterExpression',
                          e: [
                            {
                              type: 'outputField',
                              name: 'population',
                            },
                          ],
                          filterList: [
                            {
                              code: "gender='F'",
                              expression: [
                                {
                                  type: 'field',
                                  path: ['gender'],
                                },
                                '=',
                                {
                                  type: 'dialect',
                                  function: 'stringLiteral',
                                  literal: 'F',
                                },
                              ],
                              expressionType: 'scalar',
                            },
                          ],
                        },
                      ],
                      denominator: [
                        {
                          type: 'outputField',
                          name: 'population',
                        },
                      ],
                    },
                    '>',
                    {
                      type: 'dialect',
                      function: 'numberLiteral',
                      literal: '.10',
                    },
                    ')and(',
                    {
                      type: 'dialect',
                      function: 'div',
                      numerator: [
                        {
                          type: 'filterExpression',
                          e: [
                            {
                              type: 'outputField',
                              name: 'population',
                            },
                          ],
                          filterList: [
                            {
                              code: "gender='F'",
                              expression: [
                                {
                                  type: 'field',
                                  path: ['gender'],
                                },
                                '=',
                                {
                                  type: 'dialect',
                                  function: 'stringLiteral',
                                  literal: 'F',
                                },
                              ],
                              expressionType: 'scalar',
                            },
                          ],
                        },
                      ],
                      denominator: [
                        {
                          type: 'outputField',
                          name: 'population',
                        },
                      ],
                    },
                    '<',
                    {
                      type: 'dialect',
                      function: 'numberLiteral',
                      literal: '.9',
                    },
                    ')',
                  ],
                  expressionType: 'aggregate',
                },
              ],
            },
          ],
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 87,
                character: 8,
              },
              end: {
                line: 94,
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
                  name: 'gender_year_line_chart',
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
                          name: 'gender',
                          type: 'string',
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 79,
                                character: 14,
                              },
                              end: {
                                line: 79,
                                character: 67,
                              },
                            },
                          },
                          e: [
                            'CASE WHEN ',
                            {
                              type: 'field',
                              path: ['gender'],
                            },
                            '=',
                            {
                              type: 'dialect',
                              function: 'stringLiteral',
                              literal: 'F',
                            },
                            ' THEN ',
                            {
                              type: 'dialect',
                              function: 'stringLiteral',
                              literal: 'Female',
                            },
                            ' ELSE ',
                            {
                              type: 'dialect',
                              function: 'stringLiteral',
                              literal: 'Male',
                            },
                            ' END',
                          ],
                          expressionType: 'scalar',
                          code: "gender ? pick 'Female' when 'F' else 'Male'",
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: {},
                  },
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 100,
                        character: 10,
                      },
                      end: {
                        line: 100,
                        character: 32,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'gender_by_state_shape_map',
                  pipeline: [
                    {
                      type: 'reduce',
                      queryFields: [
                        {
                          type: 'fieldref',
                          path: ['state'],
                        },
                        {
                          name: 'percent_female',
                          type: 'number',
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 84,
                                character: 17,
                              },
                              end: {
                                line: 84,
                                character: 75,
                              },
                            },
                          },
                          e: [
                            {
                              type: 'dialect',
                              function: 'div',
                              numerator: [
                                {
                                  type: 'filterExpression',
                                  e: [
                                    {
                                      type: 'field',
                                      path: ['population'],
                                    },
                                  ],
                                  filterList: [
                                    {
                                      code: "gender='M'",
                                      expression: [
                                        {
                                          type: 'field',
                                          path: ['gender'],
                                        },
                                        '=',
                                        {
                                          type: 'dialect',
                                          function: 'stringLiteral',
                                          literal: 'M',
                                        },
                                      ],
                                      expressionType: 'scalar',
                                    },
                                  ],
                                },
                              ],
                              denominator: [
                                {
                                  type: 'field',
                                  path: ['population'],
                                },
                              ],
                            },
                          ],
                          expressionType: 'aggregate',
                          code: "population{where: gender='M'}/population",
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {
                    inherits: {},
                  },
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 101,
                        character: 10,
                      },
                      end: {
                        line: 101,
                        character: 35,
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
                          name: 'gender_by_state_shape_map',
                          pipeline: [
                            {
                              type: 'reduce',
                              queryFields: [
                                {
                                  type: 'fieldref',
                                  path: ['state'],
                                },
                                {
                                  name: 'percent_female',
                                  type: 'number',
                                  location: {
                                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 84,
                                        character: 17,
                                      },
                                      end: {
                                        line: 84,
                                        character: 75,
                                      },
                                    },
                                  },
                                  e: [
                                    {
                                      type: 'dialect',
                                      function: 'div',
                                      numerator: [
                                        {
                                          type: 'filterExpression',
                                          e: [
                                            {
                                              type: 'field',
                                              path: ['population'],
                                            },
                                          ],
                                          filterList: [
                                            {
                                              code: "gender='M'",
                                              expression: [
                                                {
                                                  type: 'field',
                                                  path: ['gender'],
                                                },
                                                '=',
                                                {
                                                  type: 'dialect',
                                                  function: 'stringLiteral',
                                                  literal: 'M',
                                                },
                                              ],
                                              expressionType: 'scalar',
                                            },
                                          ],
                                        },
                                      ],
                                      denominator: [
                                        {
                                          type: 'field',
                                          path: ['population'],
                                        },
                                      ],
                                    },
                                  ],
                                  expressionType: 'aggregate',
                                  code: "population{where: gender='M'}/population",
                                },
                              ],
                              filterList: [],
                            },
                          ],
                          annotation: {
                            inherits: {},
                          },
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 104,
                                character: 12,
                              },
                              end: {
                                line: 104,
                                character: 37,
                              },
                            },
                          },
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 102,
                        character: 10,
                      },
                      end: {
                        line: 105,
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
                          name: 'gender_year_line_chart',
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
                                  name: 'gender',
                                  type: 'string',
                                  location: {
                                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 79,
                                        character: 14,
                                      },
                                      end: {
                                        line: 79,
                                        character: 67,
                                      },
                                    },
                                  },
                                  e: [
                                    'CASE WHEN ',
                                    {
                                      type: 'field',
                                      path: ['gender'],
                                    },
                                    '=',
                                    {
                                      type: 'dialect',
                                      function: 'stringLiteral',
                                      literal: 'F',
                                    },
                                    ' THEN ',
                                    {
                                      type: 'dialect',
                                      function: 'stringLiteral',
                                      literal: 'Female',
                                    },
                                    ' ELSE ',
                                    {
                                      type: 'dialect',
                                      function: 'stringLiteral',
                                      literal: 'Male',
                                    },
                                    ' END',
                                  ],
                                  expressionType: 'scalar',
                                  code: "gender ? pick 'Female' when 'F' else 'Male'",
                                },
                              ],
                              filterList: [],
                            },
                          ],
                          annotation: {
                            inherits: {},
                          },
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 108,
                                character: 12,
                              },
                              end: {
                                line: 108,
                                character: 34,
                              },
                            },
                          },
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 106,
                        character: 10,
                      },
                      end: {
                        line: 109,
                        character: 5,
                      },
                    },
                  },
                },
              ],
              filterList: [
                {
                  code: "name = 'Kelly'",
                  expression: [
                    {
                      type: 'field',
                      path: ['name'],
                    },
                    '=',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'Kelly',
                    },
                  ],
                  expressionType: 'scalar',
                },
              ],
            },
          ],
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 96,
                character: 8,
              },
              end: {
                line: 110,
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
                          name: 'percent_in_decade',
                          type: 'number',
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 123,
                                character: 17,
                              },
                              end: {
                                line: 123,
                                character: 64,
                              },
                            },
                          },
                          e: [
                            {
                              type: 'dialect',
                              function: 'div',
                              numerator: [
                                {
                                  type: 'field',
                                  path: ['population'],
                                },
                              ],
                              denominator: [
                                {
                                  type: 'all',
                                  e: [
                                    {
                                      type: 'field',
                                      path: ['population'],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
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
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 121,
                        character: 10,
                      },
                      end: {
                        line: 126,
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
                  name: 'years_apart',
                  type: 'number',
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 134,
                        character: 6,
                      },
                      end: {
                        line: 134,
                        character: 64,
                      },
                    },
                  },
                  e: [
                    {
                      type: 'aggregate',
                      function: 'max',
                      e: [
                        {
                          type: 'field',
                          path: ['by_decade', 'decade'],
                        },
                      ],
                    },
                    '-',
                    {
                      type: 'aggregate',
                      function: 'min',
                      e: [
                        {
                          type: 'field',
                          path: ['by_decade', 'decade'],
                        },
                      ],
                    },
                  ],
                  expressionType: 'aggregate',
                  code: 'max(by_decade.decade)-min(by_decade.decade)',
                },
                {
                  name: 'total_percentage',
                  type: 'number',
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 135,
                        character: 6,
                      },
                      end: {
                        line: 135,
                        character: 59,
                      },
                    },
                  },
                  e: [
                    {
                      type: 'aggregate',
                      function: 'sum',
                      e: [
                        {
                          type: 'field',
                          path: ['by_decade', 'percent_in_decade'],
                        },
                      ],
                      structPath: ['by_decade'],
                    },
                  ],
                  expressionType: 'aggregate',
                  code: 'by_decade.percent_in_decade.sum()',
                },
                {
                  name: 'max_percentage',
                  type: 'number',
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 136,
                        character: 6,
                      },
                      end: {
                        line: 136,
                        character: 56,
                      },
                    },
                  },
                  e: [
                    {
                      type: 'aggregate',
                      function: 'max',
                      e: [
                        {
                          type: 'field',
                          path: ['by_decade', 'percent_in_decade'],
                        },
                      ],
                    },
                  ],
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
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 137,
                        character: 10,
                      },
                      end: {
                        line: 139,
                        character: 5,
                      },
                    },
                  },
                },
              ],
              limit: 10,
              filterList: [
                {
                  code: 'population > 3000',
                  expression: [
                    {
                      type: 'field',
                      path: ['population'],
                    },
                    '>',
                    {
                      type: 'dialect',
                      function: 'numberLiteral',
                      literal: '3000',
                    },
                  ],
                  expressionType: 'scalar',
                },
              ],
            },
          ],
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 118,
                character: 9,
              },
              end: {
                line: 141,
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
                  name: 'by_name_line_chart',
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
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 145,
                        character: 10,
                      },
                      end: {
                        line: 149,
                        character: 5,
                      },
                    },
                  },
                },
                {
                  type: 'turtle',
                  name: 'by_name_bar_chart',
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
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 150,
                        character: 10,
                      },
                      end: {
                        line: 154,
                        character: 5,
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
                          type: 'fieldref',
                          path: ['name'],
                        },
                        {
                          type: 'fieldref',
                          path: ['population'],
                        },
                        {
                          type: 'turtle',
                          name: 'by_year_line_chart',
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
                          annotation: {},
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 158,
                                character: 12,
                              },
                              end: {
                                line: 161,
                                character: 7,
                              },
                            },
                          },
                        },
                        {
                          type: 'turtle',
                          name: 'by_state_shape_map',
                          pipeline: [
                            {
                              type: 'reduce',
                              queryFields: [
                                {
                                  type: 'fieldref',
                                  path: ['state'],
                                },
                                {
                                  name: 'per_100k',
                                  type: 'number',
                                  location: {
                                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 164,
                                        character: 19,
                                      },
                                      end: {
                                        line: 164,
                                        character: 68,
                                      },
                                    },
                                  },
                                  e: [
                                    {
                                      type: 'dialect',
                                      function: 'div',
                                      numerator: [
                                        {
                                          type: 'field',
                                          path: ['population'],
                                        },
                                      ],
                                      denominator: [
                                        {
                                          type: 'field',
                                          path: ['cohort', 'population'],
                                        },
                                      ],
                                    },
                                    '*',
                                    {
                                      type: 'dialect',
                                      function: 'numberLiteral',
                                      literal: '100000',
                                    },
                                  ],
                                  expressionType: 'aggregate',
                                  code: 'population/cohort.population * 100000',
                                },
                              ],
                              filterList: [],
                            },
                          ],
                          annotation: {},
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 162,
                                character: 12,
                              },
                              end: {
                                line: 165,
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
                                  name: 'per_100k',
                                  type: 'number',
                                  location: {
                                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                                    range: {
                                      start: {
                                        line: 168,
                                        character: 19,
                                      },
                                      end: {
                                        line: 168,
                                        character: 68,
                                      },
                                    },
                                  },
                                  e: [
                                    {
                                      type: 'dialect',
                                      function: 'div',
                                      numerator: [
                                        {
                                          type: 'field',
                                          path: ['population'],
                                        },
                                      ],
                                      denominator: [
                                        {
                                          type: 'field',
                                          path: ['cohort', 'population'],
                                        },
                                      ],
                                    },
                                    '*',
                                    {
                                      type: 'dialect',
                                      function: 'numberLiteral',
                                      literal: '100000',
                                    },
                                  ],
                                  expressionType: 'aggregate',
                                  code: 'population/cohort.population * 100000',
                                },
                              ],
                              limit: 5,
                              filterList: [],
                            },
                          ],
                          annotation: {},
                          location: {
                            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                            range: {
                              start: {
                                line: 166,
                                character: 6,
                              },
                              end: {
                                line: 170,
                                character: 7,
                              },
                            },
                          },
                        },
                      ],
                      filterList: [],
                    },
                  ],
                  annotation: {},
                  location: {
                    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
                    range: {
                      start: {
                        line: 155,
                        character: 10,
                      },
                      end: {
                        line: 171,
                        character: 5,
                      },
                    },
                  },
                },
              ],
              filterList: [
                {
                  code: "name = 'Lloyd' | 'Anika' | 'Jessie' | 'Kelly' | 'Todd' | 'Chris'",
                  expression: [
                    '(',
                    {
                      type: 'field',
                      path: ['name'],
                    },
                    '=',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'Lloyd',
                    },
                    ')or((',
                    {
                      type: 'field',
                      path: ['name'],
                    },
                    '=',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'Anika',
                    },
                    ')or((',
                    {
                      type: 'field',
                      path: ['name'],
                    },
                    '=',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'Jessie',
                    },
                    ')or((',
                    {
                      type: 'field',
                      path: ['name'],
                    },
                    '=',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'Kelly',
                    },
                    ')or((',
                    {
                      type: 'field',
                      path: ['name'],
                    },
                    '=',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'Todd',
                    },
                    ')or(',
                    {
                      type: 'field',
                      path: ['name'],
                    },
                    '=',
                    {
                      type: 'dialect',
                      function: 'stringLiteral',
                      literal: 'Chris',
                    },
                    ')))))',
                  ],
                  expressionType: 'scalar',
                },
              ],
            },
          ],
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 143,
                character: 8,
              },
              end: {
                line: 172,
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
          annotation: {},
          location: {
            url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
            range: {
              start: {
                line: 174,
                character: 8,
              },
              end: {
                line: 176,
                character: 3,
              },
            },
          },
        },
      ],
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
        range: {
          start: {
            line: 33,
            character: 8,
          },
          end: {
            line: 177,
            character: 47,
          },
        },
      },
      as: 'names2',
    },
  },
};

const source: StructDef = {
  type: 'struct',
  name: 'duckdb:usa_names.parquet',
  dialect: 'duckdb',
  structSource: {
    type: 'table',
    tablePath: 'usa_names.parquet',
  },
  structRelationship: {
    type: 'basetable',
    connectionName: 'duckdb',
  },
  fields: [
    {
      type: 'string',
      name: 'state',
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
      name: 'population',
      type: 'number',
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
      e: [
        {
          type: 'aggregate',
          function: 'sum',
          e: [
            {
              type: 'field',
              path: ['number'],
            },
          ],
        },
      ],
      expressionType: 'aggregate',
      code: '`number`.sum()',
    },
    {
      name: 'decade',
      type: 'number',
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
      e: [
        {
          type: 'function_call',
          overload: {
            returnType: {
              dataType: 'number',
              expressionType: 'scalar',
              evalSpace: 'input',
            },
            params: [
              {
                name: 'value',
                isVariadic: false,
                allowedTypes: [
                  {
                    dataType: 'number',
                    evalSpace: 'input',
                  },
                ],
              },
            ],
            dialect: {
              postgres: {
                e: [
                  {
                    type: 'sql_expression',
                    e: [
                      'FLOOR(',
                      {
                        type: 'function_parameter',
                        name: 'value',
                      },
                      ')',
                    ],
                  },
                ],
              },
              standardsql: {
                e: [
                  {
                    type: 'sql_expression',
                    e: [
                      'FLOOR(',
                      {
                        type: 'function_parameter',
                        name: 'value',
                      },
                      ')',
                    ],
                  },
                ],
              },
              duckdb: {
                e: [
                  {
                    type: 'sql_expression',
                    e: [
                      'FLOOR(',
                      {
                        type: 'function_parameter',
                        name: 'value',
                      },
                      ')',
                    ],
                  },
                ],
              },
            },
          },
          name: 'floor',
          args: [
            [
              {
                type: 'dialect',
                function: 'div',
                numerator: [
                  {
                    type: 'field',
                    path: ['year_born'],
                  },
                ],
                denominator: [
                  {
                    type: 'dialect',
                    function: 'numberLiteral',
                    literal: '10',
                  },
                ],
              },
            ],
          ],
          expressionType: 'scalar',
        },
        '*',
        {
          type: 'dialect',
          function: 'numberLiteral',
          literal: '10',
        },
      ],
      expressionType: 'scalar',
      code: 'floor(year_born/10)*10',
    },
    {
      name: 'births_per_100k',
      type: 'number',
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
      e: [
        {
          type: 'function_call',
          overload: {
            returnType: {
              dataType: 'number',
              expressionType: 'scalar',
              evalSpace: 'input',
            },
            params: [
              {
                name: 'value',
                isVariadic: false,
                allowedTypes: [
                  {
                    dataType: 'number',
                    evalSpace: 'input',
                  },
                ],
              },
            ],
            dialect: {
              postgres: {
                e: [
                  {
                    type: 'sql_expression',
                    e: [
                      'FLOOR(',
                      {
                        type: 'function_parameter',
                        name: 'value',
                      },
                      ')',
                    ],
                  },
                ],
              },
              standardsql: {
                e: [
                  {
                    type: 'sql_expression',
                    e: [
                      'FLOOR(',
                      {
                        type: 'function_parameter',
                        name: 'value',
                      },
                      ')',
                    ],
                  },
                ],
              },
              duckdb: {
                e: [
                  {
                    type: 'sql_expression',
                    e: [
                      'FLOOR(',
                      {
                        type: 'function_parameter',
                        name: 'value',
                      },
                      ')',
                    ],
                  },
                ],
              },
            },
          },
          name: 'floor',
          args: [
            [
              {
                type: 'dialect',
                function: 'div',
                numerator: [
                  {
                    type: 'field',
                    path: ['population'],
                  },
                ],
                denominator: [
                  {
                    type: 'all',
                    e: [
                      {
                        type: 'field',
                        path: ['population'],
                      },
                    ],
                  },
                ],
              },
              '*',
              {
                type: 'dialect',
                function: 'numberLiteral',
                literal: '100000',
              },
            ],
          ],
          expressionType: 'ungrouped_aggregate',
        },
      ],
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
      annotation: {},
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
      annotation: {},
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
      annotation: {},
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
      annotation: {},
      location: {
        url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
    url: 'file:///Users/speros/Documents/projects/malloy-composer/malloy-samples/names/names.malloy',
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
  as: 'names',
};

const modelPath = '/names/names.malloy';

const updateQueryInURL = () => {};
const mockDataStyles = {};
const runQueryExternal = () => {
  throw new Error('Unimplemented');
};
const runQueryAction = () => {};
const topValues = [];

const App = () => {
  const {
    queryMalloy,
    queryName,
    // clearQuery,
    // clearResult,
    // runQuery,
    isRunning,
    queryModifiers,
    querySummary,
    dataStyles,
    result,
    registerNewSource,
    // error,
    // setError,
    dirty,
    canUndo,
    undo,
    // redo,
    // resetUndoHistory,
    isQueryEmpty,
    canQueryRun,
  } = useQueryBuilder(
    model,
    modelPath,
    updateQueryInURL,
    mockDataStyles,
    runQueryExternal
  );

  useEffect(() => {
    registerNewSource(source);
  }, [source]);

  return (
    <div>
      <ExploreQueryEditor
        dirty={dirty}
        model={model}
        modelPath={modelPath}
        source={source}
        queryModifiers={queryModifiers}
        topValues={topValues}
        queryName={queryName}
        querySummary={querySummary}
        queryMalloy={queryMalloy}
        dataStyles={dataStyles}
        result={result}
        isRunning={isRunning}
        runQuery={runQueryAction}
        canUndo={canUndo}
        undo={undo}
        isQueryEmpty={isQueryEmpty}
        canQueryRun={canQueryRun}
        dummyCompile={_compileModel}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
