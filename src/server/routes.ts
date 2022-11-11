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
