#!/usr/bin/env ts-node
import packageJson from '../package.json';

let malloyPackages = Object.keys(packageJson.dependencies).filter(
  name =>
    name.startsWith('@malloy') &&
    !packageJson.dependencies[name].startsWith('file:')
);

if (process.argv.length === 3) {
  malloyPackages = malloyPackages.map(
    packageJson => `${packageJson}@${process.argv[2]}`
  );
}
console.log(malloyPackages.join(' '));
