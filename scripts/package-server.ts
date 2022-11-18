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
import { doBuild } from "./build";
import * as pkg from "pkg";
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";

import duckdbPackage from "@malloydata/db-duckdb/package.json";
const DUCKDB_VERSION = duckdbPackage.dependencies.duckdb;
const duckdbPath = "../malloy-third-party/third_party/github.com/duckdb/duckdb";

const duckDbTargetMap = new Map<string, string>([
  ["darwin-arm64", `duckdb-v${DUCKDB_VERSION}-node-v93-darwin-arm64.node`],
  ["darwin-x64", `duckdb-v${DUCKDB_VERSION}-node-v93-darwin-x64.node`],
  ["linux-x64", `duckdb-v${DUCKDB_VERSION}-node-v93-linux-x64.node`],
]);

const nodeTarget = "node16";

async function packageServer(
  platform: string,
  architecture: string,
  sign = true,
  skipPackageStep = false,
  version = "dev"
) {
  let target = `${platform}-${architecture}`;
  doBuild(target);

  if (sign) {
    console.log(`Signing not yet implemented`);
  }

  if (!duckDbTargetMap.has(target)) {
    throw new Error(`No DuckDb defined for target: ${target}`);
  }

  fs.copyFileSync(
    path.resolve(__dirname, `${duckdbPath}/${duckDbTargetMap.get(target)}`),
    path.resolve(__dirname, "../dist/duckdb-native.node"),
    fs.constants.COPYFILE_FICLONE
  );

  if (platform == "darwin") {
    target = `macos-${architecture}`;
  }

  if (skipPackageStep) {
    console.log("Skipping final packaging step");
    return;
  }
  await pkg.exec([
    "-c",
    "package.json",
    "dist/cli.js",
    "--target",
    `${nodeTarget}-${target}`,
    "--output",
    `pkg/malloy-composer-cli-${target}-${version}`,
  ]);
}

/**
 * @returns Array of version bits. [major, minor, patch]
 */
function getVersionBits(): Array<number> {
  return JSON.parse(fs.readFileSync("package.json", "utf-8"))
    .version.split(".")
    .map(Number);
}

type Architecture = "x64" | "arm64";
type Platform = "darwin" | "linux" | "win32";

interface PackageTarget {
  architecture: Architecture;
  platform: Platform;
}

(async () => {
  const program = new Command();
  program
    .option("-p, --platform <string>", "Target platform")
    .option("-a, --arch <string>", "Target architecture")
    .option("--skip-package", "Skip packaging step")
    .option("--sign", "Sign the build executable")
    .option(
      "--all-targets",
      "create all supported platform/binary combinations"
    );

  program.parse();
  const options = program.opts();
  let platform: string;
  let architecture: string;

  let targets: PackageTarget[];
  if (options.allTargets) {
    targets = [
      { platform: "darwin", architecture: "x64" },
      { platform: "darwin", architecture: "arm64" },
      { platform: "linux", architecture: "x64" },
    ];
  } else {
    if (options.platform) {
      platform = options.platform;
    } else {
      platform = process.platform;
      console.log(
        `Target platform was not specified, using current: ${platform}`
      );
    }

    if (options.arch) {
      architecture = options.arch;
    } else {
      architecture = process.arch;
      console.log(
        `Target architecture was not specified, using current: ${architecture}`
      );
    }
    targets = [
      {
        platform: platform as Platform,
        architecture: architecture as Architecture,
      },
    ];
  }

  console.log(JSON.stringify(options));
  const versionBits = getVersionBits();
  versionBits[2] = Math.floor(Date.now() / 1000);
  for (const target of targets) {
    console.log(
      `Packaging server for ${target.platform}-${target.architecture}`
    );
    await packageServer(
      target.platform,
      target.architecture,
      options.sign,
      options.skipPackage,
      versionBits.join(".")
    );
  }
})()
  .then(() => {
    console.log("Composer server built successfully");
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
