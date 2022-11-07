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
/* eslint-disable no-console */

import fs from "fs";
import path from "path";
import { build, BuildOptions, serve } from "esbuild";
import svgrPlugin from "esbuild-plugin-svgr";
import { argv } from "process";

const outDir = path.join(__dirname, "..", "duckdb-wasm", "dist");
fs.mkdirSync(outDir, { recursive: true });

let port: number | undefined;

export async function doBuild(): Promise<void> {
  const development = process.env.NODE_ENV == "development";

  const options: BuildOptions = {
    define: {
      "process.env.NODE_DEBUG": "false",
      "window.IS_DUCKDB_WASM": "true",
    },
    entryPoints: {
      main: "./src/index.tsx",
    },
    entryNames: "app",
    bundle: true,
    minify: !development,
    sourcemap: false,
    outdir: "duckdb-wasm/dist/",
    platform: "browser",
    plugins: [svgrPlugin({ exportType: "named" })],
    loader: {
      [".ttf"]: "dataurl",
      [".svg"]: "dataurl",
      [".png"]: "dataurl",
    },
    inject: ["./react-shim.js"],
    watch:
      development && !port
        ? {
            onRebuild(error, result) {
              if (error) console.error("Extension server build failed:", error);
              else console.log("Extension server build succeeded:", result);
            },
          }
        : false,
  };

  if (port) {
    console.log(`Listening on port ${port}`);
    await serve({ port, servedir: "duckdb-wasm" }, options);
  } else {
    await build(options);
  }
}

if (argv.length > 2) {
  try {
    port = parseInt(argv[2]);
  } catch {
    console.error(`Invalid port ${port}`);
    process.exit(1);
  }
}

doBuild()
  .then(() => {
    console.log("Built successfully");
  })
  .catch((error) => {
    console.error("Built with errors");
    console.log(error);
    if (!port) {
      process.exit(1);
    }
  });
