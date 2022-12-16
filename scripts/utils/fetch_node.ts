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
      return;
    }

    try {
      extract.on("entry", async (header, stream, _next) => {
        const outFile = fs.openSync(filePath, "w", header.mode);
        stream.on("end", () => {
          fs.closeSync(outFile);
          resolve(null);
        });

        for await (const chunk of stream) {
          fs.writeFileSync(outFile, chunk);
        }
      });

      extract.on("finish", function () {
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
