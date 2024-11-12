/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {HighlighterCore, LanguageRegistration} from 'shiki';
// `shiki/core` entry does not include any themes or languages or the wasm binary.
import {getHighlighterCore} from 'shiki/core';
// `shiki/wasm` contains the wasm binary inlined as base64 string.
import getWasm from 'shiki/wasm';
import lightPlus from 'shiki/themes/light-plus.mjs';
import darkPlus from 'shiki/themes/dark-plus.mjs';
import sql from 'shiki/langs/sql.mjs';
import json from 'shiki/langs/json.mjs';
import md from 'shiki/langs/md.mjs';
import {MALLOY_GRAMMAR} from './malloyGrammar';

let HIGHLIGHTER: Promise<HighlighterCore>;
function getHighlighter() {
  if (HIGHLIGHTER !== undefined) {
    return HIGHLIGHTER;
  }
  HIGHLIGHTER = getHighlighterCore({
    themes: [lightPlus, darkPlus],
    langs: [
      sql,
      json,
      md,
      {
        name: 'malloy',
        embeddedLangs: ['sql'],
        ...MALLOY_GRAMMAR,
      } as unknown as LanguageRegistration,
    ],
    loadWasm: getWasm,
  });
  return HIGHLIGHTER;
}

async function highlight(code: string, lang: string): Promise<string> {
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
