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

import { StructDef } from "@malloydata/malloy";
import * as express from "express";
import { AppListing } from "../types";
import { getApps } from "./apps";
import { getDatasets } from "./datasets";
import { wrapErrors } from "./errors";
import { runQuery } from "./run_query";
import { searchIndex } from "./search";
import { topValues } from "./top_values";

export function routes(router: express.Router): void {
  router.post(
    "/datasets",
    async (req: express.Request, res: express.Response) => {
      const app = req.body.app as AppListing;
      res.json(
        await wrapErrors(async () => ({ datasets: await getDatasets(app) }))
      );
    }
  );

  router.get("/apps", async (req: express.Request, res: express.Response) => {
    res.json(await wrapErrors(async () => await getApps()));
  });

  router.post(
    "/run_query",
    async (req: express.Request, res: express.Response) => {
      const query = req.body.query as string;
      const queryName = req.body.queryName as string;
      const modelPath = req.body.modelPath as string;
      res.json(
        await wrapErrors(async () => {
          const result = await runQuery(query, queryName, modelPath);
          return { result: result.toJSON() };
        })
      );
    }
  );

  router.post(
    "/search",
    async (req: express.Request, res: express.Response) => {
      const source = req.body.source as unknown as StructDef;
      const searchTerm = req.body.searchTerm;
      const fieldPath = req.body.fieldPath;
      const modelPath = req.body.modelPath;
      res.json(
        await wrapErrors(async () => {
          const result = await searchIndex(
            source,
            modelPath,
            searchTerm,
            fieldPath
          );
          return { result: result };
        })
      );
    }
  );

  router.post(
    "/top_values",
    async (req: express.Request, res: express.Response) => {
      const source = req.body.source as unknown as StructDef;
      const modelPath = req.body.modelPath as string;
      res.json(
        await wrapErrors(async () => {
          const result = await topValues(source, modelPath);
          return { result: result };
        })
      );
    }
  );
}
