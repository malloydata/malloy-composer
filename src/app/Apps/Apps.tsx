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

import { Link, useNavigate } from "react-router-dom";
import { useApps } from "../data/use_apps";
import { MarkdownDocument } from "../MarkdownDocument";

export const Apps: React.FC = () => {
  const config = useApps();
  const navigate = useNavigate();
  return config?.readme ? (
    <MarkdownDocument
      content={config.readme}
      loadApp={(appId) => navigate(`/${appId}`)}
    />
  ) : (
    <div>
      {config?.apps?.map((app) => (
        <div key={app.id}>
          <Link to={`/${app.id}`}>{app.root}</Link>
        </div>
      ))}
    </div>
  );
};
