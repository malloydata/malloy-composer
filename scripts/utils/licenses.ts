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

/* eslint-disable no-console */
import fs from "fs";

export interface NpmPackage {
  dependencies?: Record<string, string>;
  homepage?: string;
  license?: string;
  repo?: string;
  repository?: {
    baseUrl?: string;
    url?: string;
  };
}

export function readPackageJson(path: string): NpmPackage {
  try {
    const fileBuffer = fs.readFileSync(path, "utf8");
    return JSON.parse(fileBuffer);
  } catch (error) {
    console.warn("Could not read package.json", error.message);
  }
  return {};
}

export function getDependencies(rootPackageJson: string): string[] {
  const rootPackage = readPackageJson(rootPackageJson);
  return Object.keys(rootPackage.dependencies || {}) || [];
}
