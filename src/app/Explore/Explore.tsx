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
import { ModelInfo, RendererName } from "../../types";
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
import { useSearchParams, useParams } from "react-router-dom";
import { DataStyles } from "@malloydata/render";
import { snakeToTitle } from "../utils";
import { useApps } from "../data/use_apps";
import { ReactComponent as ViewIcon } from "../assets/img/source_view.svg";

const KEY_MAP = {
  REMOVE_FIELDS: "command+k",
  RUN_QUERY: "command+enter",
};

export const Explore: React.FC = () => {
  const config = useApps();
  const { appId } = useParams();
  const app = config?.apps?.find((app) => app.id === appId);
  const appInfo = useDatasets(app);
  const [urlParams, _setParams] = useSearchParams();
  const modelInfo = appInfo?.models.find(
    (modelInfo) => modelInfo.id === urlParams.get("model")
  );
  const sourceName = urlParams.get("source");
  const params = useRef("");

  const setParams = (
    newUrlParams: URLSearchParams,
    options?: { replace: boolean }
  ) => {
    params.current = newUrlParams.toString();
    _setParams(newUrlParams, options);
  };

  useEffect(() => {
    if (appInfo) {
      document.title = appInfo.title || "Malloy Composer";
    }
  }, [appInfo]);

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

  const model = modelInfo?.model;
  const modelPath =
    modelInfo && app
      ? new URL(
          modelInfo?.modelPath,
          new URL(app.configPath, window.location.href)
        ).pathname
      : undefined;
  const source =
    model && sourceName ? (model.contents[sourceName] as StructDef) : undefined;

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
  } = useQueryBuilder(model, modelPath, updateQueryInURL, modelInfo?.styles);

  const setDatasetSource = (
    modelInfo: ModelInfo,
    sourceName: string,
    fromURL = false
  ) => {
    registerNewSource(modelInfo.model.contents[sourceName] as StructDef);
    if (!fromURL) {
      urlParams.set("source", sourceName);
      urlParams.set("model", modelInfo.id);
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
      if (model && (query || source) && appInfo) {
        if (urlParams.toString() === params.current) return;
        const newModelInfo = appInfo.models.find(
          (modelInfo) => modelInfo.id === model
        );
        if (newModelInfo === undefined) {
          throw new Error("Bad model");
        }
        const sourceName =
          source || (await getSourceNameForQuery(newModelInfo.model, query));
        registerNewSource(newModelInfo.model.contents[sourceName] as StructDef);
        if (query) {
          if (page !== "query") return;
          clearResult();
          const compiledQuery = await compileQuery(newModelInfo.model, query);
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
      } else if (appInfo && !modelInfo && !page) {
        urlParams.set("page", "about");
        setParams(urlParams, { replace: true });
      }
    };
    loadDataset();
  }, [urlParams, appInfo]);

  const loadQueryLink = async (
    model: string,
    query: string,
    name?: string,
    renderer?: string
  ) => {
    const urlBase = window.location.href;
    const targetHref = new URL(model, new URL(app.configPath, urlBase)).href;
    const newModelInfo = appInfo.models.find(
      (modelInfo) =>
        new URL(modelInfo.modelPath, new URL(app.configPath, urlBase)).href ===
        targetHref
    );
    if (newModelInfo === undefined) {
      throw new Error("Bad model");
    }
    const sourceName = await getSourceNameForQuery(newModelInfo.model, query);
    urlParams.set("model", newModelInfo.id);
    urlParams.set("source", sourceName);
    urlParams.set("query", query);
    urlParams.set("page", "query");
    urlParams.set("run", "true");
    urlParams.set("name", name);
    registerNewSource(newModelInfo.model.contents[sourceName] as StructDef);
    const compiledQuery = await compileQuery(newModelInfo.model, query);
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

  const topValues = useTopValues(model, modelPath, source);

  return (
    <Main handlers={handlers} keyMap={KEY_MAP}>
      <Header>
        <HeaderLeft>
          <MalloyLogo />
          {appInfo && (
            <span>
              {appInfo.title}
              {sourceName && (section === "query" || section === "sources") && (
                <span>
                  {" ›"} {snakeToTitle(sourceName)}
                  {(urlParams.get("name") || queryName) && section === "query" && (
                    <span>
                      {" ›"} {urlParams.get("name") || snakeToTitle(queryName)}
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
                disabled={appInfo?.readme === undefined}
              ></ChannelButton>
              <ChannelButton
                onClick={() => setSection("query")}
                text="Query"
                icon="query"
                selected={section === "query"}
                disabled={source === undefined}
              ></ChannelButton>
              <ChannelButton
                onClick={() => setSection("sources")}
                text="Sources"
                icon="source"
                selected={section === "sources"}
                disabled={appInfo === undefined}
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
                  {appInfo && (
                    <MarkdownDocument
                      content={
                        appInfo.readme ||
                        "# No Readme\nThis project has no readme"
                      }
                      loadQueryLink={loadQueryLink}
                    />
                  )}
                </PageContent>
              )}
              {section === "sources" && (
                <PageContent>
                  <DatasetsWrapperOuter>
                    <DatasetsWrapperInner>
                      <Head1>Sources</Head1>
                      {appInfo &&
                        appInfo.models.flatMap((modelInfo) => {
                          const sources = modelInfo.sources;
                          return sources.map((entry) => (
                            <SourceLink
                              key={modelInfo.id + "/" + entry.sourceName}
                              onClick={() => {
                                setDatasetSource(modelInfo, entry.sourceName);
                              }}
                            >
                              <SourceLinkTitleRow>
                                {entry.title}
                                <ViewIcon width="80" height="22" />
                              </SourceLinkTitleRow>
                              <SourceLinkDescription>
                                {entry.description}
                              </SourceLinkDescription>
                            </SourceLink>
                          ));
                        })}
                    </DatasetsWrapperInner>
                  </DatasetsWrapperOuter>
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

const SourceLink = styled.div`
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  padding: 10px 20px;
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 15px;
  color: #595959;

  &:hover {
    background-color: #f0f6ff;
    border-color: #4285f4;
  }
`;

const SourceLinkTitleRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
`;

const SourceLinkDescription = styled.div`
  color: #929292;
  font-size: 14px;
`;

const DatasetsWrapperOuter = styled.div`
  padding: 10px 30px 30px 30px;
  width: 100%;
  font-family: Google Sans;
  overflow-y: auto;
`;

const DatasetsWrapperInner = styled.div`
  max-width: 900px;
`;

const Head1 = styled.h1`
  font-size: 21px;
  font-weight: 500;
  margin-block-end: 8px;
  margin-block-start: 16px;
`;
