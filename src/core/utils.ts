/*
 * Copyright 2022 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
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
