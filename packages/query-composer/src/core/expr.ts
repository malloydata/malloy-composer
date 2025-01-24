/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {AtomicTypeDef, Expr, Parameter} from '@malloydata/malloy';

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
      return stringFromExpr(e.e, nullValue);
  }
  return JSON.stringify(e);
};

export type ESymbols = Record<string, string> | undefined;

/**
 * Converts an expression into a Malloy code friendly string.
 *
 * @param e Expression
 * @returns Malloy code
 */
export function codeFromExpr(
  e: Expr | null | undefined,
  symbols: ESymbols = undefined
): string {
  if (e == null) {
    return '';
  }
  function subExpr(e: Expr): string {
    return codeFromExpr(e, symbols);
  }
  switch (e.node) {
    case 'aggregate': {
      const ref = subExpr(e.e);
      return `${ref}.${e.function}()`;
    }
    case 'field': {
      const ref = e.path.join('.');
      if (symbols) {
        if (symbols[ref] === undefined) {
          const nSyms = Object.keys(symbols).length;
          symbols[ref] = String.fromCharCode('A'.charCodeAt(0) + nSyms);
        }
        return symbols[ref];
      } else {
        return ref;
      }
    }
    case '()':
      return `(${subExpr(e.e)})`;
    case 'numberLiteral':
      return `${e.literal}`;
    case 'stringLiteral':
      return `"${e.literal.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
    case 'timeLiteral':
      return `@${e.literal}`;
    case 'recordLiteral': {
      const parts: string[] = [];
      for (const [name, val] of Object.entries(e.kids)) {
        parts.push(`${name}:${subExpr(val)}`);
      }
      return `{${parts.join(', ')}}`;
    }
    case 'arrayLiteral': {
      const parts = e.kids.values.map(k => subExpr(k));
      return `[${parts.join(', ')}]`;
    }
    case 'regexpLiteral':
      return `/${e.literal}/`;
    case 'trunc':
      return `{timeTrunc-${e.units} ${subExpr(e.e)}}`;
    case 'delta':
      return `{${e.op}${e.units} ${subExpr(e.kids.base)} ${subExpr(
        e.kids.delta
      )}}`;
    case 'true':
    case 'false':
    case 'null':
      return e.node;
    case 'case': {
      const caseStmt = ['case'];
      if (e.kids.caseValue !== undefined) {
        caseStmt.push(`${subExpr(e.kids.caseValue)}`);
      }
      for (let i = 0; i < e.kids.caseWhen.length; i += 1) {
        caseStmt.push(
          `when ${subExpr(e.kids.caseWhen[i])} then ${subExpr(
            e.kids.caseThen[i]
          )}`
        );
      }
      if (e.kids.caseElse !== undefined) {
        caseStmt.push(`else ${subExpr(e.kids.caseElse)}`);
      }
      return `{${caseStmt.join(' ')}}`;
    }
    case 'regexpMatch':
      return `{${subExpr(e.kids.expr)} regex-match ${subExpr(e.kids.regex)}}`;
    case 'in': {
      return `{${subExpr(e.kids.e)} ${e.not ? 'not in' : 'in'} {${e.kids.oneOf
        .map(o => `${subExpr(o)}`)
        .join(',')}}}`;
    }
    case 'genericSQLExpr': {
      let sql = '';
      let i = 0;
      for (; i < e.kids.args.length; i++) {
        sql += `${e.src[i]}{${subExpr(e.kids.args[i])}}`;
      }
      if (i < e.src.length) {
        sql += e.src[i];
      }
      return sql;
    }
  }
  if (exprHasKids(e) && e.kids['left'] && e.kids['right']) {
    return `{${subExpr(e.kids['left'])} ${e.node} ${subExpr(e.kids['right'])}}`;
  } else if (exprHasE(e)) {
    return `{${e.node} ${subExpr(e.e)}}`;
  } else if (exprIsLeaf(e)) {
    return `{${e.node}}`;
  }
  return `{?${e.node}}`;
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

/**
 * TODO(whscullin) Export from Malloy?
 */

interface ExprLeaf {
  node: string;
  typeDef?: AtomicTypeDef;
  sql?: string;
}

interface ExprE extends ExprLeaf {
  e: Expr;
}
interface ExprOptionalE extends ExprLeaf {
  e?: Expr;
}

interface ExprWithKids extends ExprLeaf {
  kids: Record<'left' | 'right', Expr | Expr[]>;
}

type AnyExpr = ExprE | ExprOptionalE | ExprWithKids | ExprLeaf;

function exprHasKids(e: AnyExpr): e is ExprWithKids {
  return 'kids' in e;
}

function exprHasE(e: AnyExpr): e is ExprE {
  return 'e' in e;
}

export function exprIsLeaf(e: AnyExpr) {
  return !(exprHasKids(e) || exprHasE(e));
}
