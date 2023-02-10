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

import { Plugin, Transformer, unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { commentMarker, Marker, Node } from "mdast-comment-marker";

export function parseMarkdown(text: string): Markdown {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(applyMalloyQueryLinkCommentsPlugin);
  const tree = processor.parse(text);
  return processor.runSync(tree);
}

export type Markdown =
  | Root
  | Strong
  | HTML
  | Break
  | Heading
  | Text
  | Paragraph
  | Link
  | Emphasis
  | List
  | ListItem
  | Table
  | TableRow
  | TableCell
  | InlineCode
  | Code
  | Blockquote
  | Image
  | Delete
  | ThematicBreak
  | MalloyQueryLink
  | MalloyAppLink
  | MalloySourceLink;

export interface Root {
  type: "root";
  children: Markdown[];
}

export interface Break {
  type: "break";
}

export interface Image {
  type: "image";
  url: string;
  title: string | null;
  alt: string;
}

export interface Delete {
  type: "delete";
  children: Markdown[];
}

export interface Blockquote {
  type: "blockquote";
  children: Markdown[];
}

export interface Heading {
  type: "heading";
  children: Markdown[];
  depth: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface Text {
  type: "text";
  value: string;
}

export interface HTML {
  type: "html";
  value: string;
}

export interface Code {
  type: "code";
  lang: string;
  meta: string | null;
  value: string;
}

export interface Link {
  type: "link";
  title: string | null;
  url: string;
  children: Markdown[];
}

export interface Paragraph {
  type: "paragraph";
  children: Markdown[];
}

export interface Emphasis {
  type: "emphasis";
  children: Markdown[];
}

export interface Strong {
  type: "strong";
  children: Markdown[];
}

export interface List {
  type: "list";
  ordered: boolean;
  start: number | null;
  spread: boolean;
  children: Markdown[];
}

export interface ListItem {
  type: "listItem";
  checked: boolean | null;
  spread: boolean;
  children: Markdown[];
}

export interface Table {
  type: "table";
  align: ("left" | "right" | "center" | null)[];
  children: Markdown[];
}

export interface TableRow {
  type: "tableRow";
  children: Markdown[];
}

export interface TableCell {
  type: "tableCell";
  children: Markdown[];
}

export interface InlineCode {
  type: "inlineCode";
  value: string;
}

export interface ThematicBreak {
  type: "thematicBreak";
}

export interface MalloyQueryLink {
  type: "malloyQueryLink";
  model: string | undefined;
  query: string | undefined;
  name: string | undefined;
  description: string | undefined;
  renderer: string | undefined;
}

export interface MalloyAppLink {
  type: "malloyAppLink";
  appId: string | undefined;
  name: string | undefined;
  description: string | undefined;
}

export interface MalloySourceLink {
  type: "malloySourceLink";
  model: string | undefined;
  source: string | undefined;
  title: string | undefined;
  description: string | undefined;
}

function getMarkerParameter(marker: Marker, param: string): string | undefined {
  return marker.parameters?.[param]?.toString();
}

const applyMalloyQueryLinkCommentsPlugin: Plugin<[], Node, Markdown> = () => {
  let linkMarker: Marker | undefined = undefined;
  let savedModel = undefined;
  function transformer(tree: Node) {
    function transformNode(node: Node): Markdown {
      const markdownNode = node as Markdown;
      if (markdownNode.type === "html") {
        const marker = commentMarker(markdownNode);
        if (marker) {
          if (marker.name === "malloy-set-model") {
            savedModel = getMarkerParameter(marker, "model");
          } else if (marker.name === "malloy-query") {
            linkMarker = marker;
          } else if (marker.name === "malloy-source") {
            return {
              source: getMarkerParameter(marker, "source"),
              description: getMarkerParameter(marker, "description"),
              model: getMarkerParameter(marker, "model"),
              title: getMarkerParameter(marker, "title"),
              type: "malloySourceLink",
            };
          } else if (marker.name === "malloy-app") {
            return {
              name: getMarkerParameter(marker, "name"),
              description: getMarkerParameter(marker, "description"),
              appId: getMarkerParameter(marker, "app"),
              type: "malloyAppLink",
            };
          }
        }
        return markdownNode;
      } else if ("children" in markdownNode) {
        return {
          ...markdownNode,
          children: markdownNode.children.map((child) =>
            transformNode(child as Node)
          ),
        };
      } else if (markdownNode.type === "code") {
        const marker = linkMarker;
        if (marker) {
          linkMarker = undefined;
          return {
            model: getMarkerParameter(marker, "model") || savedModel,
            query: markdownNode.value,
            name: getMarkerParameter(marker, "name"),
            description: getMarkerParameter(marker, "description"),
            renderer: getMarkerParameter(marker, "renderer"),
            type: "malloyQueryLink",
          };
        } else {
          return markdownNode;
        }
      } else {
        return markdownNode;
      }
    }
    return transformNode(tree);
  }
  return transformer as Transformer<Node, Root>;
};
