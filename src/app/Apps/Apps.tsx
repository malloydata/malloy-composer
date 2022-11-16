/*
 * Copyright 2022 Google LLC
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
    const title = snakeToTitle(dataset.root);
    readme += `
<!-- malloy-app 
  app="${id}" 
  name="${title}" 
  description="Generated from ${snakeToTitle(dataset.root)}" 
-->`;
  }
  return readme;
}
