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
import * as React from 'react';

import {QuerySummary, StagePath, stagePathPush} from '../../types';
import {ModelDef, SourceDef} from '@malloydata/malloy';
import {EmptyMessage} from '../CommonElements';
import {StageActionMenu} from '../StageActionMenu';
import {BackPart, CloseIconStyled} from '../FieldButton/FieldButton';
import {QueryModifiers} from '../../hooks';
import {FieldListDiv} from './FieldListDiv';
import {StageSummaryUI} from './StateSummaryUI';
import {ClickToPopover} from './ClickToPopover';
import {StageButton} from './StageButton';

export interface QuerySummaryPanelProps {
  model: ModelDef;
  source: SourceDef;
  querySummary: QuerySummary;
  stagePath: StagePath | undefined;
  queryModifiers: QueryModifiers;
  modelPath: string;
}

export const QuerySummaryPanel: React.FC<QuerySummaryPanelProps> = ({
  model,
  modelPath,
  querySummary,
  stagePath,
  queryModifiers,
}) => {
  if (
    querySummary.stages[0].items.length === 0 &&
    querySummary.stages.length === 1
  ) {
    if (!stagePath || !stagePath.parts || stagePath.parts.length === 0) {
      return (
        <EmptyMessage>
          <div>Add fields to the query</div>
          <div>with the “+” button</div>
        </EmptyMessage>
      );
    }
  }

  return (
    <FieldListDiv>
      {querySummary.stages.map((stageSummary, stageIndex) => {
        const nestStagePath = stagePathPush(stagePath, {
          stageIndex,
          fieldIndex: 0,
        });
        return (
          <div key={'stage/' + stageIndex}>
            {querySummary.stages.length > 1 && (
              <ClickToPopover
                popoverContent={({closeMenu}) => (
                  <StageActionMenu
                    model={model}
                    modelPath={modelPath}
                    source={stageSummary.inputSource}
                    stagePath={nestStagePath}
                    orderByFields={stageSummary.orderByFields}
                    closeMenu={closeMenu}
                    isLastStage={stageIndex === querySummary.stages.length - 1}
                    stageSummary={stageSummary}
                    queryModifiers={queryModifiers}
                  />
                )}
                content={({isOpen}) => (
                  <StageButton active={isOpen}>
                    Stage {stageIndex + 1}
                    <BackPart className="back">
                      <CloseIconStyled
                        color="other"
                        width="20px"
                        height="20px"
                        className="close"
                        onClick={() =>
                          queryModifiers.removeStage(nestStagePath)
                        }
                      />
                    </BackPart>
                  </StageButton>
                )}
              />
            )}
            <StageSummaryUI
              model={model}
              modelPath={modelPath}
              stageSummary={stageSummary}
              queryModifiers={queryModifiers}
              stagePath={nestStagePath}
              key={'stage/' + stageIndex}
              source={stageSummary.inputSource}
            />
          </div>
        );
      })}
    </FieldListDiv>
  );
};
