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

import * as shiki from 'shiki';
import {MALLOY_GRAMMAR} from './malloyGrammar';

declare global {
  interface Window {
    IS_DUCKDB_WASM: boolean;
  }
}

export function snakeToTitle(snake: string): string {
  return snake
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function isDuckDBWASM(): boolean {
  return !!window.IS_DUCKDB_WASM;
}

let HIGHLIGHTER: Promise<shiki.Highlighter>;
function getHighlighter() {
  if (HIGHLIGHTER !== undefined) {
    return HIGHLIGHTER;
  }
  HIGHLIGHTER = shiki.getHighlighter({
    themes: ['light-plus', 'dark-plus'],
    langs: [
      'sql',
      'json',
      'md',
      {
        id: 'malloy',
        scopeName: 'source.malloy',
        embeddedLangs: ['sql'],
        grammar: MALLOY_GRAMMAR,
      } as unknown as shiki.LanguageRegistration,
    ],
  });
  return HIGHLIGHTER;
}

export async function highlight(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();
  if (!highlighter.getLoadedLanguages().includes(lang)) {
    lang = 'txt';
  }
  return highlighter.codeToHtml(code, {
    lang,
    themes: {
      light: 'light-plus',
      dark: 'dark-plus',
    },
  });
}

export async function highlightPre(
  code: string,
  lang: string
): Promise<HTMLDivElement> {
  const highlighted = await highlight(code, lang);
  const elem = document.createElement('div');
  elem.innerHTML = highlighted;
  return elem;
}
