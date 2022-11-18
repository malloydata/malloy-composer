import {
  SearchValueMapResult,
  StructDef,
  Result as MalloyResult,
  ModelDef,
} from "@malloydata/malloy";
import { DataStyles } from "@malloydata/render";
import { useState } from "react";
import styled from "styled-components";
import { QuerySummary } from "../../types";
import { ActionIcon } from "../ActionIcon";
import { PageContent, PageHeader } from "../CommonElements";
import { QueryModifiers } from "../hooks/use_query_builder";
import { Popover } from "../Popover";
import { QuerySummaryPanel } from "../QuerySummaryPanel";
import { Result } from "../Result";
import { TopQueryActionMenu } from "../TopQueryActionMenu";
import { ReactComponent as RunIcon } from "../assets/img/query_run_wide.svg";
import { LoadTopQueryContextBar } from "../LoadTopQueryContextBar";

interface ExploreQueryEditorProps {
  source: StructDef | undefined;
  topValues: SearchValueMapResult[] | undefined;
  queryName: string;
  querySummary: QuerySummary | undefined;
  result: MalloyResult | undefined;
  dataStyles: DataStyles;
  queryMalloy: {
    model: string;
    source: string;
    markdown: string;
    isRunnable: boolean;
  };
  isRunning: boolean;
  queryModifiers: QueryModifiers;
  runQuery: () => void;
  model: ModelDef;
  dirty: boolean;
  modelPath: string | undefined;
  undo: () => void;
  canUndo: boolean;
  isQueryEmpty: boolean;
  canQueryRun: boolean;
}

export const ExploreQueryEditor: React.FC<ExploreQueryEditorProps> = ({
  dirty,
  model,
  modelPath,
  source,
  queryName,
  topValues,
  runQuery,
  querySummary,
  result,
  dataStyles,
  isRunning,
  queryMalloy,
  queryModifiers,
  undo,
  canUndo,
  isQueryEmpty,
  canQueryRun,
}) => {
  const [insertOpen, setInsertOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  return (
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
                    stagePath={{ stageIndex: 0 }}
                    orderByFields={querySummary?.stages[0].orderByFields || []}
                    closeMenu={() => setInsertOpen(false)}
                    queryName={queryName}
                    stageSummary={querySummary?.stages[0].items || []}
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
                    selectField={queryModifiers.replaceQuery}
                    onComplete={() => setLoadOpen(false)}
                  />
                </Popover>
              </div>
              <ActionIcon
                action="undo"
                onClick={() => undo()}
                color={canUndo ? "dimension" : "other"}
              />
              <ActionIcon
                action="remove"
                onClick={() => queryModifiers.clearQuery()}
                color={isQueryEmpty ? "other" : "dimension"}
              />
              <StyledRunIcon
                width="80px"
                onClick={() => runQuery()}
                className={
                  isRunning
                    ? "running"
                    : isQueryEmpty || !canQueryRun
                    ? "blank"
                    : dirty
                    ? "dirty"
                    : "clean"
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
                queryName={queryName}
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
        dataStyles={dataStyles}
        malloy={queryMalloy}
        onDrill={queryModifiers.onDrill}
        isRunning={isRunning}
      />
    </Outer>
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
