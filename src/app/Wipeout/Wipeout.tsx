/*
 * Copyright 2021 Google LLC
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

import styled from "styled-components";
import errorSrc from "../assets/img/error.png";

export const Wipeout = (): JSX.Element => {
  return <Oops src={errorSrc} alt="Oops" />;
};

const Oops = styled.img`
  width: 160px;
  height: 110px;
  padding: 5px;
`;
