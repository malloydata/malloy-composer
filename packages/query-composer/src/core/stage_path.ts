/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {StagePath} from '../types';

export function stagePathPush(
  stagePath: StagePath | undefined,
  part: {stageIndex: number; fieldIndex?: number}
): StagePath {
  if (stagePath === undefined) {
    return {stageIndex: part.stageIndex};
  }
  if (part.fieldIndex === undefined) {
    throw new Error('Invalid push to stage path');
  }
  return {
    stageIndex: part.stageIndex,
    parts: [
      ...(stagePath.parts || []),
      {stageIndex: stagePath.stageIndex, fieldIndex: part.fieldIndex},
    ],
  };
}

export function stagePathPop(stagePath: StagePath): {
  stagePath?: StagePath;
  stageIndex: number;
  fieldIndex?: number;
} {
  if (stagePath.parts && stagePath.parts.length > 0) {
    const part = stagePath.parts[0];
    return {
      stageIndex: part.stageIndex,
      fieldIndex: part.fieldIndex,
      stagePath: {
        stageIndex: stagePath.stageIndex,
        parts: stagePath.parts.slice(1),
      },
    };
  }
  return {stageIndex: stagePath.stageIndex};
}

export function stagePathParent(stagePath: StagePath): {
  stagePath?: StagePath;
  stageIndex: number;
  fieldIndex?: number;
} {
  if (stagePath.parts) {
    return {
      stagePath: {
        stageIndex: stagePath.parts[0].stageIndex,
        parts: stagePath.parts?.slice(1),
      },
      stageIndex: stagePath.stageIndex,
      fieldIndex: stagePath.parts[0].fieldIndex,
    };
  } else {
    return {
      stagePath: undefined,
      fieldIndex: undefined,
      stageIndex: stagePath.stageIndex,
    };
  }
}
