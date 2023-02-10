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

import { RESERVED_WORDS } from "./reserved_words";

export const unquoteIdentifier = (identifier: string): string =>
  identifier
    .split(".")
    .map((part) => part.replace(/(^`|`$)/g, ""))
    .join(".");

function shouldQuoteIdentifier(name: string) {
  const containsFunnyCharacters = !name.match(/^[A-Za-z_][A-Za-z_0-9]*$/);
  const isReserved = RESERVED_WORDS.includes(name.toLowerCase());
  return containsFunnyCharacters || isReserved;
}

export function maybeQuoteIdentifier(name: string): string {
  const path = name.split(".");
  for (let i = 0; i < path.length; i++) {
    if (shouldQuoteIdentifier(path[i])) {
      path[i] = `\`${path[i]}\``;
    }
  }
  return path.join(".");
}
