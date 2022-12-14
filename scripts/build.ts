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

import { build, BuildOptions, Plugin } from "esbuild";
import svgrPlugin from "esbuild-plugin-svgr";
import * as path from "path";
import fs from "fs";
import { copyDirSync } from "./utils";

import duckdbPackage from "@malloydata/db-duckdb/package.json";
import { fetchDuckDB } from "./utils/fetch_duckdb";
const DUCKDB_VERSION = duckdbPackage.dependencies.duckdb;

export const targetDuckDBMap: Record<string, string> = {
  "darwin-arm64": `duckdb-v${DUCKDB_VERSION}-node-v93-darwin-arm64.node`,
  "darwin-x64": `duckdb-v${DUCKDB_VERSION}-node-v93-darwin-x64.node`,
  "linux-x64": `duckdb-v${DUCKDB_VERSION}-node-v93-linux-x64.node`,
  "win32-x64": `duckdb-v${DUCKDB_VERSION}-node-v93-win32-x64.node`,
};

export const buildDirectory = "build/";
export const appDirectory = "app/";
export const serverBuildDirectory = "dist/";

export const commonAppConfig = (development = false): BuildOptions => {
  return {
    entryPoints: ["./src/index.tsx"],
    outfile: path.join(buildDirectory, appDirectory, "app.js"),
    minify: !development,
    sourcemap: development,
    bundle: true,
    platform: "browser",
    loader: {
      ".js": "jsx",
      ".png": "file",
      ".ttf": "dataurl",
    },
    plugins: [svgrPlugin({ exportType: "named" })],
    define: {
      "process.env.NODE_DEBUG": "false", // TODO this is a hack because some package we include assumed process.env exists :(
    },
    inject: ["./react-shim.js"], // This shim elimanites needing to have "require React from 'react'" in every file
  };
};

export const commonServerConfig = (
  development = false,
  target?: string
): BuildOptions => {
  return {
    entryPoints: ["./src/server/cli.ts", "./src/server/server.js"],
    outdir: serverBuildDirectory,
    minify: !development,
    sourcemap: development ? "inline" : false,
    bundle: true,
    platform: "node",
    external: ["./duckdb-native.node", "vscode-oniguruma"],
    plugins: [makeDuckdbNoNodePreGypPlugin(target), ignorePgNativePlugin],
  };
};

const errorHandler = (e: unknown) => {
  console.log(e);
  process.exit(1);
};

function makeDuckdbNoNodePreGypPlugin(target: string | undefined): Plugin {
  const localPath = require.resolve("duckdb/lib/binding/duckdb.node");
  return {
    name: "duckdbNoNodePreGypPlugin",
    setup(build) {
      build.onResolve({ filter: /duckdb-binding\.js/ }, (args) => {
        return {
          path: args.path,
          namespace: "duckdb-no-node-pre-gyp-plugin",
        };
      });
      build.onLoad(
        {
          filter: /duckdb-binding\.js/,
          namespace: "duckdb-no-node-pre-gyp-plugin",
        },
        (_args) => {
          return {
            contents: `
              var path = require("path");
              var os = require("os");

              var binding_path = ${
                target
                  ? `require.resolve("./duckdb-native.node")`
                  : `"${localPath}"`
              };

              // dlopen is used because we need to specify the RTLD_GLOBAL flag to be able to resolve duckdb symbols
              // on linux where RTLD_LOCAL is the default.
              process.dlopen(module, binding_path, os.constants.dlopen.RTLD_NOW | os.constants.dlopen.RTLD_GLOBAL);
            `,
            resolveDir: ".",
          };
        }
      );
    },
  };
}

const ignorePgNativePlugin: Plugin = {
  name: "ignorePgNativePlugin",
  setup(build) {
    build.onResolve({ filter: /pg-native/ }, (args) => {
      return {
        path: args.path,
        namespace: "ignore-pg-native-plugin",
      };
    });
    build.onLoad(
      {
        filter: /pg-native/,
        namespace: "ignore-pg-native-plugin",
      },
      (_args) => {
        return {
          contents: ``,
          resolveDir: ".",
        };
      }
    );
  },
};

export async function doBuild(target?: string): Promise<void> {
  //const development = process.env.NODE_ENV == "development";
  const development = target == undefined;

  fs.rmSync(buildDirectory, { recursive: true, force: true });
  fs.mkdirSync(buildDirectory, { recursive: true });

  fs.rmSync(serverBuildDirectory, { recursive: true, force: true });
  fs.mkdirSync(serverBuildDirectory, { recursive: true });

  copyDirSync("public", path.join(buildDirectory, appDirectory));

  await build(commonAppConfig(development)).catch(errorHandler);
  await build(commonServerConfig(development, target)).catch(errorHandler);

  if (target) {
    const duckDBBinaryName = targetDuckDBMap[target];
    if (duckDBBinaryName === undefined) {
      throw new Error(`No DuckDB binary for ${target} is available`);
    }
    const fileName = await fetchDuckDB(target);
    fs.copyFileSync(fileName, path.join(buildDirectory, "duckdb-native.node"));
  }
}

const args = process.argv.slice(1);
if (args[0].endsWith("build")) {
  const target = args[1];
  doBuild(target);
}
