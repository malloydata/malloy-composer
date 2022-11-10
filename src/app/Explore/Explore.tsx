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

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Dataset, RendererName } from "../../types";
import { useDatasets } from "../data/use_datasets";
import { PageContent } from "../CommonElements";
import { ChannelButton } from "../ChannelButton";
import { ErrorMessage } from "../ErrorMessage";
import { DatasetPicker } from "../DatasetPicker";
import { HotKeys } from "react-hotkeys";
import { useTopValues } from "../data/use_top_values";
import { useQueryBuilder } from "../hooks";
import { ExploreQueryEditor } from "../ExploreQueryEditor";
import { compileQuery, getSourceNameForQuery } from "../../core/compile";
import { COLORS } from "../colors";
import { MalloyLogo } from "../MalloyLogo";
import { MarkdownDocument } from "../MarkdownDocument";
import { StructDef } from "@malloydata/malloy";
import { useSearchParams, useLocation } from "react-router-dom";
import { ActionIcon } from "../ActionIcon";
import { ListNest } from "../ListNest";
import { FieldButton } from "../FieldButton";
import { DataStyles } from "@malloydata/render";

const KEY_MAP = {
  REMOVE_FIELDS: "command+k",
  RUN_QUERY: "command+enter",
};

function toTitleCase(name: string) {
  return name
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.substring(1))
    .join(" ");
}

