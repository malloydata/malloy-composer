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
      "window.MALLOY_CONFIG_URL": `"${
        process.env.MALLOY_CONFIG_URL || "composer.json"
      }"`,
    },
    entryPoints: {
      main: "./src/index.tsx",
    },
    entryNames: "app",
    bundle: true,
    minify: !development,
    sourcemap: development,
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
