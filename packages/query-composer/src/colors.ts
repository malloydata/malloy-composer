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

export type ColorKey =
  | "dimension"
  | "measure"
  | "filter"
  | "query"
  | "source"
  | "other"
  | "error";

export const COLORS = {
  dimension: {
    fillLight: "rgb(240,246,255)",
    fillMedium: "#c3d7f7",
    fillStrong: "#4285f4",
  },
  measure: {
    fillStrong: "#ea8600",
    fillMedium: "#f3cfa1",
    fillLight: "#fff3e8",
  },
  filter: {
    fillStrong: "#8166da",
    fillMedium: "#d4d6d8",
    fillLight: "#f8f6ff",
  },
  query: {
    fillStrong: "rgb(56,169,86)",
    fillMedium: "#bce0c5",
    fillLight: "#f3fbf5",
  },
  source: {
    fillStrong: "rgb(56,169,86)",
    fillMedium: "#bce0c5",
    fillLight: "#f3fbf5",
  },
  other: {
    fillStrong: "#9aa0a6",
    fillMedium: "#d4d6d8",
    fillLight: "#f7f8f8",
  },
  error: {
    fillStrong: "#9aa0a6",
    fillMedium: "#d4d6d8",
    fillLight: "#f7f8f8",
  },
  mainBackground: "rgb(247, 249, 252)",
};