export const Explore: React.FC = () => {
  const datasets = useDatasets();
  const [params, setParams] = useSearchParams();
  const dataset = datasets?.find(dataset => dataset.name === params.get("model"));
  const sourceName = params.get("source");
  const newParams = useRef("");

  console.log({datasets});

  const updateQueryInURL = ({ run, query: newQuery, styles: newStylesJSON }: { 
    run: boolean, 
    query: string | undefined,
    styles: DataStyles
  }) => {
    const oldQuery = params.get("query") || undefined;
    let newStyles = JSON.stringify(newStylesJSON);
    if (newStyles === "{}") newStyles = undefined;
    const oldStyles = params.get("styles") || undefined;
    console.log("updateQueryInURL", { oldQuery, newQuery, newStyles, oldStyles, change: !(oldQuery === newQuery && oldStyles === newStyles) });
    if (oldQuery === newQuery && oldStyles === newStyles) {
      return;
    }
    if (newQuery === undefined) {
      params.delete("query");
    } else {
      params.set("query", newQuery);
      params.delete("name");
    }
    if (run) {
      params.set("run", "true");
    } else {
      params.delete("run");
    }
    if (newStyles === undefined) {
      params.delete("styles");
    } else {
      params.set("styles", newStyles);
    }
    newParams.current = params.toString();
    console.log("set params 4");
    setParams(params);
  };

  const section = params.get("page") || "query";
  const setSection = (section: string) => {
    params.set("page", section);
    if (section !== "query") {
      params.delete("query");
      params.delete("run");
      params.delete("name");
      params.delete("styles");
    }
    console.log("set params 5");
    newParams.current = params.toString();
    setParams(params);
  };

  const {
    queryMalloy,
    queryName,
    clearQuery,
    clearResult,
    runQuery,
    isRunning,
    queryModifiers,
    querySummary,
    dataStyles,
    result,
    registerNewSource,
    error,
    dirty,
  } = useQueryBuilder(dataset?.model, dataset?.modelPath, sourceName, updateQueryInURL, dataset?.styles);

  const model = dataset?.model;
  const modelPath = dataset?.modelPath;
  const source =
    model && sourceName ? (model.contents[sourceName] as StructDef) : undefined;

  const setDatasetSource = (
    dataset: Dataset,
    sourceName: string,
    fromURL = false
  ) => {
    registerNewSource(dataset.model.contents[sourceName] as StructDef);
    if (!fromURL) {
      params.set("source", sourceName);
      params.set("model", dataset.name);
      params.set("page", "query");
      params.delete("query");
      params.delete("run");
      params.delete("name");
      params.delete("styles");
      clearQuery(true);
      newParams.current = params.toString();
      console.log("set params 6");
      setParams(params);
    }
  };

  useEffect(() => {
    const loadDataset = async () => {
      console.log({ params: params.toString(), newParams: newParams.current, change: params.toString() !== newParams.current  });
      console.log(new Map(params.entries()));
      const model = params.get("model");
      const query = params.get("query")?.replace(/->\s*{\n}/g, "");
      const source = params.get("source");
      const styles = params.get("styles");
      const page = params.get("page");
      console.log({ model, query, source, datasets});
      if (model && (query || source) && datasets) {
        if (params.toString() === newParams.current) return;
        const newDataset = datasets.find((dataset) => dataset.name === model);
        if (newDataset === undefined) {
          throw new Error("Bad model");
        }
        const sourceName =
          source || (await getSourceNameForQuery(newDataset.model, query));
        registerNewSource(newDataset.model.contents[sourceName] as StructDef);
        if (query) {
          if (page !== "query") return;
          clearResult();
          const compiledQuery = await compileQuery(newDataset.model, query);
          queryModifiers.setDataStyles(styles ? JSON.parse(styles) : {}, true);
          queryModifiers.setQuery(compiledQuery, true);
          if (params.has("run") && params.get("page") === "query") {
            runQuery();
          }
        } else {
          params.delete("query");
          params.delete("run");
          params.delete("name");
          params.delete("styles");
          clearQuery(true);
        }
        newParams.current = params.toString();
        console.log("set params 7");
      } else if (datasets && !dataset) {
        const newDataset = datasets[0];
        // setDataset(newDataset);
        params.set("model", newDataset.name);
        if (newDataset.readme) {
          params.set("page", "about");
        }
        newParams.current = params.toString();
        console.log("set params 1");
        setParams(params);
      }
    };
    loadDataset();
  }, [params, datasets]);

  const loadQueryLink = async (
    model: string,
    query: string,
    name?: string,
    renderer?: string
  ) => {
    const newDataset = datasets.find((dataset) => dataset.name === model);
    if (newDataset === undefined) {
      throw new Error("Bad model");
    }
    const sourceName = await getSourceNameForQuery(newDataset.model, query);
    params.set("model", model);
    params.set("source", sourceName);
    params.set("query", query);
    params.set("page", "query");
    params.set("run", "true");
    params.set("name", name);
    registerNewSource(newDataset.model.contents[sourceName] as StructDef);
    const compiledQuery = await compileQuery(newDataset.model, query);
    queryModifiers.setQuery(compiledQuery, true);
    if (renderer) {
      const styles = queryModifiers.setDataStyle(compiledQuery.name, renderer as RendererName, true);
      params.delete("renderer");
      params.set("styles", JSON.stringify(styles));
    }
    runQuery();
    newParams.current = params.toString();
    console.log("set params 2");
    setParams(params);
  };

  const runQueryAction = () => {
    runQuery();
    params.set("run", "true");
    newParams.current = params.toString();
    console.log("set params 3");
    setParams(params, { replace: true });
  };

  const handlers = {
    REMOVE_FIELDS: () => clearQuery(),
    RUN_QUERY: runQueryAction,
  };

  const topValues = useTopValues(dataset, source);

  return (
    <Main handlers={handlers} keyMap={KEY_MAP}>
      <Header>
        <HeaderLeft>
          <MalloyLogo />
          { dataset && <span>
            { dataset.name }
            { sourceName && (section === "query" || section === "sources") && <span>
              {' ›'} {toTitleCase(sourceName)}
              { (params.get("name") || queryName) && section === "query" && <span>
                {' ›'} {params.get("name") || toTitleCase(queryName)}
              </span> }
            </span> }
          </span> } 
        </HeaderLeft>
      </Header>
      <Body>
        <Content>
          <Channel>
            <ChannelTop>
              <ChannelButton
                onClick={() => setSection("about")}
                text="Home"
                icon="about"
                selected={section === "about"}
                disabled={dataset?.readme === undefined}
              ></ChannelButton>
              <ChannelButton
                onClick={() => setSection("query")}
                text="Query"
                icon="query"
                selected={section === "query"}
              ></ChannelButton>
              <ChannelButton
                onClick={() => setSection("sources")}
                text="Sources"
                icon="source"
                selected={section === "sources"}
                disabled={datasets === undefined}
              ></ChannelButton>
            </ChannelTop>
            <ChannelBottom></ChannelBottom>
          </Channel>
          <Page>
            <PageContainer>
              {section === "query" && (
                <ExploreQueryEditor
                  dirty={dirty}
                  model={model}
                  modelPath={modelPath}
                  source={source}
                  datasets={datasets}
                  queryModifiers={queryModifiers}
                  topValues={topValues}
                  queryName={queryName}
                  querySummary={querySummary}
                  queryMalloy={queryMalloy}
                  dataStyles={dataStyles}
                  result={result}
                  isRunning={isRunning}
                  runQuery={runQueryAction}
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
              {section === "sources" && (
                <PageContent>
                  {datasets &&
                    datasets.map((dataset) => {
                      const sources = Object.entries(dataset.model.contents)
                        .map(([name, value]) => ({
                          name,
                          source: value,
                        }))
                        .filter((thing) => thing.source.type === "struct") as {
                        name: string;
                        source: StructDef;
                      }[];
                      return (
                        <div key={dataset.id}>
                          <FieldButton
                            icon={<ActionIcon action="open-directory" color="other" />}
                            name={dataset.name}
                            color="other"
                          />
                          <ListNest>
                            {sources.map((entry) => {
                              return (
                                <FieldButton
                                  key={entry.name}
                                  icon={
                                    <ActionIcon action="analysis" color="dimension" />
                                  }
                                  onClick={() => {
                                    setDatasetSource(dataset, entry.name);
                                  }}
                                  name={entry.name}
                                  color="dimension"
                                />
                              );
                            })}
                          </ListNest>
                        </div>
                      );
                    })}
                </PageContent>
              )}
              <ErrorMessage error={error} />
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
  align-items: center;
`;

const ChannelTop = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
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

const Page = styled(Content)`
  margin-top: 10px;
  height: unset;
`;

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
