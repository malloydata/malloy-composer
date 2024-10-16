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
  | 'dimension'
  | 'measure'
  | 'filter'
  | 'query'
  | 'source'
  | 'other'
  | 'error';

export const COLORS = {
  dimension: {
    fillLight: 'var(--malloy-theme--dimension-light, rgb(240,246,255))',
    fillMedium: 'var(--malloy-theme--dimension-medium, #c3d7f7)',
    fillStrong: 'var(--malloy-theme--dimension-strong, #4285f4)',
  },
  measure: {
    fillStrong: 'var(--malloy-theme--measure-strong, #ea8600)',
    fillMedium: 'var(--malloy-theme--measure-medium, #f3cfa1)',
    fillLight: 'var(--malloy-theme--measure-light, #fff3e8)',
  },
  filter: {
    fillStrong: 'var(--malloy-theme--filter-strong, #8166da)',
    fillMedium: 'var(--malloy-theme--filter-medium, #d4d6d8)',
    fillLight: 'var(--malloy-theme--filter-light, #f8f6ff)',
  },
  query: {
    fillStrong: 'var(--malloy-theme--query-strong, rgb(56,169,86))',
    fillMedium: 'var(--malloy-theme--query-medium, #bce0c5)',
    fillLight: 'var(--malloy-theme--query-light, #f3fbf5)',
  },
  source: {
    fillStrong: 'var(--malloy-theme--source-strong, rgb(56,169,86))',
    fillMedium: 'var(--malloy-theme--source-medium, #bce0c5)',
    fillLight: 'var(--malloy-theme--source-light, #f3fbf5)',
  },
  other: {
    fillStrong: 'var(--malloy-theme--other-strong, #9aa0a6)',
    fillMedium: 'var(--malloy-theme--other-medium, #d4d6d8)',
    fillLight: 'var(--malloy-theme--other-light, #f7f8f8)',
  },
  error: {
    fillStrong: 'var(--malloy-theme--error-strong, #9aa0a6)',
    fillMedium: 'var(--malloy-theme--error-medium, #d4d6d8)',
    fillLight: 'var(--malloy-theme--error-light, #f7f8f8)',
  },
};
