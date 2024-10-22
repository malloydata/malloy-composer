import * as React from 'react';
import {
  SearchValueMapResult,
  SourceDef,
  Result as MalloyResult,
  ModelDef,
  TurtleDef,
} from '@malloydata/malloy';
import {createContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import {QuerySummary} from '../../types';
import {ActionIcon} from '../ActionIcon';
import {PageContent, PageHeader} from '../CommonElements';
import {QueryModifiers} from '../../hooks/use_query_builder';
import {Popover} from '../Popover';
import {QuerySummaryPanel} from '../QuerySummaryPanel';
import {Result} from '../Result';
import {TopQueryActionMenu} from '../TopQueryActionMenu';
import RunIcon from '../../assets/img/query_run_wide.svg?react';
import {LoadTopQueryContextBar} from '../LoadTopQueryContextBar';
import {DummyCompile} from '../../core/dummy-compile';

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
    isRunnable: boolean;
  };
  queryModifiers: QueryModifiers;
  runQuery: (query: string, queryName: string) => void;
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
  isRunning,
  result: currentResult,
  querySummary,
  queryMalloy,
  queryModifiers,
}) => {
  const [insertOpen, setInsertOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [result, setResult] = useState<MalloyResult>();
  const [_error, setError] = useState<Error>();
  const [lastRunQuery, setLastRunQuery] = useState<string>();

  const {notebook: query, isRunnable} = queryMalloy;

  const runQueryCallback = React.useCallback(() => {
    setResult(undefined);
    setLastRunQuery(query);
    runQuery(query, queryName);
  }, [query, queryName, runQuery]);

  useEffect(() => {
    if (currentResult instanceof Error) {
      setResult(undefined);
      setError(currentResult);
    } else {
      setResult(currentResult);
    }
  }, [currentResult]);

  // TODO
  const isQueryEmpty = false;

  const clearQuery = () => {
    queryModifiers.clearQuery();
    setResult(undefined);
    setError(undefined);
  };

  const replaceQuery = (field: TurtleDef) => {
    queryModifiers.replaceQuery(field);
    setResult(undefined);
    setError(undefined);
  };

  const dirty = query !== lastRunQuery;

  return (
    <ComposerOptionsContext.Provider value={composerOptions}>
      <Outer>
        <SidebarOuter>
          <SidebarHeader>
            {source && (
              <>
                <div>
                  <ActionIcon
                    action="add"
                    onClick={() => setInsertOpen(true)}
                    color="dimension"
                  />
                  <Popover open={insertOpen} setOpen={setInsertOpen}>
                    <TopQueryActionMenu
                      model={model}
                      modelPath={modelPath}
                      source={source}
                      queryModifiers={queryModifiers}
                      stagePath={{stageIndex: 0}}
                      orderByFields={
                        querySummary?.stages[0].orderByFields || []
                      }
                      closeMenu={() => setInsertOpen(false)}
                      queryName={queryName}
                      stageSummary={querySummary?.stages[0]}
                      isOnlyStage={querySummary?.stages.length === 1}
                      topValues={topValues}
                    />
                  </Popover>
                </div>
                <div>
                  <ActionIcon
                    action="load"
                    onClick={() => setLoadOpen(true)}
                    color="query"
                  />
                  <Popover open={loadOpen} setOpen={setLoadOpen}>
                    <LoadTopQueryContextBar
                      model={model}
                      source={source}
                      selectField={field => replaceQuery(field as TurtleDef)}
                      onComplete={() => setLoadOpen(false)}
                    />
                  </Popover>
                </div>
                <ActionIcon
                  action="remove"
                  onClick={clearQuery}
                  color={isQueryEmpty ? 'other' : 'dimension'}
                />
                <StyledRunIcon
                  width="80px"
                  onClick={runQueryCallback}
                  className={
                    isRunning
                      ? 'running'
                      : isQueryEmpty || !isRunnable
                      ? 'blank'
                      : dirty
                      ? 'dirty'
                      : 'clean'
                  }
                />
              </>
            )}
          </SidebarHeader>
          <QueryBar>
            <QueryBarInner>
              {querySummary && (
                <QuerySummaryPanel
                  model={model}
                  modelPath={modelPath}
                  source={source}
                  querySummary={querySummary}
                  queryModifiers={queryModifiers}
                  stagePath={undefined}
                  topValues={topValues}
                />
              )}
            </QueryBarInner>
          </QueryBar>
        </SidebarOuter>
        <Result
          model={model}
          source={source}
          result={result}
          malloy={queryMalloy}
          onDrill={queryModifiers.onDrill}
          isRunning={isRunning}
        />
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
`;

const QueryBar = styled(PageContent)`
  display: flex;
  overflow-y: auto;
  flex-direction: column;
`;

const QueryBarInner = styled.div`
  padding: 10px;
`;

const SidebarHeader = styled(PageHeader)`
  gap: 20px;
  justify-content: center;
  align-items: center;
`;

const StyledRunIcon = styled(RunIcon)`
  cursor: pointer;
  &.running,
  &.clean,
  &.blank {
    .backgroundfill {
      fill: #e9e9e9;
    }
    .foregroundstroke {
      stroke: #a7a7a7;
    }
    .foregroundfill {
      fill: #a7a7a7;
    }
  }
`;
