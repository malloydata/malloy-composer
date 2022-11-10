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

import { useEffect, useRef } from "react";
import styled from "styled-components";
import { Dataset, RendererName } from "../../types";
import { useDatasets } from "../data/use_datasets";
import { PageContent } from "../CommonElements";
import { ChannelButton } from "../ChannelButton";
import { ErrorMessage } from "../ErrorMessage";
import { HotKeys } from "react-hotkeys";
import { useTopValues } from "../data/use_top_values";
import { useQueryBuilder } from "../hooks";
import { ExploreQueryEditor } from "../ExploreQueryEditor";
import { compileQuery, getSourceNameForQuery } from "../../core/compile";
import { COLORS } from "../colors";
import { MalloyLogo } from "../MalloyLogo";
import { MarkdownDocument } from "../MarkdownDocument";
import { StructDef } from "@malloydata/malloy";
import { useSearchParams } from "react-router-dom";
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
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(" ");
}

export const Explore: React.FC = () => {
  const datasets = useDatasets();
  const [urlParams, _setParams] = useSearchParams();
  const dataset = datasets?.find(
    (dataset) => dataset.name === urlParams.get("model")
  );
  const sourceName = urlParams.get("source");
  const params = useRef("");

  const setParams = (
    params: URLSearchParams,
    options?: { replace: boolean }
  ) => {
    params.current = params.toString();
    _setParams(params, options);
  };

  const updateQueryInURL = ({
    run,
    query: newQuery,
    styles: newStylesJSON,
  }: {
    run: boolean;
    query: string | undefined;
    styles: DataStyles;
  }) => {
    const oldQuery = urlParams.get("query") || undefined;
    let newStyles = JSON.stringify(newStylesJSON);
    if (newStyles === "{}") newStyles = undefined;
    const oldStyles = urlParams.get("styles") || undefined;
    if (oldQuery === newQuery && oldStyles === newStyles) {
      return;
    }
    if (newQuery === undefined) {
      urlParams.delete("query");
    } else {
      urlParams.set("query", newQuery);
      urlParams.delete("name");
    }
    if (run) {
      urlParams.set("run", "true");
    } else {
      urlParams.delete("run");
    }
    if (newStyles === undefined) {
      urlParams.delete("styles");
    } else {
      urlParams.set("styles", newStyles);
    }
    setParams(urlParams);
  };

  const section = urlParams.get("page") || "query";
  const setSection = (section: string) => {
    urlParams.set("page", section);
    if (section !== "query") {
      urlParams.delete("query");
      urlParams.delete("run");
      urlParams.delete("name");
      urlParams.delete("styles");
    }
    setParams(urlParams);
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
  } = useQueryBuilder(
    dataset?.model,
    dataset?.modelPath,
    sourceName,
    updateQueryInURL,
    dataset?.styles
  );

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
      urlParams.set("source", sourceName);
      urlParams.set("model", dataset.name);
      urlParams.set("page", "query");
      urlParams.delete("query");
      urlParams.delete("run");
      urlParams.delete("name");
      urlParams.delete("styles");
      clearQuery(true);
      setParams(urlParams);
    }
  };

  useEffect(() => {
    const loadDataset = async () => {
      const model = urlParams.get("model");
      const query = urlParams.get("query")?.replace(/->\s*{\n}/g, "");
      const source = urlParams.get("source");
      const styles = urlParams.get("styles");
      const page = urlParams.get("page");
      if (model && (query || source) && datasets) {
        if (urlParams.toString() === params.current) return;
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
          if (urlParams.has("run") && urlParams.get("page") === "query") {
            runQuery();
          }
        } else {
          urlParams.delete("query");
          urlParams.delete("run");
          urlParams.delete("name");
          urlParams.delete("styles");
          clearQuery(true);
        }
        params.current = urlParams.toString();
      } else if (datasets && !dataset) {
        const newDataset = datasets[0];
        urlParams.set("model", newDataset.name);
        if (newDataset.readme) {
          urlParams.set("page", "about");
        }
        setParams(urlParams);
      }
    };
    loadDataset();
  }, [urlParams, datasets]);

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
    urlParams.set("model", model);
    urlParams.set("source", sourceName);
    urlParams.set("query", query);
    urlParams.set("page", "query");
    urlParams.set("run", "true");
    urlParams.set("name", name);
    registerNewSource(newDataset.model.contents[sourceName] as StructDef);
    const compiledQuery = await compileQuery(newDataset.model, query);
    queryModifiers.setQuery(compiledQuery, true);
    if (renderer) {
      const styles = queryModifiers.setDataStyle(
        compiledQuery.name,
        renderer as RendererName,
        true
      );
      urlParams.delete("renderer");
      urlParams.set("styles", JSON.stringify(styles));
    }
    runQuery();
    setParams(urlParams);
  };

  const runQueryAction = () => {
    runQuery();
    urlParams.set("run", "true");
    setParams(urlParams, { replace: true });
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
          {dataset && (
            <span>
              {dataset.name}
              {sourceName && (section === "query" || section === "sources") && (
                <span>
                  {" ›"} {toTitleCase(sourceName)}
                  {(urlParams.get("name") || queryName) && section === "query" && (
                    <span>
                      {" ›"} {urlParams.get("name") || toTitleCase(queryName)}
                    </span>
                  )}
                </span>
              )}
            </span>
          )}
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
                            icon={
                              <ActionIcon
                                action="open-directory"
                                color="other"
                              />
                            }
                            name={dataset.name}
                            color="other"
                          />
                          <ListNest>
                            {sources.map((entry) => {
                              return (
                                <FieldButton
                                  key={entry.name}
                                  icon={
                                    <ActionIcon
                                      action="analysis"
                                      color="dimension"
                                    />
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
