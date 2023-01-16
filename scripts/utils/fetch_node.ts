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

import * as fs from "fs";
import * as zlib from "zlib";
import fetch from "node-fetch";
import tar from "tar-stream";

/* eslint-disable no-console */
export const fetchNode = async (
  filePath: string,
  url: string
): Promise<void> => {
  console.info(`Fetching: ${url}`);
  const extract = tar.extract();
  const response = await fetch(url);
  await new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      console.info(`Already exists: ${filePath}`);
      resolve(null);
    }

    try {
      extract.on("entry", async (header, stream, _next) => {
        const outFile = fs.openSync(filePath, "w", header.mode);
        for await (const chunk of stream) {
          fs.writeFileSync(outFile, chunk);
        }
        fs.closeSync(outFile);
        resolve(null);
      });
      extract.on("error", function (error) {
        console.error(error);
        reject(error);
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
    if (response.ok) {
      const stream = response.body;
      if (stream) {
        console.info(`Reading: ${url}`);
        stream.pipe(zlib.createGunzip()).pipe(extract);
      }
    } else {
      console.error(`Failed to fetch ${url}: ${response.statusText}`);
    }
  });
  console.log("done");
};
