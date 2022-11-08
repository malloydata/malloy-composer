/*
 * Copyright 2021 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Dataset } from "../../types";
import { useDatasets } from "../data/use_datasets";
import { Button, PageContent } from "../CommonElements";
import { ChannelButton } from "../ChannelButton";
import { ErrorMessage } from "../ErrorMessage";
import { ActionIcon } from "../ActionIcon";
import { DatasetPicker } from "../DatasetPicker";
import { HotKeys } from "react-hotkeys";
import { useTopValues } from "../data/use_top_values";
import { useQueryBuilder } from "../hooks";
import { ExploreQueryEditor } from "../ExploreQueryEditor";
import { compileModel, getSourceNameForQuery } from "../../core/compile";
import { COLORS } from "../colors";
import { MalloyLogo } from "../MalloyLogo";
import { MarkdownDocument } from "../MarkdownDocument";
import { isDuckDBWASM } from "../utils";
import { StructDef } from "@malloydata/malloy";
import { useSearchParams } from "react-router-dom";

const KEY_MAP = {
  REMOVE_FIELDS: "command+k",
  RUN_QUERY: "command+enter",
};

export const Explore: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset | undefined>();
  const [sourceName, setSourceName] = useState<string | undefined>();
  const datasets = useDatasets();

  // const topValues = useTopValues(analysis);
  const [params, setParams] = useSearchParams();

  // TODO maybe want to move to react router fully...
  const section = params.get("page") || "query";
  const setSection = (section: string) => {
    params.set("page", section);
    setParams(params);
  };

  const {
    queryMalloy,
    queryName,
    clearQuery,
    runQuery,
    isRunning,
    clearResult,
    queryModifiers,
    querySummary,
    dataStyles,
    result,
    registerNewSource,
    error,
  } = useQueryBuilder(dataset?.model, sourceName);

  const source =
    dataset && sourceName
      ? (dataset.model.contents[sourceName] as StructDef)
      : undefined;

  const setDatasetSource = (
    dataset: Dataset,
    sourceName: string,
    fromURL = false
  ) => {
    setDataset(dataset);
    setSourceName(sourceName);
    if (!fromURL) {
      params.set("source", sourceName);
      params.set("model", dataset.name);
      setParams(params);
    }
    registerNewSource(dataset.model.contents[sourceName] as StructDef);
  };

  useEffect(() => {
    const loadDataset = async () => {
      const model = params.get("model");
      const query = params.get("query");
      const source = params.get("source");
      if (model && (query || source) && datasets) {
        const isDatasetDifferent = !dataset || dataset.name !== model;
        const isSourceDifferent = source !== sourceName;
        if (isDatasetDifferent || isSourceDifferent) {
          const newDataset = datasets.find((dataset) => dataset.name === model);
          if (newDataset === undefined) {
            throw new Error("Bad model");
          }
          const sourceName =
            source || (await getSourceNameForQuery(newDataset.model, query));
          setDatasetSource(newDataset, sourceName, true);
        }
      }
    };
    loadDataset();
  }, [params, datasets]);

  const loadQueryLink = (
    model: string,
    query: string,
    name?: string,
    description?: string,
    renderer?: string
  ) => {
    params.set("model", model);
    params.set("source", sourceName);
    params.set("query", query);
    params.set("page", "query");
    params.set("run", "true");
    params.set("name", name);
    params.set("description", description);
    setParams(params);
  };

  const handlers = {
    REMOVE_FIELDS: () => clearQuery(),
    RUN_QUERY: runQuery,
  };

  return (
    <Main handlers={handlers} keyMap={KEY_MAP}>
      <Header>
        <HeaderLeft>
          <MalloyLogo />
          <DatasetPicker
            datasets={datasets}
            dataset={dataset}
            setSourceName={setDatasetSource}
            sourceName={sourceName}
          />
          {source && (
            <span>
              {params.get("name")} / {params.get("description")}
            </span>
          )}
        </HeaderLeft>
        {/* {!isRunning && <Button onClick={() => runQuery()}>Run</Button>}
        {isRunning && (
          <Button onClick={() => clearResult()} color="primary" outline={true}>
            Cancel
          </Button>
        )} */}
      </Header>
      <Body>
        <Content>
          <Channel>
            <ChannelTop>
              <ChannelButton
                onClick={() => setSection("query")}
                text="Query"
                icon="query"
                selected={section === "query"}
              ></ChannelButton>
              <ChannelButton
                onClick={() => setSection("about")}
                text="About"
                icon="about"
                selected={section === "about"}
                disabled={dataset?.readme == undefined}
              ></ChannelButton>
            </ChannelTop>
            <ChannelBottom></ChannelBottom>
          </Channel>
          <Page>
            <PageContainer>
              {section === "query" && (
                <ExploreQueryEditor
                  source={source}
                  queryModifiers={queryModifiers}
                  topValues={[]} // TODO
                  queryName={queryName}
                  querySummary={querySummary}
                  queryMalloy={queryMalloy}
                  dataStyles={dataStyles}
                  result={result}
                  isRunning={isRunning}
                  runQuery={runQuery}
                />
              )}
              {section === "about" && (
                <PageContent>
                  {dataset && (
                    <MarkdownDocument
                      content={
                        dataset.readme ||
                        "# No Readme\nThis project has no readme"
                      }
                      loadQueryLink={loadQueryLink}
                    />
                  )}
                </PageContent>
              )}
              {/* <ErrorMessage error={error} /> */}
            </PageContainer>
          </Page>
          <RightChannel />
        </Content>
      </Body>
      <BottomChannel />
    </Main>
  );
};

const Main = styled(HotKeys)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  outline: none;
  background-color: ${COLORS.mainBackground};
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const Body = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
  background-color: ${COLORS.mainBackground};
`;

const Channel = styled.div`
  width: 70px;
  min-width: 70px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${COLORS.mainBackground};
  justify-content: space-between;
`;

const ChannelTop = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const ChannelBottom = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const Header = styled.div`
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px 5px 20px;
  background-color: ${COLORS.mainBackground};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Page = styled(Content)``;

const RightChannel = styled.div`
  width: 10px;
  min-width: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${COLORS.mainBackground};
`;

const BottomChannel = styled.div`
  width: 100%;
  min-height: 10px;
  height: 10px;
  display: flex;
  flex-direction: column;
  background-color: ${COLORS.mainBackground};
`;
