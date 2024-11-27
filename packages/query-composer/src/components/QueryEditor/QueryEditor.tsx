import * as React from 'react';
import {useState} from 'react';
import {QuerySummaryPanel} from '../QuerySummaryPanel';
import {
  ModelDef,
  SearchValueMapResult,
  SourceDef,
  TurtleDef,
} from '@malloydata/malloy';
import {ActionIcon} from '../ActionIcon';
import {PageContent, PageHeader} from '../CommonElements';
import {LoadTopQueryContextBar} from '../LoadTopQueryContextBar';
import {Popover} from '../Popover';
import {TopQueryActionMenu} from '../TopQueryActionMenu';
import RunIcon from '../../assets/img/query_run_wide.svg?react';
import {QueryModifiers} from '../../hooks';
import {QuerySummary} from '../../types';
import styled from 'styled-components';
import {SearchContext} from '../../contexts/search_context';
import {QueryWriter} from '../../core/query';

const useLoad = true;

export interface QueryEditorProps {
  isRunning: boolean;
  model: ModelDef;
  refreshModel?: () => void;
  queryModifiers: QueryModifiers;
  querySummary: QuerySummary | undefined;
  queryWriter: QueryWriter;
  runQuery: (query: string) => void;
  source: SourceDef;
  topValues: SearchValueMapResult[] | undefined;
}

export const QueryEditor = ({
  isRunning,
  model,
  queryModifiers,
  querySummary,
  queryWriter,
  refreshModel,
  runQuery,
  source,
  topValues,
}: QueryEditorProps) => {
  const [insertOpen, setInsertOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [lastRunQuery, setLastRunQuery] = useState<string>('');

  const isQueryEmpty = !querySummary || querySummary.stages.length === 0;
  const {isRunnable} = querySummary ?? {isRunnable: false};

  const query = queryWriter.getQueryStringForNotebook();

  const clearQuery = () => {
    queryModifiers.clearQuery();
  };

  const replaceQuery = (field: TurtleDef) => {
    queryModifiers.replaceQuery(field);
  };

  const loadQuery = (name: string) => {
    queryModifiers.loadQuery(name);
  };

  const dirty = query !== lastRunQuery;

  const onRun = () => {
    setLastRunQuery(query);
    runQuery(query);
  };

  return (
    <SearchContext.Provider value={{topValues}}>
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
                    source={source}
                    queryModifiers={queryModifiers}
                    stagePath={{stageIndex: 0}}
                    orderByFields={querySummary?.stages[0].orderByFields || []}
                    closeMenu={() => setInsertOpen(false)}
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
                title="Clear Query"
              />
              <StyledRunIcon
                width="80px"
                onClick={onRun}
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
                querySummary={querySummary}
                queryModifiers={queryModifiers}
                stagePath={undefined}
              />
            )}
          </QueryBarInner>
        </QueryBar>
      </SidebarOuter>
    </SearchContext.Provider>
  );
};

const QueryBar = styled(PageContent)`
  display: flex;
  overflow-y: auto;
  flex-direction: column;
`;

const QueryBarInner = styled.div`
  padding: 10px;
`;

const SidebarOuter = styled.div`
  width: 300px;
  min-width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1000;
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
