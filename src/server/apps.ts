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

import { getConfig } from "./config";
import { URL_READER } from "./urls";
import * as explore from "../types";
import * as path from "path";
import * as fs from "fs";

export async function getApps(): Promise<explore.ComposerConfig> {
  const config = await getConfig();
  let root = config.root;
  const workingDirectory = config.workingDirectory;
  let rootPath = path.join(workingDirectory, root);

  const doesRootExist = fs.existsSync(rootPath);

  if (!doesRootExist) {
    throw new Error(`Root ${rootPath} does not exist.`);
  }

  const isRootDirectory = fs.lstatSync(rootPath).isDirectory();

  if (isRootDirectory) {
    const configFileName = "composer.json";
    const configPath = path.join(rootPath, configFileName);
    if (fs.existsSync(configPath)) {
      rootPath = path.join(rootPath, configFileName);
      root = path.join(root, configFileName);
    }
  }

  const rootIsConfigFile = rootPath.endsWith(".json");

  if (rootIsConfigFile) {
    const response = await URL_READER.readURL(new URL("file://" + rootPath));
    const config = JSON.parse(response) as explore.ComposerConfig;
    const rootIsDatasetsConfigFile = "apps" in config;
    if (rootIsDatasetsConfigFile) {
      const readme =
        config.readme &&
        (await URL_READER.readURL(
          new URL("file://" + path.join(workingDirectory, config.readme))
        ));
      return {
        ...config,
        readme,
      };
    }
  }

  return {
    apps: [
      {
        path: root,
        id: undefined,
      },
    ],
  };
}
