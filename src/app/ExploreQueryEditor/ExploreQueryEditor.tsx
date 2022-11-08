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
import { EmptyMessage, PageContent, PageHeader } from "../CommonElements";
import { QueryModifiers, useQueryBuilder } from "../hooks/use_query_builder";
import { Popover } from "../Popover";
import { QuerySummaryPanel } from "../QuerySummaryPanel";
import { Result } from "../Result";
import { SaveQueryButton } from "../SaveQueryButton";
import { TopQueryActionMenu } from "../TopQueryActionMenu";
import { isDuckDBWASM } from "../utils";

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
}

export const ExploreQueryEditor: React.FC<ExploreQueryEditorProps> = ({
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
}) => {
  // const {
  //   queryMalloy,
  //   queryName,
  //   clearQuery,
  //   runQuery,
  //   isRunning,
  //   clearResult,
  //   queryModifiers,
  //   querySummary,
  //   dataStyles,
  //   result,
  //   error,
  // } = useQueryBuilder(model, sourceName);
  const [insertOpen, setInsertOpen] = useState(false);
  // const source = model.contents[sourceName] as StructDef;
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
                    source={source}
                    queryModifiers={queryModifiers}
                    stagePath={{ stageIndex: 0 }}
                    orderByFields={querySummary?.stages[0].orderByFields || []}
                    closeMenu={() => setInsertOpen(false)}
                    queryName={queryName}
                    stageSummary={querySummary?.stages[0].items || []}
                    isOnlyStage={querySummary?.stages.length === 1}
                    topValues={[]}
                  />
                </Popover>
              </div>
              <ActionIcon
                action="remove"
                onClick={() => queryModifiers.clearQuery()}
                color="dimension"
              />
              <ActionIcon
                action="run"
                onClick={() => runQuery()}
                color="dimension"
              />
            </>
          )}
        </SidebarHeader>
        <QueryBar>
          <QueryBarInner>
            {querySummary && (
              <QuerySummaryPanel
                source={source}
                querySummary={querySummary}
                queryModifiers={queryModifiers}
                stagePath={undefined}
                queryName={queryName}
                topValues={[]}
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
