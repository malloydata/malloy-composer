#!/usr/bin/env node
const package = require('../package.json');

let malloyPackages = Object.keys(package.dependencies).filter(package =>
  package.startsWith('@malloy')
);

if (process.argv.length === 3) {
  malloyPackages = malloyPackages.map(
    package => `${package}@${process.argv[2]}`
  );
}
console.log(malloyPackages.join(' '));
