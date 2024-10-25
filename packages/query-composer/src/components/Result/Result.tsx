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
import {useContext, useEffect, useRef, useState} from 'react';
import * as malloy from '@malloydata/malloy';
import * as render from '@malloydata/render';
import '@malloydata/render/webcomponent';
import styled from 'styled-components';
import {LoadingSpinner} from '../Spinner';
import {usePrevious} from '../../hooks';
import {
  copyToClipboard,
  downloadFile,
  indentCode,
  notUndefined,
  wrapHtml,
} from '../../utils';
import {DownloadMenu} from '../DownloadMenu';
import {DOMElement} from '../DOMElement';
import {PageContent, PageHeader} from '../CommonElements';
import {SelectDropdown} from '../SelectDropdown';
import {ActionIcon} from '../ActionIcon';
import {ComposerOptionsContext} from '../ExploreQueryEditor/ExploreQueryEditor';
import {highlightPre} from '../../highlight';

type MalloyType = 'notebook' | 'model' | 'markdown' | 'source';

interface ResultProps {
  model: malloy.ModelDef;
  source: malloy.StructDef;
  result?: malloy.Result;
  malloy: {
    source: string;
    model: string;
    markdown: string;
    notebook: string;
    isRunnable: boolean;
  };
  onDrill: (filters: malloy.FilterCondition[]) => void;
  isRunning: boolean;
}

