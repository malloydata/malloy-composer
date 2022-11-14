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
  console.log({ workingDirectory, appRoot: _app.root });
  const root = path.join(workingDirectory, _app.root);
  let app: explore.AppConfig = {};
  if (root.endsWith(".malloy")) {
    app = {
      models: [
        {
          id: root,
          modelPath: root,
          tables: [],
        },
      ],
    };
  } else if (root.endsWith(".json")) {
    const response = await URL_READER.readURL(new URL("file://" + root));
    app = JSON.parse(response) as explore.AppConfig;
  }
  const title = app.title;
  const appPath = path.dirname(path.join(workingDirectory, _app.root));
  const readme =
    app.readme &&
    (await URL_READER.readURL(
      new URL("file://" + path.join(appPath, app.readme))
    ));
  let modelConfigs = app.models;
  if (_app.root.endsWith(".malloy")) {
    modelConfigs = [
      {
        id: _app.root,
        modelPath: _app.root,
        tables: [],
      },
    ];
  } else {
    const dirPath = path.dirname(root);
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
      const modelPath = path.join(appPath, sample.modelPath);
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
