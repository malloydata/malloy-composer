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

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Markdown, parseMarkdown } from "../../core/markdown";
import { COLORS } from "../colors";
import { DOMElement } from "../DOMElement";
import { highlightPre } from "../utils";
import { ReactComponent as RunIcon } from "../assets/img/query_run_wide.svg";
import { ReactComponent as QueryIcon } from "../assets/img/source_query.svg";
import { ReactComponent as ViewIcon } from "../assets/img/dataset_view.svg";

interface MarkdownDocumentProps {
  content: string;
  loadQueryLink?: (
    model: string,
    query: string,
    name?: string,
    renderer?: string
  ) => void;
  loadApp?: (appId: string) => void;
  loadSource?: (model: string, source: string) => void;
}

export const MarkdownDocument: React.FC<MarkdownDocumentProps> = ({
  content,
  loadQueryLink,
  loadApp,
  loadSource,
}) => {
  const markdown = parseMarkdown(content);

  return (
    <MarkdownNode
      node={markdown}
      loadQueryLink={loadQueryLink}
      loadApp={loadApp}
      loadSource={loadSource}
    />
  );
};

export const MarkdownNode: React.FC<{
  node: Markdown;
  loadQueryLink: (
    model: string,
    query: string,
    name?: string,
    renderer?: string
  ) => void;
  loadApp?: (appId: string) => void;
  loadSource?: (model: string, source: string) => void;
}> = ({ node, loadQueryLink, loadApp, loadSource }) => {
  const children = (node: { children: Markdown[] }) => (
    <MarkdownNodes
      nodes={node.children}
      loadQueryLink={loadQueryLink}
      loadApp={loadApp}
      loadSource={loadSource}
    />
  );

  switch (node.type) {
    case "root":
      return (
        <MarkdownDocumentRoot>
          <MarkdownDocumentRootInner>
            {children(node)}
          </MarkdownDocumentRootInner>
        </MarkdownDocumentRoot>
      );
    case "heading":
      switch (node.depth) {
        case 1:
          return <MarkdownHeading1>{children(node)}</MarkdownHeading1>;
        case 2:
          return <MarkdownHeading2>{children(node)}</MarkdownHeading2>;
        case 3:
          return <MarkdownHeading3>{children(node)}</MarkdownHeading3>;
        case 4:
          return <MarkdownHeading4>{children(node)}</MarkdownHeading4>;
        case 5:
          return <MarkdownHeading5>{children(node)}</MarkdownHeading5>;
        case 6:
          return <MarkdownHeading6>{children(node)}</MarkdownHeading6>;
      }
      return <div />;
    case "text":
      return <span>{node.value}</span>;
    case "strong":
      return <b>{children(node)}</b>;
    case "paragraph":
      return <MarkdownParagraph>{children(node)}</MarkdownParagraph>;
    case "link":
      return (
        <MarkdownLink href={node.url}>
          {children(node)}
          {node.title}
        </MarkdownLink>
      );
    case "emphasis":
      return <i>{children(node)}</i>;
    case "blockquote":
      return <blockquote>{children(node)}</blockquote>;
    case "break":
      return <br />;
    case "code":
      return <MarkdownCodeBlock code={node.value} language={node.lang} />;
    case "delete":
      return <del>{children(node)}</del>;
    case "html": {
      return <span />;
    }
    case "image":
      return (
        <img src={node.url} alt={node.alt} title={node.title ?? undefined} />
      );
    case "inlineCode":
      return <code>{node.value}</code>;
    case "listItem":
      return <li>{children(node)}</li>;
    case "list":
      return <ul>{children(node)}</ul>;
    case "table":
      return (
        <MarkdownTable align={node.align}>
          <tbody>{children(node)}</tbody>
        </MarkdownTable>
      );
    case "tableRow":
      return <tr>{children(node)}</tr>;
    case "tableCell":
      return <MarkdownTableCell>{children(node)}</MarkdownTableCell>;
    case "thematicBreak":
      return <hr />;
    case "malloyQueryLink":
      return (
        <QueryLink
          onClick={() => {
            loadQueryLink(node.model, node.query, node.name, node.renderer);
          }}
        >
          <QueryLinkInfo>
            <QueryLinkTitleRow>{node.name}</QueryLinkTitleRow>
            <QueryLinkDescription>{node.description}</QueryLinkDescription>
          </QueryLinkInfo>
          <RunIcon width="80" height="22" />
        </QueryLink>
      );
    case "malloyAppLink":
      return (
        <QueryLink
          onClick={() => {
            loadApp(node.appId);
          }}
        >
          <QueryLinkInfo>
            <QueryLinkTitleRow>{node.name}</QueryLinkTitleRow>
            <QueryLinkDescription>{node.description}</QueryLinkDescription>
          </QueryLinkInfo>
          <ViewIcon width="80" height="22" />
        </QueryLink>
      );
    case "malloySourceLink":
      return (
        <QueryLink
          onClick={() => {
            loadSource(node.model, node.source);
          }}
        >
          <QueryLinkInfo>
            <QueryLinkTitleRow>{node.title}</QueryLinkTitleRow>
            <QueryLinkDescription>{node.description}</QueryLinkDescription>
          </QueryLinkInfo>
          <QueryIcon width="80" height="22" />
        </QueryLink>
      );
  }
};

