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

import * as explore from "../types";
import { Runtime } from "@malloydata/malloy";
import { CONNECTION_MANAGER } from "./connections";
import { URL_READER } from "./urls";
import { promises as fs } from "fs";
import { HackyDataStylesAccumulator } from "../common/data_styles";
import * as path from "path";
import { getConfig } from "./config";
import { snakeToTitle } from "../app/utils";

export async function getDatasets(
  _app: explore.AppListing
): Promise<explore.AppInfo> {
  const { workingDirectory } = await getConfig();
  const configPath = path.join(workingDirectory, _app.configPath);
  const samplesURL = new URL("file://" + configPath);
  let app: explore.AppConfig;
  try {
    const response = await URL_READER.readURL(samplesURL);
    app = JSON.parse(response) as explore.AppConfig;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    app = {};
  }
  const title = app.title || "Malloy";
  const appRoot = path.dirname(path.join(workingDirectory, _app.configPath));
  const readme =
    app.readme &&
    (await URL_READER.readURL(
      new URL("file://" + path.join(appRoot, app.readme))
    ));
  let modelConfigs = app.models;
  if (modelConfigs === undefined) {
    const dirPath = path.dirname(configPath);
    const items = await fs.readdir(dirPath);
    modelConfigs = items
      .filter((item) => item.endsWith(".malloy"))
      .map((modelPath) => {
        return {
          id: modelPath,
          modelPath,
          tables: [],
        };
      });
  }
  const models: explore.ModelInfo[] = await Promise.all(
    modelConfigs.map(async (sample: explore.ModelConfig) => {
      const modelPath = path.join(appRoot, sample.modelPath);
      const modelURL = new URL("file://" + modelPath);
      const urlReader = new HackyDataStylesAccumulator(URL_READER);
      const connections = CONNECTION_MANAGER.getConnectionLookup(modelURL);
      const runtime = new Runtime(urlReader, connections);
      const model = await runtime.getModel(modelURL);
      const dataStyles = urlReader.getHackyAccumulatedDataStyles();
      const sources =
        sample.sources ||
        Object.values(model._modelDef.contents)
          .filter((obj) => obj.type === "struct")
          .map((obj) => ({
            title: snakeToTitle(obj.as || obj.name),
            sourceName: obj.as || obj.name,
            description: `Source ${obj.as} in ${sample.id}`,
          }));
      return {
        id: sample.id,
        model: model._modelDef,
        modelPath: sample.modelPath,
        readme,
        styles: dataStyles,
        sources,
      };
    })
  );
  return {
    readme,
    linkedReadmes: app.linkedReadmes,
    title,
    models,
  };
}
