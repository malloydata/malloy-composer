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

import { getConfig } from "./config";
import { URL_READER } from "./urls";
import * as explore from "../types";
import * as path from "path";
import * as fs from "fs";

export async function getApps(): Promise<explore.ComposerConfig> {
  const { configPath, workingDirectory } = await getConfig();
  const fullConfigPath = path.join(workingDirectory, configPath);

  if (fs.existsSync(fullConfigPath)) {
    const response = await URL_READER.readURL(
      new URL("file://" + fullConfigPath)
    );
    const config = JSON.parse(response) as explore.ComposerConfig;
    if ("apps" in config) {
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
        id: "default",
        configPath,
      },
    ],
  };
}
