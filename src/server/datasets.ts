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

import * as explore from "../types";
import { Runtime } from "@malloydata/malloy";
import { CONNECTION_MANAGER } from "./connections";
import { URL_READER } from "./urls";
import { HackyDataStylesAccumulator } from "../common/data_styles";
import * as path from "path";
import { getConfig } from "./config";

export async function getDatasets() {
  const { modelsPath } = await getConfig();
  const samplesURL = new URL("file://" + path.join(modelsPath, "composer.json"));
  const response = await URL_READER.readURL(samplesURL);
  const samples = JSON.parse(response) as { datasets: explore.DatasetConfig[] };
  return await Promise.all(
    samples.datasets.map(async (sample: explore.DatasetConfig) => {
      const modelURL = new URL("file://" + path.join(modelsPath, sample.model));
      const connections = CONNECTION_MANAGER.getConnectionLookup(modelURL);
      const readme =
        sample.readme &&
        (await URL_READER.readURL(new URL("file://" + path.join(modelsPath, sample.readme))));
      const urlReader = new HackyDataStylesAccumulator(URL_READER);
      const runtime = new Runtime(urlReader, connections);
      const model = await runtime.getModel(modelURL);
      const dataStyles = urlReader.getHackyAccumulatedDataStyles();
      return {
        id: modelURL.toString(),
        name: sample.name,
        description: sample.description,
        model: model._modelDef,
        modelPath: sample.model,
        readme,
        styles: dataStyles,
      };
    })
  );
}