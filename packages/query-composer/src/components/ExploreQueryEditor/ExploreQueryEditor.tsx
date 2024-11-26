import * as React from 'react';
import {
  SearchValueMapResult,
  SourceDef,
  Result as MalloyResult,
  ModelDef,
} from '@malloydata/malloy';
import {createContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import {QuerySummary} from '../../types';
import {QueryModifiers} from '../../hooks';
import {Result} from '../Result';
import {DummyCompile} from '../../core/dummy-compile';
import {SearchContext} from '../../contexts/search_context';
import {ErrorMessage} from '../ErrorMessage';
import {QueryEditor} from '../QueryEditor';

interface ExploreQueryEditorProps {
  source: SourceDef;
  topValues: SearchValueMapResult[] | undefined;
  queryName: string;
  querySummary: QuerySummary | undefined;
  queryMalloy: {
    model: string;
    source: string;
    markdown: string;
    notebook: string;
  };
  queryModifiers: QueryModifiers;
  runQuery: (query: string, queryName: string) => void;
  refreshModel?: () => void;
  isRunning: boolean;
  result: MalloyResult | Error | undefined;
  model: ModelDef;
  modelPath: string;
}

const composerOptions = {
  dummyCompiler: new DummyCompile(),
};

export const ComposerOptionsContext = createContext<{
  dummyCompiler: DummyCompile;
}>(composerOptions);

export const ExploreQueryEditor: React.FC<ExploreQueryEditorProps> = ({
  model,
  modelPath,
  source,
  queryName,
  topValues,
  runQuery,
  refreshModel,
  isRunning,
  result: currentResult,
  querySummary,
  queryMalloy,
  queryModifiers,
}) => {
  const [result, setResult] = useState<MalloyResult>();
  const [error, setError] = useState<Error>();
  const [_lastRunQuery, setLastRunQuery] = useState<string>();

  const {notebook: query} = queryMalloy;
  const {isRunnable} = querySummary ?? {isRunnable: false};

  const runQueryCallback = React.useCallback(() => {
    if (!isRunnable) {
      return;
    }
    setResult(undefined);
    setError(undefined);
    setLastRunQuery(query);
    runQuery(query, queryName);
  }, [isRunnable, query, queryName, runQuery]);

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
      <SearchContext.Provider value={{topValues}}>
        <Outer>
          <SidebarOuter>
            <QueryEditor
              isRunning={isRunning}
              model={model}
              modelPath={modelPath}
              queryModifiers={queryModifiers}
              queryName={queryName}
              querySummary={querySummary}
              source={source}
              refreshModel={refreshModel}
              runQuery={runQueryCallback}
            />
          </SidebarOuter>
          <ResultOuter>
            <Result
              model={model}
              source={source}
              result={result}
              malloy={queryMalloy}
              querySummary={querySummary}
              onDrill={queryModifiers.onDrill}
              isRunning={isRunning}
            />
            <ErrorMessage error={error} />
          </ResultOuter>
        </Outer>
      </SearchContext.Provider>
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
