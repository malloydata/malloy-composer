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
  FieldDef,
  StructDef,
  TurtleDef,
  expressionIsCalculation,
  isJoined,
  isLeafAtomic,
} from '@malloydata/malloy';
import {QuerySummaryItem} from './types';

export function snakeToTitle(snake: string): string {
  return snake
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export type FieldType =
  | 'string'
  | 'boolean'
  | 'json'
  | 'number'
  | 'date'
  | 'timestamp'
  | 'query'
  | 'source'
  | 'sql native';

export type FieldKind = 'measure' | 'dimension' | 'query' | 'source';

export function typeOfField(fieldDef: FieldDef): FieldType {
  return fieldDef.type === 'error'
    ? 'number' // HACK
    : fieldDef.type === 'turtle'
    ? 'query'
    : isJoined(fieldDef)
    ? 'source'
    : fieldDef.type;
}

export function scalarTypeOfField(
  fieldDef: FieldDef
):
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'timestamp'
  | 'json'
  | 'sql native' {
  return isJoined(fieldDef)
    ? 'string'
    : fieldDef.type === 'turtle'
    ? 'string'
    : fieldDef.type === 'error'
    ? 'number' // HACK
    : fieldDef.type;
}

export function kindOfField(fieldDef: FieldDef): FieldKind {
  return isJoined(fieldDef)
    ? 'source'
    : fieldDef.type === 'turtle'
    ? 'query'
    : expressionIsCalculation(fieldDef.expressionType)
    ? 'measure'
    : 'dimension';
}

export function notUndefined<T>(item: T | undefined): item is T {
  return item !== undefined;
}

export function fieldToSummaryItem(
  field: FieldDef,
  path: string
): QuerySummaryItem {
  const kind = kindOfField(field);
  if (isJoined(field) || kind === 'source') {
    throw new Error('Cannot make a summary item from a struct.');
  } else {
    return {
      type: 'field',
      field,
      path,
      saveDefinition: undefined,
      isRefined: false,
      name: field.as || field.name,
      isRenamed: false,
      fieldIndex: -1,
      kind,
    } as QuerySummaryItem;
  }
}

export function isAggregate(field: FieldDef): boolean {
  return isLeafAtomic(field) && expressionIsCalculation(field.expressionType);
}

export function isDimension(field: FieldDef): boolean {
  return (
    isLeafAtomic(field) &&
    (!field.expressionType || field.expressionType === 'scalar')
  );
}

export function isQuery(field: FieldDef): field is TurtleDef {
  return field.type === 'turtle';
}

export function isNotIndexQuery(item: TurtleDef): boolean {
  return item.pipeline[0]?.type !== 'index';
}

export function flatFields(
  source: StructDef,
  path: string[] = []
): {field: FieldDef; path: string}[] {
  return source.fields.flatMap(field => {
    if (isJoined(field)) {
      return flatFields(field, [...path, field.as || field.name]);
    } else {
      return [{field, path: [...path, field.as || field.name].join('.')}];
    }
  });
}

export function pathSuffixes(path: string): string[] {
  const parts = path.split('.');
  return parts.map((_, index) => parts.slice(index).join('.'));
}

export function termsForField(field: FieldDef, path: string): string[] {
  return [
    ...pathSuffixes(path).reverse(),
    field.name,
    kindOfField(field),
    typeOfField(field),
  ];
}

export function pathParent(path: string): string {
  const parts = path.split('.');
  return parts[parts.length - 2];
}

export function largeNumberLabel(n: number): string {
  if (n < 1_000) {
    return n.toLocaleString();
  } else if (n < 10_000) {
    return (n / 1000).toFixed(1) + 'K';
  } else if (n < 1_000_000) {
    return Math.floor(n / 1000).toLocaleString() + 'K';
  } else if (n < 10_000_000) {
    return (n / 1_000_000).toFixed(1) + 'M';
  } else {
    return Math.floor(n / 1000).toLocaleString() + 'M';
  }
}

export function downloadFile(
  content: string,
  mimeType: string,
  filename: string,
  newTab: boolean
): void {
  const downloadLink = document.createElement('a');
  const blob = new Blob([content], {type: mimeType});
  const url = URL.createObjectURL(blob);
  downloadLink.setAttribute('href', url);
  if (newTab) {
    downloadLink.setAttribute('target', '_blank');
  } else {
    downloadLink.setAttribute('download', filename);
  }
  downloadLink.click();
}

export function wrapHtml(html: string, title: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta
  </head>
  <body>${html}</body>
</html>
  `;
}

// Regular expression for matching errors thrown by test compilations,
// like those done by the New Measure and New Dimension dialogs.
const ERROR_RE =
  /Error\(s\) compiling model:\nFILE: internal:\/\/internal.malloy\nline 1: (.*)\n/;

/**
 * Extracts a string error message from an Error object, and
 * specifically handles the case where
 *
 * @param error Caught error object
 * @returns Cleaned up error message
 */
export function extractErrorMessage(error: unknown): string {
  let message = `${error}`;
  if (error instanceof Error) {
    message = error.message;
    const matches = message.match(ERROR_RE);
    if (matches) {
      message = matches[1];
    }
  }
  return message;
}

export function indentCode(code: string, spaces = 2): string {
  return code
    .split('\n')
    .map(line => ' '.repeat(spaces) + line)
    .join('\n');
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}