export const Result: React.FC<ResultProps> = ({
  model,
  source,
  result,
  malloy,
  onDrill,
  isRunning,
}) => {
  const {dummyCompiler} = useContext(ComposerOptionsContext);
  const [html, setHTML] = useState<HTMLElement>();
  const [highlightedSourceMalloy, setHighlightedSourceMalloy] =
    useState<HTMLElement>();
  const [highlightedModelMalloy, setHighlightedModelMalloy] =
    useState<HTMLElement>();
  const [highlightedMarkdownMalloy, setHighlightedMarkdownMalloy] =
    useState<HTMLElement>();
  const [highlightedNotebookMalloy, setHighlightedNotebookMalloy] =
    useState<HTMLElement>();
  const [sql, setSQL] = useState<HTMLElement>();
  const [view, setView] = useState<'sql' | 'malloy' | 'html'>('html');
  const [copiedMalloy, setCopiedMalloy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [malloyType, setMalloyType] = useState<MalloyType>('notebook');
  const [displaying, setDisplaying] = useState(false);
  const resultId = useRef(0);
  const previousResult = usePrevious(result);

  useEffect(() => {
    highlightPre(malloy.markdown, 'md')
      .then(setHighlightedMarkdownMalloy)
      .catch(console.error);
    highlightPre(indentCode(malloy.source), 'malloy')
      .then(setHighlightedSourceMalloy)
      .catch(console.error);
    highlightPre(malloy.model, 'malloy')
      .then(setHighlightedModelMalloy)
      .catch(console.error);
    highlightPre(indentCode(malloy.notebook), 'malloy')
      .then(setHighlightedNotebookMalloy)
      .catch(console.error);
  }, [malloy]);

  useEffect(() => {
    let canceled = false;
    const updateSQL = async () => {
      let sql = result?.sql;
      if (sql === undefined) {
        if (
          model === undefined ||
          malloy.model === undefined ||
          malloy.model === '' ||
          !malloy.isRunnable
        ) {
          return;
        }
        try {
          sql = await dummyCompiler.compileQueryToSQL(model, malloy.model);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
      if (sql === undefined) return;
      const highlighted = await highlightPre(sql, 'sql');
      if (canceled) return;
      setSQL(highlighted);
    };
    updateSQL();
    return () => {
      canceled = true;
    };
  }, [result, malloy, model, dummyCompiler]);

  useEffect(() => {
    if (result === previousResult) {
      return;
    }
    setRendering(false);
    setDisplaying(false);
    setHTML(undefined);
    if (result === undefined) {
      return;
    }
    setTimeout(async () => {
      setRendering(true);
      const currentResultId = ++resultId.current;
      const rendered = await new render.HTMLView(document).render(result, {
        dataStyles: {},
        isDrillingEnabled: true,
        onDrill: (_1, _2, drillFilters) => {
          Promise.all(
            drillFilters.map(filter =>
              dummyCompiler.compileFilter(source, filter).catch(error => {
                console.error(error);
                return undefined;
              })
            )
          ).then(filters => {
            const validFilters = filters.filter(notUndefined);
            if (validFilters.length > 0) {
              onDrill(validFilters);
            }
          });
        },
      });
      setTimeout(() => {
        if (resultId.current !== currentResultId) {
          return;
        }
        setRendering(false);
        setDisplaying(true);
        setTimeout(() => {
          if (resultId.current !== currentResultId) {
            return;
          }
          setHTML(rendered);
        }, 0);
      }, 0);
    });
  }, [result, previousResult, dummyCompiler, onDrill, source]);

  return (
    <OuterDiv>
      <ResultHeader>
        <ResultHeaderSection>
          <ViewTab
            onClick={() => setView('malloy')}
            selected={view === 'malloy'}
          >
            Malloy
          </ViewTab>
          <ViewTab onClick={() => setView('sql')} selected={view === 'sql'}>
            SQL
          </ViewTab>
          <ViewTab onClick={() => setView('html')} selected={view === 'html'}>
            Results
          </ViewTab>
        </ResultHeaderSection>
        <ResultHeaderSection>
          <DownloadMenu
            disabled={!result || html === undefined || rendering}
            onDownloadHTML={(newTab: boolean) =>
              downloadFile(
                html ? wrapHtml(html.outerHTML, 'Malloy Download') : '',
                'text/html',
                'result.html',
                newTab
              )
            }
            onDownloadJSON={(newTab: boolean) =>
              downloadFile(
                JSON.stringify(result?.data.toObject() || {}, null, 2),
                'application/json',
                'result.json',
                newTab
              )
            }
          />
        </ResultHeaderSection>
      </ResultHeader>
      <ContentDiv>
        {isRunning && view !== 'malloy' && <LoadingSpinner text="Running" />}
        {view === 'html' && (
          <>
            {result !== undefined && rendering && (
              <LoadingSpinner text="Rendering" />
            )}
            {!html && displaying && <LoadingSpinner text="Displaying" />}
            {html && displaying && (
              <ResultWrapper>
                <DOMElement element={html} />
              </ResultWrapper>
            )}
          </>
        )}
        {sql !== undefined && view === 'sql' && (
          <PreWrapper>{sql && <DOMElement element={sql} />}</PreWrapper>
        )}
        {view === 'malloy' && (
          <PreWrapper
            style={{marginLeft: malloyType === 'source' ? '-2ch' : ''}}
          >
            {malloyType === 'source' && highlightedSourceMalloy && (
              <DOMElement element={highlightedSourceMalloy} />
            )}
            {malloyType === 'model' && highlightedModelMalloy && (
              <DOMElement element={highlightedModelMalloy} />
            )}
            {malloyType === 'markdown' && highlightedMarkdownMalloy && (
              <DOMElement element={highlightedMarkdownMalloy} />
            )}
            {malloyType === 'notebook' && highlightedNotebookMalloy && (
              <DOMElement element={highlightedNotebookMalloy} />
            )}{' '}
            <MalloyTypeSwitcher>
              <ActionIcon
                action="copy"
                onClick={() => {
                  let code = malloy[malloyType];
                  if (malloyType === 'source') {
                    code = indentCode(code);
                  }
                  copyToClipboard(code);
                  setCopiedMalloy(true);
                }}
                color={copiedMalloy ? 'other' : 'dimension'}
              />
              <SelectDropdown
                value={malloyType}
                onChange={type => {
                  setMalloyType(type as MalloyType);
                  setCopiedMalloy(false);
                }}
                options={[
                  {value: 'notebook', label: 'Notebook'},
                  {value: 'source', label: 'Source'},
                  {value: 'model', label: 'Model'},
                  {value: 'markdown', label: 'Markdown'},
                ]}
              />
            </MalloyTypeSwitcher>
          </PreWrapper>
        )}
      </ContentDiv>
    </OuterDiv>
  );
};

const MalloyTypeSwitcher = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: row;
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--malloy-composer-form-background, white);
  border-radius: 4px;
  width: 140px;
  justify-content: flex-end;
  align-items: center;
`;

const ResultWrapper = styled.div`
  font-size: var(--malloy-composer-fontSize, 14px);
  font-family: var(--malloy-composer-code-fontFamily, monospace);
`;

const OuterDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
`;

const ContentDiv = styled(PageContent)`
  padding: 20px;
  overflow: auto;
  width: auto;
`;

const ResultHeader = styled(PageHeader)`
  gap: 10px;
  justify-content: space-between;
  padding: 0px 20px;
  flex-direction: row;
  width: auto;
`;

const ViewTab = styled.div<{
  selected: boolean;
}>`
  padding: 8px;
  cursor: pointer;
  text-transform: uppercase;
  color: #939393;
  font-family: Arial, Helvetica, sans-serif;
  border-top: 1px solid transparent;
  font-size: 11pt;
  ${({selected}) =>
    `border-bottom: 1px solid ${selected ? '#4285F4' : 'transparent'}`}
`;

const PreWrapper = styled.div`
  padding: 0 15px;
  font-family: var(--malloy-composer-code-fontFamily, monospace);
  font-size: var(--malloy-composer-fontSize, 14px);
  position: relative;
  width: 100%;
`;

const ResultHeaderSection = styled.div`
  display: flex;
  align-items: center;
  font-size: 11pt;
  color: #4d4d4d;
`;
