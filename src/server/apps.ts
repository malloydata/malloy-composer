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

export async function getApps(): Promise<explore.ComposerConfig> {
  const { modelsPath } = await getConfig();
  const samplesURL = new URL(
    "file://" + path.join(modelsPath, "composer.json")
  );
  const response = await URL_READER.readURL(samplesURL);
  const config = JSON.parse(response) as explore.ComposerConfig;
  const readme =
    config.readme &&
    (await URL_READER.readURL(
      new URL("file://" + path.join(modelsPath, config.readme))
    ));
  return {
    ...config,
    readme,
  };
}
