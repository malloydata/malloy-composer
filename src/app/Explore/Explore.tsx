/*
 * Copyright 2023 Google LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {AppInfo, ModelInfo} from '../../types';
import {useDatasets} from '../data/use_datasets';
import {EmptyMessage, PageContent} from '../CommonElements';
import {ChannelButton} from '../ChannelButton';
import {ErrorMessage} from '../ErrorMessage';
import {HotKeys} from 'react-hotkeys';
import {
  ExploreQueryEditor,
  useQueryBuilder,
  useRunQuery,
} from '@malloydata/query-composer';
import {compileQuery, getSourceNameForQuery} from '../../core/compile';
import {COLORS} from '../colors';
import {MalloyLogo} from '../MalloyLogo';
import {MarkdownDocument} from '../MarkdownDocument';
import {SourceDef} from '@malloydata/malloy';
import {useSearchParams, useParams} from 'react-router-dom';
import {snakeToTitle} from '../utils';
import {runQuery as runQueryExt} from '../data/run_query';
import {useApps} from '../data/use_apps';
import {Apps} from '../Apps';
import {LoadingSpinner} from '../Spinner';
import {useTopValues} from '../data/use_top_values';

const MALLOY_DOCS = 'https://malloydata.github.io/documentation/';

const KEY_MAP = {
  REMOVE_FIELDS: 'command+k',
  RUN_QUERY: 'command+enter',
};

export const Explore: React.FC = () => {
  const config = useApps();
  const {appId} = useParams();
  const onlyDefaultDataset =
    config && config.apps && config.apps[0]?.id === undefined;
  const app = onlyDefaultDataset
    ? config.apps[0]
    : config?.apps?.find(app => app.id === appId);
  const appInfo = useDatasets(app);

  // URL Parameter values
  const [urlParams, setParams] = useSearchParams();
  const sourceName = urlParams.get('source') || undefined;
  const model = urlParams.get('model');
  const name = urlParams.get('name');
  const query = urlParams.get('query');
  const source = urlParams.get('source');
  const page = urlParams.get('page');
  const run = urlParams.get('run');

  // Malloy Data Structures
  const modelInfo = appInfo?.models.find(
    modelInfo => modelInfo.id === urlParams.get('model')
  );
  const modelDef = modelInfo?.model;
  const sourceDef =
    sourceName && modelDef
      ? (modelDef.contents[sourceName] as SourceDef)
      : undefined;

  const [loading, setLoading] = useState(0);

  useEffect(() => {
    document.title = appInfo?.title || 'Malloy Composer';
  }, [appInfo?.title]);

  const updateQueryInURL = useCallback(
    ({run, query: newQuery}: {run: boolean; query: string | undefined}) => {
      const oldQuery = urlParams.get('query') || undefined;
      if (oldQuery === newQuery) {
        return;
      }
      if (newQuery === undefined) {
        urlParams.delete('query');
      } else {
        urlParams.set('query', newQuery);
        urlParams.delete('name');
      }
      if (run) {
        urlParams.set('run', 'true');
      } else {
        urlParams.delete('run');
      }
      setParams(urlParams);
    },
    [setParams, urlParams]
  );

  const modelPath =
    modelInfo && app
      ? new URL(modelInfo?.path, new URL(app.path, window.location.href))
          .pathname
      : undefined;

  const {queryMalloy, queryName, queryModifiers, querySummary} =
    useQueryBuilder(modelDef, sourceName, modelPath, updateQueryInURL);

  const {error, result, runQuery, reset, isRunning} = useRunQuery(
    modelDef,
    modelPath,
    runQueryExt
  );

  useEffect(() => {
    if (loading > 0) {
      reset();
    }
  }, [reset, loading]);

  let section = urlParams.get('page') || 'datasets';
  if (onlyDefaultDataset && section === 'datasets') {
    section = 'about';
  }
  const setSection = (section: string) => {
    urlParams.set('page', section);
    if (section !== 'query') {
      urlParams.delete('query');
      urlParams.delete('run');
      urlParams.delete('name');
      queryModifiers.clearQuery(true);
    }
    setParams(urlParams);
  };

  const setDatasetSource = (
    modelInfo: ModelInfo,
    sourceName: string,
    fromURL = false
  ) => {
    if (!fromURL) {
      urlParams.set('source', sourceName);
      urlParams.set('model', modelInfo.id);
      urlParams.set('page', 'query');
      urlParams.delete('query');
      urlParams.delete('run');
      urlParams.delete('name');
      queryModifiers.clearQuery(true);
      setParams(urlParams);
    }
  };

  useEffect(() => {
    const loadDataset = async () => {
      if (model && (query || source) && appInfo) {
        const newModelInfo = appInfo.models.find(
          modelInfo => modelInfo.id === model
        );
        if (newModelInfo === undefined) {
          throw new Error('Bad model');
        }
        try {
          setLoading(loading => ++loading);
          if (query) {
            if (page !== 'query') return;
            const compiledQuery = await compileQuery(newModelInfo.model, query);
            queryModifiers.setQuery(compiledQuery, true);
            if (run === 'true' && page === 'query') {
              runQuery(query, name || 'unnamed');
            }
          } else {
            urlParams.delete('query');
            urlParams.delete('run');
            urlParams.delete('name');
            queryModifiers.clearQuery(true);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        } finally {
          setLoading(loading => --loading);
        }
      } else if (appInfo && !modelInfo && !page) {
        urlParams.set('page', 'about');
        setParams(urlParams, {replace: true});
      }
    };
    loadDataset();
  }, [
    urlParams,
    appInfo,
    modelInfo,
    queryModifiers,
    setParams,
    runQuery,
    model,
    query,
    source,
    page,
    run,
    name,
  ]);

  const findModelByMarkdownId = (model: string) => {
    if (!app || !appInfo) {
      return undefined;
    }
    const urlBase = window.location.href;
    const targetHref = new URL(model, new URL(app.path, urlBase)).href;
    const modelInfo = appInfo.models.find(
      modelInfo =>
        new URL(modelInfo.path, new URL(app.path, urlBase)).href === targetHref
    );
    if (modelInfo === undefined) {
      throw new Error(
        `Bad model '${model}' referenced in Markdown link. Options are: ${appInfo.models
          .map(modelInfo => `'${modelInfo.path}'`)
          .join(', ')}.`
      );
    }
    return modelInfo;
  };

  const loadSourceLink = async (model: string, source: string) => {
    try {
      setLoading(loading => ++loading);
      const modelInfo = findModelByMarkdownId(model);
      if (!modelInfo) {
        return;
      }
      setDatasetSource(modelInfo, source);
      urlParams.set('page', 'query');
      setParams(urlParams, {replace: true});
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(loading => --loading);
    }
  };

  const loadQueryLink = async (model: string, query: string, name?: string) => {
    try {
      setLoading(loading => ++loading);
      const modelInfo = findModelByMarkdownId(model);
      if (!modelInfo) {
        return;
      }
      const sourceName = await getSourceNameForQuery(modelInfo.model, query);
      urlParams.set('model', modelInfo.id);
      urlParams.set('source', sourceName);
      urlParams.set('query', query);
      urlParams.set('page', 'query');
      urlParams.set('run', 'true');
      if (name) {
        urlParams.set('name', name);
      } else {
        urlParams.delete('name');
      }
      setParams(urlParams);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(loading => --loading);
    }
  };

  const runQueryAction = () => {
    runQuery(queryMalloy.notebook, queryName);
  };

  const handlers = {
    REMOVE_FIELDS: () => queryModifiers.clearQuery(),
    RUN_QUERY: runQueryAction,
  };

  const topValues = useTopValues(modelDef, modelPath, sourceDef);
  if (loading || (appId && !appInfo)) {
    section = 'loading';
  }

  // eslint-disable-next-line no-console
  console.log({
    model,
    modelPath,
    source,
  });

  return (
    <Main handlers={handlers} keyMap={KEY_MAP}>
      <Header>
        <HeaderLeft>
          <MalloyLogo />
          {appInfo && (
            <span>
              {appInfo.title || 'Malloy'}
              {sourceName && section === 'query' && (
                <span>
                  {' ›'} {snakeToTitle(sourceName)}
                  {(name || queryName) && section === 'query' && (
                    <span>
                      {' ›'} {name || snakeToTitle(queryName)}
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
              {!onlyDefaultDataset && (
                <ChannelButton
                  onClick={() => setSection('datasets')}
                  text="Home"
                  icon="home"
                  selected={section === 'datasets'}
                  disabled={config === undefined}
                ></ChannelButton>
              )}
              <ChannelButton
                onClick={() => setSection('about')}
                text="Dataset"
                icon="about"
                selected={section === 'about'}
                disabled={appInfo === undefined}
              ></ChannelButton>
              <ChannelButton
                onClick={() => setSection('query')}
                text="Query"
                icon="query"
                selected={section === 'query'}
                disabled={source === undefined}
              ></ChannelButton>
            </ChannelTop>
            <ChannelBottom>
              <ChannelButton
                onClick={() => window.open(MALLOY_DOCS, '_blank')}
                text="Docs"
                icon="help"
                selected={false}
                disabled={false}
              />
            </ChannelBottom>
          </Channel>
          <Page>
            <PageContainer>
              {section === 'query' && sourceDef && modelDef && modelPath && (
                <ExploreQueryEditor
                  model={modelDef}
                  modelPath={modelPath}
                  source={sourceDef}
                  queryModifiers={queryModifiers}
                  topValues={topValues}
                  queryName={queryName}
                  querySummary={querySummary}
                  queryMalloy={queryMalloy}
                  result={result}
                  runQuery={runQueryAction}
                  isRunning={isRunning}
                />
              )}
              {section === 'about' && (
                <PageContent>
                  {appInfo && (
                    <MarkdownDocument
                      content={appInfo.readme || generateReadme(appInfo)}
                      loadQueryLink={loadQueryLink}
                      loadSource={loadSourceLink}
                    />
                  )}
                </PageContent>
              )}
              {section === 'datasets' && config && (
                <PageContent>
                  <Apps />
                </PageContent>
              )}
              <ErrorMessage error={error} />
              {section === 'loading' && (
                <EmptyMessage>
                  <LoadingSpinner text="Loading Data..." />
                </EmptyMessage>
              )}
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
  justify-content: center;
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

function generateReadme(appInfo: AppInfo) {
  let readme = '';
  const title = appInfo.title || 'Malloy';
  readme += `# ${title}\n\n`;
  readme += appInfo.title
    ? `Welcome to the Malloy Composer for the ${appInfo.title} dataset!\n\n`
    : `Welcome to the Malloy Composer. See below for a list of available sources.\n\n`;
  readme += '## Sources\n\n';
  for (const modelInfo of appInfo.models) {
    for (const source of modelInfo.sources) {
      readme += `
<!-- malloy-source
title="${snakeToTitle(source.sourceName)}"
description="${source.description}"
source="${source.sourceName}"
model="${modelInfo.path}"
-->
      `;
    }
  }

  return readme;
}
