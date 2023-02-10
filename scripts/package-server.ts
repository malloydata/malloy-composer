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
import { doBuild } from "./build";
import * as pkg from "pkg";
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";
import { targetDuckDBMap } from "./utils/fetch_duckdb";

const duckdbPath = "../third_party/github.com/duckdb/duckdb";

const nodeTarget = "node16";

async function packageServer(
  platform: string,
  architecture: string,
  sign = true,
  skipPackageStep = false,
  version = "dev"
) {
  let target = `${platform}-${architecture}`;

  await doBuild(target);

  if (sign) {
    console.log(`Signing not yet implemented`);
  }

  if (!targetDuckDBMap[target]) {
    throw new Error(`No DuckDb defined for target: ${target}`);
  }

  fs.copyFileSync(
    path.resolve(__dirname, `${duckdbPath}/${targetDuckDBMap[target]}`),
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
      { platform: "win32", architecture: "x64" },
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

  fs.rmSync("pkg/", { recursive: true, force: true });
  fs.mkdirSync("pkg/", { recursive: true });

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
