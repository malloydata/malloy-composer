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
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";
import archiver from "archiver";

const OUT_DIR = "bundle";
const MALLOY_SAMPLES_DIR = "malloy-samples";
const BUNDLE_README = "bundle-readme.txt";
const BUNDLE_README_NAME = "readme.txt";

const BINARY_NAME = "composer";

async function createReleaseBundle(
  binary: string,
  verbose = false
): Promise<void> {
  const targetBinary = path.resolve(__dirname, "..", binary);
  if (!fs.existsSync(targetBinary))
    throw new Error(`Could not find: ${targetBinary}`);

  const targetName = path.basename(targetBinary);
  const matches = targetName.match(/^.+-([0-9.]+)(\.exe)?$/);
  if (!matches) {
    throw new Error(`Unknown binary name format: ${targetName}`);
  }
  const version = matches[1];
  const isExe = matches[2]?.length > 0 ?? false;
  const extensionOffset = isExe ? 5 : 1;
  const outName = targetName.substring(
    0,
    targetName.length - version.length - extensionOffset
  );
  fs.mkdirSync(path.resolve(__dirname, "..", OUT_DIR, version), {
    recursive: true,
  });

  // Create bundle zip
  const archiveWrapper = new Promise<void>((resolve, reject) => {
    const targetZip = path.resolve(
      __dirname,
      "..",
      OUT_DIR,
      version,
      `${outName}.zip`
    );
    const zipFile = fs.createWriteStream(targetZip);
    console.log(`Creating zip bundle:`);
    const archive = archiver("zip", { zlib: { level: 9 } });
    zipFile.on("close", function () {
      console.log(`Bundle created: ${targetZip}`);
      console.log(`  size: ${(archive.pointer() / 2 ** 20).toFixed(2)} MB`);
      resolve();
    });
    archive.on("entry", (data) => {
      if (verbose) console.log(`  adding: ${data.name}`);
    });
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn(err.message);
      } else {
        console.error(err.message, err);
        reject(err);
      }
    });
    archive.on("error", (err) => {
      reject(err);
    });
    archive.pipe(zipFile);
    const globCwd = path.resolve(__dirname, "..");
    archive
      .glob(`${MALLOY_SAMPLES_DIR}/*.md`, { cwd: globCwd })
      .glob(`${MALLOY_SAMPLES_DIR}/*.json`, { cwd: globCwd })
      .glob(`${MALLOY_SAMPLES_DIR}/LICENSE`, { cwd: globCwd })
      .file(targetBinary, { name: BINARY_NAME + (isExe ? ".exe" : "") })
      .file(path.resolve(__dirname, "..", BUNDLE_README), {
        name: BUNDLE_README_NAME,
      })
      .directory(
        path.resolve(__dirname, `../${MALLOY_SAMPLES_DIR}/bigquery`),
        "malloy-samples/bigquery"
      )
      .directory(
        path.resolve(__dirname, `../${MALLOY_SAMPLES_DIR}/duckdb`),
        "malloy-samples/duckdb"
      );

    archive.finalize();
  });

  await archiveWrapper;
}

(async () => {
  const program = new Command();
  program
    .option("-t, --target <path>", "Target binary to create a bundle for")
    .option("-v, --verbose", "Provide verbose output logs", false);

  program.parse();
  const options = program.opts();

  const targets: string[] = [];

  if (options.target) {
    targets.push(options.target);
  } else {
    fs.readdirSync(path.resolve(__dirname, "..", "pkg")).forEach((file) =>
      targets.push(`pkg/${file}`)
    );
  }

  for (const target of targets) {
    await createReleaseBundle(target, options.verbose);
  }
})()
  .then(() => {
    console.log("Composer bundle built successfully");
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
