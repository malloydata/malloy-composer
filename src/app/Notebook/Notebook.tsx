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

import { NotebookInfo } from "../../types";
import {
  MalloySQLParser,
  MalloySQLStatementType,
} from "@malloydata/malloy-sql";
import { MarkdownDocument } from "../MarkdownDocument";
import { NotebookResult } from "../NotebookResult";
import * as explore from "../../types";

interface NotebookProps {
  app: explore.AppListing;
  notebookInfo: NotebookInfo;
}

export const Notebook: React.FC<NotebookProps> = ({ app, notebookInfo }) => {
  // TODO: Move this to server side.
  const parse = MalloySQLParser.parse(notebookInfo.fileContents, "utf8");
  let cellNumber = 0;
  return (
    <>
      {parse.statements.map(
        (stmt) =>
          (stmt.type === MalloySQLStatementType.MARKDOWN && (
            <MarkdownDocument
              key={"markdown-cell-" + cellNumber++}
              content={stmt.text}
            />
          )) ||
          (stmt.type === MalloySQLStatementType.MALLOY &&
            !stmt.text.startsWith("import") && (
              <>
                <MarkdownDocument
                  key={"malloy-cell-" + cellNumber++}
                  content={"```\n" + stmt.text + "\n```"}
                />
                <NotebookResult
                  key={"result-cell-" + cellNumber}
                  app={app}
                  notebookPath={notebookInfo.path}
                  code={stmt.text}
                />
              </>
            ))
      )}
      ;
    </>
  );
};
