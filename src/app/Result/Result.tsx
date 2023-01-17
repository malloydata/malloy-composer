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
import { useEffect, useRef, useState } from "react";
import * as malloy from "@malloydata/malloy";
import * as render from "@malloydata/render";
import styled from "styled-components";
import { LoadingSpinner } from "../Spinner";
import { usePrevious } from "../hooks";
import {
  copyToClipboard,
  downloadFile,
  highlightPre,
  indentCode,
  notUndefined,
  wrapHtml,
} from "../utils";
import { compileFilter, compileQueryToSQL } from "../../core/compile";
import { DownloadMenu } from "../DownloadMenu";
import { DOMElement } from "../DOMElement";
import { PageContent, PageHeader } from "../CommonElements";
import { SelectDropdown } from "../SelectDropdown";
import { ActionIcon } from "../ActionIcon";

interface ResultProps {
  model: malloy.ModelDef;
  source: malloy.StructDef;
  result?: malloy.Result;
  dataStyles: render.DataStyles;
  malloy: {
    source: string;
    model: string;
    markdown: string;
    isRunnable: boolean;
  };
  onDrill: (filters: malloy.FilterExpression[]) => void;
  isRunning: boolean;
}

export const Result: React.FC<ResultProps> = ({
  model,
  source,
  result,
  dataStyles,
  malloy,
  onDrill,
  isRunning,
}) => {
  const [html, setHTML] = useState<HTMLElement>();
  const [highlightedSourceMalloy, setHighlightedSourceMalloy] =
    useState<HTMLElement>();
  const [highlightedModelMalloy, setHighlightedModelMalloy] =
    useState<HTMLElement>();
  const [highlightedMarkdownMalloy, setHighlightedMarkdownMalloy] =
    useState<HTMLElement>();
  const [sql, setSQL] = useState<HTMLElement>();
  const [view, setView] = useState<"sql" | "malloy" | "html">("html");
  const [copiedMalloy, setCopiedMalloy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [malloyType, setMalloyType] = useState("source");
  const [displaying, setDisplaying] = useState(false);
  const resultId = useRef(0);
  const previousResult = usePrevious(result);
  const previousDataStyles = usePrevious(dataStyles);

  useEffect(() => {
    highlightPre(malloy.markdown, "md")
      .then(setHighlightedMarkdownMalloy)
      // eslint-disable-next-line no-console
      .catch(console.log);
    highlightPre(indentCode(malloy.source), "malloy")
      .then(setHighlightedSourceMalloy)
      // eslint-disable-next-line no-console
      .catch(console.log);
    highlightPre(malloy.model, "malloy")
      .then(setHighlightedModelMalloy)
      // eslint-disable-next-line no-console
      .catch(console.log);
  }, [malloy]);

  useEffect(() => {
    let canceled = false;
    const updateSQL = async () => {
      let sql = result?.sql;
      if (sql === undefined) {
        if (
          model === undefined ||
          malloy.model === undefined ||
          malloy.model === "" ||
          !malloy.isRunnable
        ) {
          return;
        }
        try {
          sql = await compileQueryToSQL(model, malloy.model);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
      if (sql === undefined) return;
      const highlighted = await highlightPre(sql, "sql");
      if (canceled) return;
      setSQL(highlighted);
    };
    updateSQL();
    return () => {
      canceled = true;
    };
  }, [result, malloy, model]);

  useEffect(() => {
    if (
      result === previousResult &&
      JSON.stringify(dataStyles) === JSON.stringify(previousDataStyles)
    ) {
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
      // eslint-disable-next-line no-console
      console.log(result.sql);
      const currentResultId = ++resultId.current;
      const rendered = await new render.HTMLView(document).render(result.data, {
        dataStyles,
        isDrillingEnabled: true,
        onDrill: (_1, _2, drillFilters) => {
          Promise.all(
            drillFilters.map((filter) =>
              compileFilter(source, filter).catch((error) => {
                // eslint-disable-next-line no-console
                console.log(error);
                return undefined;
              })
            )
          ).then((filters) => {
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
  }, [result, dataStyles, previousDataStyles, previousResult]);

  return (
    <OuterDiv>
      <ResultHeader>
        <ResultHeaderSection>
          <ViewTab
            onClick={() => setView("malloy")}
            selected={view === "malloy"}
          >
            Malloy
          </ViewTab>
          <ViewTab onClick={() => setView("sql")} selected={view === "sql"}>
            SQL
          </ViewTab>
          <ViewTab onClick={() => setView("html")} selected={view === "html"}>
            Results
          </ViewTab>
        </ResultHeaderSection>
        <ResultHeaderSection>
          <DownloadMenu
            disabled={!result || html === undefined || rendering}
            onDownloadHTML={(newTab: boolean) =>
              downloadFile(
                html ? wrapHtml(html.outerHTML, "Malloy Download") : "",
                "text/html",
                "result.html",
                newTab
              )
            }
            onDownloadJSON={(newTab: boolean) =>
              downloadFile(
                JSON.stringify(result?.data.toObject() || {}, null, 2),
                "application/json",
                "result.json",
                newTab
              )
            }
          />
        </ResultHeaderSection>
      </ResultHeader>
      <ContentDiv>
        {isRunning && view !== "malloy" && <LoadingSpinner text="Running" />}
        {view === "html" && (
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
        {sql !== undefined && view === "sql" && (
          <PreWrapper>{sql && <DOMElement element={sql} />}</PreWrapper>
        )}
        {view === "malloy" && (
          <PreWrapper
            style={{ marginLeft: malloyType === "source" ? "-2ch" : "" }}
          >
            {malloyType === "source" && highlightedSourceMalloy && (
              <DOMElement element={highlightedSourceMalloy} />
            )}
            {malloyType === "model" && highlightedModelMalloy && (
              <DOMElement element={highlightedModelMalloy} />
            )}
            {malloyType === "markdown" && highlightedMarkdownMalloy && (
              <DOMElement element={highlightedMarkdownMalloy} />
            )}
            <MalloyTypeSwitcher>
              <ActionIcon
                action="copy"
                onClick={() => {
                  let code = malloy[malloyType];
                  if (malloyType === "source") {
                    code = indentCode(code);
                  }
                  copyToClipboard(code);
                  setCopiedMalloy(true);
                }}
                color={copiedMalloy ? "other" : "dimension"}
              />
              <SelectDropdown
                value={malloyType}
                onChange={(type) => {
                  setMalloyType(type);
                  setCopiedMalloy(false);
                }}
                options={[
                  { value: "source", label: "Source" },
                  { value: "model", label: "Model" },
                  { value: "markdown", label: "Markdown" },
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
  background-color: white;
  border-radius: 4px;
  width: 140px;
  justify-content: flex-end;
  align-items: center;
`;

const ResultWrapper = styled.div`
  font-size: 14px;
  font-family: "Roboto Mono";
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
  font-family: "Google Sans";
  border-top: 1px solid transparent;
  font-size: 11pt;
  ${({ selected }) =>
    `border-bottom: 1px solid ${selected ? "#4285F4" : "transparent"}`}
`;

const PreWrapper = styled.div`
  padding: 0 15px;
  font-family: "Roboto Mono";
  font-size: 14px;
  position: relative;
  width: 100%;
`;

const ResultHeaderSection = styled.div`
  display: flex;
  align-items: center;
  font-size: 11pt;
  color: #4d4d4d;
`;
