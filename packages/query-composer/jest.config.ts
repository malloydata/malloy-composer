/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/?(*.)spec.(ts|js)?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: './tests/tsconfig.tests.json',
      },
    ],
  },
  testTimeout: 100000,
  verbose: true,
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['lcov', 'html'],
  collectCoverageFrom: ['src/core/*.ts', 'src/hooks/*.ts'],
  preset: 'ts-jest',
  moduleNameMapper: {
    uuid: require.resolve('uuid'),
  },
};
