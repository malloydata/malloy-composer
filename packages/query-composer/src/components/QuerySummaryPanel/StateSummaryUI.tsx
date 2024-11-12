/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import {useEffect, useState} from 'react';
import {ModelDef, SourceDef} from '@malloydata/malloy';
import {StagePath, StageSummary} from '../../types';
import {QueryModifiers} from '../../hooks';
import {notUndefined} from '../../utils';
import {FieldListDiv} from './FieldListDiv';
import {SummaryItem} from './SummaryItem';

interface SummaryStageProps {
  stageSummary: StageSummary;
  stagePath: StagePath;
  source: SourceDef;
  fieldIndex?: number | undefined;
  queryModifiers: QueryModifiers;
  model: ModelDef;
  modelPath: string;
}

export const StageSummaryUI: React.FC<SummaryStageProps> = ({
  model,
  modelPath,
  stageSummary,
  queryModifiers,
  source,
  stagePath,
}) => {
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number>();

  const beginReorderingField = (fieldIndex: number) => {
    setSelectedFieldIndex(fieldIndex);
  };

  const currentFieldOrdering = stageSummary.items
    .map(item => ('fieldIndex' in item ? item.fieldIndex : undefined))
    .filter(notUndefined);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const currentIndex = currentFieldOrdering.findIndex(
        fieldIndex => fieldIndex === selectedFieldIndex
      );
      const moveOffset =
        event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
      const otherIndex = currentIndex + moveOffset;
      if (
        currentIndex > -1 &&
        moveOffset !== 0 &&
        otherIndex >= 0 &&
        otherIndex < currentFieldOrdering.length
      ) {
        const newList = [...currentFieldOrdering];
        const tempItem = newList[currentIndex];
        newList[currentIndex] = newList[otherIndex];
        newList[otherIndex] = tempItem;
        queryModifiers.updateFieldOrder(stagePath, newList);
        setSelectedFieldIndex(otherIndex);
      }
    };
    window.addEventListener('keyup', handle);
    return () => window.removeEventListener('keyup', handle);
  });

  return (
    <FieldListDiv>
      {stageSummary.items.map((item, index) => (
        <SummaryItem
          model={model}
          modelPath={modelPath}
          key={`${item.type}/${index}`}
          item={item}
          stageSummary={stageSummary}
          beginReorderingField={beginReorderingField}
          isSelected={
            'fieldIndex' in item &&
            item.fieldIndex !== undefined &&
            item.fieldIndex === selectedFieldIndex
          }
          deselect={() => setSelectedFieldIndex(undefined)}
          queryModifiers={queryModifiers}
          source={source}
          stagePath={stagePath}
        />
      ))}
    </FieldListDiv>
  );
};
