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
import {QueryModifiers} from '../../hooks';
import {Popover} from '../Popover';
import {QuerySummaryPanel} from '../QuerySummaryPanel';
import {Result} from '../Result';
import {TopQueryActionMenu} from '../TopQueryActionMenu';
import RunIcon from '../../assets/img/query_run_wide.svg?react';
import {LoadTopQueryContextBar} from '../LoadTopQueryContextBar';
import {DummyCompile} from '../../core/dummy-compile';
import {SearchContext} from '../../contexts/search_context';
import {ErrorMessage} from '../ErrorMessage';

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

const useLoad = true;

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
  const [insertOpen, setInsertOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [result, setResult] = useState<MalloyResult>();
  const [error, setError] = useState<Error>();
  const [lastRunQuery, setLastRunQuery] = useState<string>();

  const {notebook: query, isRunnable} = queryMalloy;

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

  const isQueryEmpty = !querySummary || querySummary.stages.length === 0;

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

  const loadQuery = (name: string) => {
    queryModifiers.loadQuery(name);
    setResult(undefined);
    setError(undefined);
  };

  const dirty = query !== lastRunQuery;

  return (
    <ComposerOptionsContext.Provider value={composerOptions}>
      <SearchContext.Provider value={{topValues}}>
        <Outer>
          <SidebarOuter>
            <SidebarHeader>
              {source && (
                <>
                  <div>
                    {refreshModel && (
                      <ActionIcon
                        action="refresh"
                        onClick={() => refreshModel()}
                        color="dimension"
                      />
                    )}
                  </div>
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
                        selectField={field =>
                          useLoad
                            ? loadQuery(field.as || field.name)
                            : replaceQuery(field as TurtleDef)
                        }
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
                  />
                )}
              </QueryBarInner>
            </QueryBar>
          </SidebarOuter>
          <ResultOuter>
            <Result
              model={model}
              source={source}
              result={result}
              malloy={queryMalloy}
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
  &.clean {
    .backgroundfill {
      fill: #ffffff;
    }
    .foregroundstroke {
      stroke: #4285f4;
    }
    .foregroundfill {
      fill: #4285f4;
    }
  }
`;
