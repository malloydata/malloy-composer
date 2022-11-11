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
import { HackyDataStylesAccumulator } from "../common/data_styles";
import * as path from "path";
import { getConfig } from "./config";
import { snakeToTitle } from "../app/utils";

export async function getDatasets(
  _app: explore.AppListing
): Promise<explore.AppInfo> {
  const { modelsPath } = await getConfig();
  const samplesURL = new URL(
    "file://" + path.join(modelsPath, _app.configPath)
  );
  const response = await URL_READER.readURL(samplesURL);
  const app = JSON.parse(response) as explore.AppConfig;
  const title = app.title;
  const appRoot = path.dirname(path.join(modelsPath, _app.configPath));
  const readme =
    app.readme &&
    (await URL_READER.readURL(
      new URL("file://" + path.join(appRoot, app.readme))
    ));
  const models: explore.ModelInfo[] = await Promise.all(
    app.models.map(async (sample: explore.ModelConfig) => {
      const modelURL = new URL(
        "file://" + path.join(appRoot, sample.modelPath)
      );
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
