import {
  SearchValueMapResult,
  StructDef,
  Result as MalloyResult,
  ModelDef,
} from "@malloydata/malloy";
import { DataStyles } from "@malloydata/render";
import { useState } from "react";
import styled from "styled-components";
import { Dataset, QuerySummary } from "../../types";
import { ActionIcon } from "../ActionIcon";
import { PageContent, PageHeader } from "../CommonElements";
import { QueryModifiers } from "../hooks/use_query_builder";
import { Popover } from "../Popover";
import { QuerySummaryPanel } from "../QuerySummaryPanel";
import { Result } from "../Result";
import { TopQueryActionMenu } from "../TopQueryActionMenu";
import { ReactComponent as RunIcon } from "../assets/img/query_run_wide.svg";

interface ExploreQueryEditorProps {
  source: StructDef | undefined;
  topValues: SearchValueMapResult[] | undefined;
  queryName: string;
  querySummary: QuerySummary | undefined;
  result: MalloyResult | undefined;
  dataStyles: DataStyles;
  queryMalloy: string;
  isRunning: boolean;
  queryModifiers: QueryModifiers;
  runQuery: () => void;
  queryTitle?: string;
  datasets: Dataset[];
  model: ModelDef;
  dirty: boolean;
}

export const ExploreQueryEditor: React.FC<ExploreQueryEditorProps> = ({
  dirty,
  model,
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
  queryTitle,
}) => {
  const [insertOpen, setInsertOpen] = useState(false);
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
              <ActionIcon
                action="remove"
                onClick={() => queryModifiers.clearQuery()}
                color="dimension"
              />
              <StyledRunIcon
                width="80px"
                onClick={() => runQuery()}
                className={isRunning ? "running" : dirty ? "dirty" : "clean"}
              />
            </>
          )}
        </SidebarHeader>
        <QueryBar>
          <QueryBarInner>
            {querySummary && (
              <QuerySummaryPanel
                model={model}
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
        source={source}
        result={result}
        dataStyles={dataStyles}
        malloy={queryMalloy}
        onDrill={queryModifiers.onDrill}
        isRunning={isRunning}
        queryTitle={queryTitle}
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
  &.clean {
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
