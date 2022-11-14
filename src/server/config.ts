/*
 * Copyright 2021 Google LLC
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

import * as path from "path";
import { promises as fs } from "fs";

interface ComposerConfig {
  workingDirectory: string;
  configPath: string;
}

export async function getConfig(): Promise<ComposerConfig> {
  const configPath = path.resolve(process.cwd(), process.env.DATASETS || "");
  const stat = await fs.lstat(configPath);
  if (stat.isFile()) {
    return {
      workingDirectory: path.dirname(configPath),
      configPath: path.basename(configPath),
    };
  } else {
    return {
      workingDirectory: configPath,
      configPath: "composer.json",
    };
  }
}
