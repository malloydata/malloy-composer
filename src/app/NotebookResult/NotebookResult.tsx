/*
 * Copyright 2024 Google LLC
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

import { DOMElement } from "../DOMElement";
import * as render from "@malloydata/render";
import * as malloy from "@malloydata/malloy";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../Spinner";
import * as explore from "../../types";

interface NotebookProps {
  app: explore.AppListing;
  notebookPath: string;
  code: string;
}

export const NotebookResult: React.FC<NotebookProps> = ({
  app,
  notebookPath,
  code,
}) => {
  const [runningQuery, setRunningQuery] = useState<boolean>(false);
  const [malloyResult, setMalloyResult] = useState<malloy.Result>();
  const [renderingHtmlResult, setRenderingHtmlResult] =
    useState<boolean>(false);
  const [htmlResult, setHtmlResult] = useState<HTMLElement>();
  // TODO(kjnesbit): handle errors.
  useEffect(() => {
    setTimeout(async () => {
      setRunningQuery(true);
      setRenderingHtmlResult(false);
      const malloyResult = await runQuery(app, code, notebookPath, "queryName");
      setTimeout(() => {
        setMalloyResult(malloyResult);
        setRunningQuery(false);
      }, 0);
    }, 0);
  }, [notebookPath, code]);

  useEffect(() => {
    setTimeout(async () => {
      setRenderingHtmlResult(true);
      setRunningQuery(false);
      const htmlResult = await new render.HTMLView(document).render(
        malloyResult,
        { dataStyles: {}, isDrillingEnabled: false }
      );
      setTimeout(() => {
        setHtmlResult(htmlResult);
        setRenderingHtmlResult(false);
      }, 0);
    }, 0);
  }, [malloyResult]);

  return (
    <>
      {runningQuery && <LoadingSpinner text="Running Query" />}
      {renderingHtmlResult && <LoadingSpinner text="Rendering Result" />}
      {htmlResult && (
        <ResultWrapper>
          <DOMElement element={htmlResult} />
        </ResultWrapper>
      )}
    </>
  );
};

async function runQuery(
  app: explore.AppListing,
  query: string,
  modelPath: string,
  queryName: string
) {
  const raw = await (
    await fetch("api/run_query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app,
        query,
        modelPath,
        queryName,
      }),
    })
  ).json();
  return malloy.Result.fromJSON(raw.result) as malloy.Result;
}

const ResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  margin-right: 20px;
  width: 90%
  font-size: 12px;
  font-family: "Roboto Mono";
`;
