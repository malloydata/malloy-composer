/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import {
  SearchValueMapResult,
  SourceDef,
  Result as MalloyResult,
  ModelDef,
} from '@malloydata/malloy';
import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {QuerySummary} from '../../types';
import {QueryModifiers} from '../../hooks';
import {Result} from '../Result';
import {ErrorMessage} from '../ErrorMessage';
import {QueryEditor} from '../QueryEditor';
import {QueryWriter} from '../../core/query';
import {ComposerOptionsContext} from '../../contexts';
import {StubCompile} from '../../core/stub-compile';
import {EventModifiers} from '../component_types';

interface ExploreQueryEditorProps {
  source: SourceDef;
  topValues: SearchValueMapResult[] | undefined;
  queryWriter: QueryWriter;
  querySummary: QuerySummary | undefined;
  queryModifiers: QueryModifiers;
  runQuery: (query: string, queryName?: string) => void;
  refreshModel?: (modifiers: EventModifiers) => void;
  isRunning: boolean;
  result: MalloyResult | Error | undefined;
  model: ModelDef;
  modelPath: string;
}

const composerOptions = {
  compiler: new StubCompile(),
};

export const ExploreQueryEditor: React.FC<ExploreQueryEditorProps> = ({
  model,
  modelPath,
  source,
  topValues,
  runQuery,
  refreshModel,
  isRunning,
  result: currentResult,
  querySummary,
  queryModifiers,
  queryWriter,
}) => {
  const [result, setResult] = useState<MalloyResult>();
  const [error, setError] = useState<Error>();

  const {isRunnable} = querySummary ?? {isRunnable: false};

  const runQueryCallback = React.useCallback(
    (query: string, queryName?: string) => {
      if (!isRunnable) {
        return;
      }
      setResult(undefined);
      setError(undefined);
      runQuery(query, queryName);
    },
    [isRunnable, runQuery]
  );

  useEffect(() => {
    if (currentResult instanceof Error) {
      setResult(undefined);
      setError(currentResult);
    } else {
      setResult(currentResult);
    }
  }, [currentResult]);

  return (
    <ComposerOptionsContext.Provider value={composerOptions}>
      <Outer>
        <SidebarOuter>
          <QueryEditor
            isRunning={isRunning}
            model={model}
            queryModifiers={queryModifiers}
            querySummary={querySummary}
            queryWriter={queryWriter}
            source={source}
            refreshModel={refreshModel}
            runQuery={runQueryCallback}
            topValues={topValues}
          />
        </SidebarOuter>
        <ResultOuter>
          <Result
            isRunning={isRunning}
            model={model}
            modelPath={modelPath}
            source={source}
            result={result}
            queryWriter={queryWriter}
            querySummary={querySummary}
            onDrill={queryModifiers.onDrill}
          />
          <ErrorMessage error={error} />
        </ResultOuter>
      </Outer>
    </ComposerOptionsContext.Provider>
  );
};

const Outer = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  gap: 10px;
  background-color: var(--malloy-background-color);
`;

const SidebarOuter = styled.div`
  width: 300px;
  min-width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const ResultOuter = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 10px;
`;
