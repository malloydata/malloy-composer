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

import { AppInfo } from "../../types";
import { ReactComponent as RunIcon } from "../assets/img/query_run_wide.svg";
import { ReactComponent as QueryIcon } from "../assets/img/source_query.svg";
import styled from "styled-components";
import { COLORS } from "../colors";
import { snakeToTitle } from "../utils";

interface ModelBrowserProps {
  appInfo: AppInfo;
  loadQueryLink?: (
    model: string,
    query: string,
    name?: string,
    renderer?: string
  ) => void;
  loadSourceLink?: (model: string, source: string) => void;
}

export const ModelBrowser: React.FC<ModelBrowserProps> = ({
  appInfo,
  loadQueryLink,
  loadSourceLink,
}) => {
  return (
    <>
      {appInfo.notebooks.length > 0 && (
        <SectionTitleRow>{"Notebooks"}</SectionTitleRow>
      )}
      <>
        {appInfo.notebooks.map((notebookInfo) => (
          <ModelContainer>
            <NotebookLink>
              <ModelTitleRow>{"Notebook > " + notebookInfo.id}</ModelTitleRow>
              <RunIcon width="80" height="22" />
            </NotebookLink>
          </ModelContainer>
        ))}
      </>
      {appInfo.models.length > 0 && (
        <SectionTitleRow>{"Models"}</SectionTitleRow>
      )}
      <>
        {appInfo.models.map((modelInfo) => (
          <ModelContainer>
            <ModelTitleRow>{"Model > " + modelInfo.id}</ModelTitleRow>
            {modelInfo.sources.map((sourceInfo) => (
              <SourceContainer>
                <SourceLink
                  onClick={() => {
                    loadSourceLink(modelInfo.id, sourceInfo.sourceName);
                  }}
                >
                  <SourceLinkInfo>
                    <SourceLinkTitleRow>
                      {"Source > " + sourceInfo.title}
                    </SourceLinkTitleRow>
                    <SourceLinkDescription>
                      {sourceInfo.description}
                    </SourceLinkDescription>
                  </SourceLinkInfo>
                  <QueryIcon width="80" height="22" />
                </SourceLink>
                {sourceInfo.views.length > 0 && (
                  <QueryContainer>
                    {sourceInfo.views.map((viewInfo) => (
                      <QueryLink
                        onClick={() => {
                          loadQueryLink(
                            modelInfo.id,
                            viewInfo.query,
                            viewInfo.name
                          );
                        }}
                      >
                        <QueryLinkInfo>
                          <QueryLinkTitleRow>
                            {"View > " + snakeToTitle(viewInfo.name)}
                          </QueryLinkTitleRow>
                          <QueryLinkDescription>
                            {viewInfo.description}
                          </QueryLinkDescription>
                        </QueryLinkInfo>
                        <RunIcon width="64" height="18" />
                      </QueryLink>
                    ))}
                  </QueryContainer>
                )}
              </SourceContainer>
            ))}
          </ModelContainer>
        ))}
      </>
    </>
  );
};

const SectionTitleRow = styled.div`
  font-size: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const ModelContainer = styled.div`
  border: 1px solid #d7d7d7;
  border-radius: 7px;
  padding: 5px;
  background-color: ${COLORS.mainBackground};
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
  width: 90%;
  color: #595959;
`;

const SourceContainer = styled.div`
  margin-left: 70px;
  margin-right: 70px;
  border: 1px solid #d7d7d7;
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 6px;
  color: #595959;
`;

const ModelTitleRow = styled.div`
  width=100%;
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
`;

const NotebookLink = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  justify-content: space-between;

  &:hover {
    background-color: #f0f6ff;
    border-color: #4285f4;
  }
`;

const SourceLink = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  color: #595959;

  &:hover {
    background-color: #f0f6ff;
    border-color: #4285f4;
  }
`;

const SourceLinkInfo = styled.div`
  width: 100%;
  gap: 5px;
  display: flex;
  flex-direction: row;
`;

const SourceLinkTitleRow = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
`;

const SourceLinkDescription = styled.div`
  color: #929292;
  font-size: 16px;
`;

const QueryContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 2px;
  display: flex;
  flex-direction: column;
`;

const QueryLink = styled.div`
  border: 1px solid #d7d7d7;
  padding: 2px;
  background-color: white;
  display: flex;
  flex-direction: row;
  gap: 2px;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  margin-left: 60px;
  margin-right: 120px;
  margin-bottom: 2px;

  &:hover {
    background-color: #f0f6ff;
    border-color: #4285f4;
  }
`;

const QueryLinkInfo = styled.div`
  width: 100%;
  gap: 5px;
  display: flex;
  flex-direction: row;
`;

const QueryLinkTitleRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
`;

const QueryLinkDescription = styled.div`
  color: #929292;
  font-size: 14px;
`;
