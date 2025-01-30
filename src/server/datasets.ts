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

import * as explore from '../types';
import {Runtime, isSourceDef} from '@malloydata/malloy';
import {CONNECTION_MANAGER} from './connections';
import {URL_READER as urlReader} from './urls';
import {promises as fs} from 'fs';
import * as path from 'path';
import {getConfig} from './config';
import {snakeToTitle} from '../app/utils';

export async function getDatasets(
  _app: explore.AppListing
): Promise<explore.AppInfo> {
  const unpackResponse = (response: string | {contents: string}): string =>
    typeof response === 'string' ? response : response.contents;

  const {workingDirectory} = await getConfig();
  const root = path.join(workingDirectory, _app.path);
  const rootDirectory = (await fs.lstat(root)).isDirectory()
    ? root
    : path.dirname(root);
  let app: explore.AppConfig = {};
  if (root.endsWith('.json')) {
    const response = await urlReader.readURL(new URL('file://' + root));
    app = JSON.parse(unpackResponse(response)) as explore.AppConfig;
  }
  const title = app.title;
  const readme =
    app.readme &&
    (await urlReader.readURL(
      new URL('file://' + path.resolve(rootDirectory, app.readme))
    ));
  let modelConfigs = app.models;
  if (_app.path.endsWith('.malloy')) {
    modelConfigs = [
      {
        id: path.basename(root),
        path: path.basename(root),
        tables: [],
      },
    ];
  } else if (modelConfigs === undefined) {
    const items = await fs.readdir(root);
    modelConfigs = items
      .filter(item => item.endsWith('.malloy'))
      .map(modelPath => {
        return {
          id: modelPath,
          path: modelPath,
          tables: [],
        };
      });
  }
  const models: explore.ModelInfo[] = await Promise.all(
    modelConfigs.map(async (sample: explore.ModelConfig) => {
      const modelPath = path.resolve(rootDirectory, sample.path);
      const modelURL = new URL('file://' + modelPath);
      const connections = CONNECTION_MANAGER.getConnectionLookup(modelURL);
      const runtime = new Runtime({urlReader, connections});
      const model = await runtime.getModel(modelURL);
      const sources =
        sample.sources ||
        Object.values(model._modelDef.contents)
          .filter(obj => isSourceDef(obj))
          .map(obj => ({
            title: snakeToTitle(obj.as || obj.name),
            sourceName: obj.as || obj.name,
            description: `Source ${obj.as} in ${sample.id}`,
          }));
      return {
        id: sample.id,
        model: model._modelDef,
        path: sample.path,
        readme,
        sources,
      };
    })
  );
  return {
    readme: unpackResponse(readme || ''),
    linkedReadmes: app.linkedReadmes || [],
    title,
    models,
  };
}
