/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Expr, Parameter} from '@malloydata/malloy';

/**
 * Converts an expression into a UI friendly string.
 *
 * @param e Expression to stringify
 * @param nullValue string to represent the value 'null'
 * @returns a string representation of the expression
 */
export const stringFromExpr = (e: Expr | null, nullValue = 'null'): string => {
  if (e === null) {
    return nullValue;
  }
  switch (e.node) {
    case 'timeLiteral':
      return `@${e.literal}`;
    case 'true':
    case 'false':
    case 'null':
      return e.node;
    case 'stringLiteral':
    case 'numberLiteral':
      return e.literal;
    case 'cast':
      return stringFromExpr(e.e);
  }
  return JSON.stringify(e);
};

/**
 * Converts and expression into a Malloy code friendly string.
 *
 * @param e
 * @returns
 */
export function codeFromExpr(e: Expr | null): string {
  if (e === null) {
    return 'null';
  }
  switch (e.node) {
    case 'stringLiteral':
      return `'${e.literal.replace(/\\/g, '\\\\').replace(/'/, "\\'")}'`;
    case 'numberLiteral':
      return e.literal;
    case 'timeLiteral':
      return `@${e.literal}`;
    case 'true':
    case 'false':
    case 'null':
      return e.node;
    case 'cast':
      return codeFromExpr(e.e);
  }
  return `"?${e.node}?"`;
}

/**
 * Converts a string and type into an expression.
 *
 * @param value Raw value
 * @param type expression type. Not all types currently supported
 * @returns An expression object
 */
export function stringToExpr(value: string, type: string): Expr {
  switch (type) {
    case 'string':
      return {
        node: 'stringLiteral',
        literal: value,
      };
    case 'number':
      return {
        node: 'numberLiteral',
        literal: value,
      };
    case 'timestamp':
      value = value.replace(/^@/, '');
      return {
        node: 'timeLiteral',
        typeDef: {type: 'timestamp'},
        literal: value,
      };
    case 'date':
      value = value.replace(/^@/, '');
      return {
        node: 'timeLiteral',
        typeDef: {type: 'date'},
        literal: value,
      };
    case 'boolean':
      return {
        node: value as 'true' | 'false',
      };
  }

  console.warn('Unhandled expr type:', type);
  return {
    node: 'error',
  };
}

/**
 * Converts a string and type into a parameter. Used to keep
 * the parameter type and expression type in sync.
 *
 * @param name Parameter name
 * @param value Raw value
 * @param type expression type. Not all types currently supported
 * @returns An expression object
 */
export function stringToParameter(
  name: string,
  value: string,
  type: string
): Parameter {
  switch (type) {
    case 'string':
      return {
        name,
        type,
        value: {
          node: 'stringLiteral',
          literal: value,
        },
      };
    case 'number':
      return {
        name,
        type,
        value: {
          node: 'numberLiteral',
          literal: value,
        },
      };
    case 'timestamp':
      value = value.replace(/^@/, '');
      return {
        name,
        type,
        value: {
          node: 'timeLiteral',
          typeDef: {type: 'timestamp'},
          literal: value,
        },
      };
    case 'date':
      value = value.replace(/^@/, '');
      return {
        name,
        type,
        value: {
          node: 'timeLiteral',
          typeDef: {type: 'date'},
          literal: value,
        },
      };
    case 'boolean':
      return {
        name,
        type,
        value: {
          node: value as 'true' | 'false',
        },
      };
  }

  console.warn('Unhandled parameter type:', type);
  return {
    name,
    type: 'error',
    value: {
      node: 'error',
    },
  };
}
