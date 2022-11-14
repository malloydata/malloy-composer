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
  // The root of all paths used by the server
  workingDirectory: string;
  // The "root" of the Composer instance. Can be a (datasets) .json,
  // a (models) .json, a .malloy, or a directory
  root: string;
}

export async function getConfig(): Promise<ComposerConfig> {
  const root = path.resolve(process.cwd(), process.env.ROOT || "");
  const stat = await fs.lstat(root);
  if (stat.isFile()) {
    return {
      workingDirectory: path.dirname(root),
      root: path.basename(root),
    };
  } else {
    return {
      workingDirectory: root,
      root: ".",
    };
  }
}