export const MarkdownNodes: React.FC<{
  nodes: Markdown[];
  loadQueryLink: (
    modelPath: string,
    sourceName: string,
    queryName: string
  ) => void;
  loadApp?: (appId: string) => void;
  loadSource?: (model: string, source: string) => void;
}> = ({ nodes, loadQueryLink, loadApp, loadSource }) => {
  return (
    <>
      {nodes.map((childNode, index) => (
        <MarkdownNode
          node={childNode}
          key={index}
          loadQueryLink={loadQueryLink}
          loadApp={loadApp}
          loadSource={loadSource}
        />
      ))}
    </>
  );
};

interface MarkdownCodeBlockProps {
  code: string;
  language: string;
}

const MarkdownCodeBlock: React.FC<MarkdownCodeBlockProps> = ({
  code,
  language,
}) => {
  const [pre, setPre] = useState<HTMLElement>();

  useEffect(() => {
    highlightPre(code, language).then(setPre);
  }, [code, language]);

  return pre ? (
    <MarkdownPreWrapper>
      <DOMElement element={pre} />
    </MarkdownPreWrapper>
  ) : (
    <pre>{code}</pre>
  );
};

const MarkdownTable = styled.table<{
  align: ("left" | "right" | "center" | null)[];
}>`
  border: 1px solid #eaeaea;
  vertical-align: top;
  border-bottom: 1px solid #eaeaea;
  border-collapse: collapse;
  width: 100%;

  tr:first-child {
    font-weight: 500;
  }

  ${({ align }) =>
    align
      .map((alignment, index) => {
        return `
        tr td:nth-child(${index + 1}) {
          text-align: ${alignment ?? "left"};
        }
      `;
      })
      .join("\n")}
`;

const MarkdownTableCell = styled.td`
  padding: 8px;
  vertical-align: top;
  border-bottom: 1px solid #eaeaea;
`;

const MarkdownHeading1 = styled.h1`
  font-size: 21px;
  font-weight: 500;
  margin-block-end: 8px;
  margin-block-start: 16px;
`;

const MarkdownHeading2 = styled.h2`
  font-size: 19px;
  font-weight: 500;
  margin-block-end: 8px;
  margin-block-start: 16px;
`;

const MarkdownHeading3 = styled.h3`
  font-size: 17px;
  font-weight: 500;
  margin-block-end: 8px;
  margin-block-start: 16px;
`;

const MarkdownHeading4 = styled.h4`
  font-size: 15px;
  font-weight: 500;
  margin-block-end: 8px;
  margin-block-start: 16px;
`;

const MarkdownHeading5 = styled.h5`
  font-size: 14px;
  font-weight: 500;
  margin-block-end: 8px;
  margin-block-start: 16px;
`;

const MarkdownHeading6 = styled.h6`
  font-size: 14px;
  font-weight: 500;
  margin-block-end: 8px;
  margin-block-start: 16px;
`;

const MarkdownDocumentRoot = styled.div`
  padding: 10px 30px 30px 30px;
  width: 100%;
  font-family: Google Sans;
  overflow-y: auto;
`;

const MarkdownDocumentRootInner = styled.div`
  max-width: 900px;
`;

const MarkdownLink = styled.a`
  color: ${COLORS.dimension.fillStrong};
`;

const MarkdownParagraph = styled.p`
  font-size: 14px;
  margin-block-start: 8px;
  color: #4b4c50;
`;

const MarkdownPreWrapper = styled.div`
  pre {
    font-size: 14px;
    border: 1px solid #efefef;
    border-radius: 5px;
    padding: 10px;
    background-color: #fbfbfb;
  }
`;

const QueryLinkInfo = styled.div`
  width: 100%;
  gap: 5px;
  display: flex;
  flex-direction: column;
`;

const QueryLink = styled.div`
  border: 1px solid #d7d7d7;
  border-radius: 7px;
  padding: 15px;
  background-color: white;
  display: flex;
  flex-direction: row;
  gap: 2px;
  margin-bottom: 15px;
  align-items: center;
  cursor: pointer;
  font-size: 15px;
  color: #595959;

  &:hover {
    background-color: #f0f6ff;
    border-color: #4285f4;
  }
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
