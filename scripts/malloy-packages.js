#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const package = require("../package.json");

let malloyPackages = Object.keys(package.dependencies).filter((package) =>
  package.startsWith("@malloy")
);

if (process.argv.length === 3) {
  malloyPackages = malloyPackages.map(
    (package) => `${package}@${process.argv[2]}`
  );
}
// eslint-disable-next-line no-console
console.log(malloyPackages.join(" "));
