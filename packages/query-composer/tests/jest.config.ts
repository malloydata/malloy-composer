/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/?(*.)spec.(ts|js)?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/out/'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {tsconfig: './tsconfig.json', transformIgnorePatterns: ['**/shikijs/**']},
    ],
  },
  testTimeout: 100000,
  verbose: true,
  testEnvironment: 'node',
};
