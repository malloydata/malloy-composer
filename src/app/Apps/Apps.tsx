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

import { useNavigate } from "react-router-dom";
import { ComposerConfig } from "../../types";
import { useApps } from "../data/use_apps";
import { MarkdownDocument } from "../MarkdownDocument";
import { snakeToTitle } from "../utils";

export const Apps: React.FC = () => {
  const config = useApps();
  const navigate = useNavigate();
  return (
    <MarkdownDocument
      content={config?.readme || generateReadme(config)}
      loadApp={(appId) => navigate(`/${appId}`)}
    />
  );
};

function generateReadme(config: ComposerConfig): string {
  let readme = "# Welcome to Malloy Composer\n\n";
  readme += "Select one of the following datasets to get started!\n\n";
  for (const dataset of config.apps) {
    const id = dataset.id || "default";
    const title = snakeToTitle(dataset.path);
    readme += `
<!-- malloy-app
  app="${id}"
  name="${title}"
  description="Generated from ${snakeToTitle(dataset.path)}"
-->`;
  }
  return readme;
}
