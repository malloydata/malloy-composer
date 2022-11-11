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

import { Link } from "react-router-dom";
import logoSrc from "../assets/img/logo.png";

export const MalloyLogo: React.FC = () => {
  return (
    <Link to="/">
      <img
        src={logoSrc}
        alt="Malloy"
        style={{ height: "30px", marginRight: "12px" }}
      />
    </Link>
  );
};
