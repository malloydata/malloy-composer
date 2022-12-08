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

import styled from "styled-components";
import { useRouteError } from "react-router-dom";
import { Wipeout } from "../Wipeout";

export const ErrorElement = (): JSX.Element => {
  const error = useRouteError() as Error;

  // eslint-disable-next-line no-console
  console.error(error);

  return (
    <ErrorMessage>
      <Wipeout />
      <ErrorHeader>Oops!</ErrorHeader>
      <ErrorBody>
        <div>Something went wrong.</div>
        <div>Please reload.</div>
      </ErrorBody>
    </ErrorMessage>
  );
};

const ErrorHeader = styled.div`
  font-weight: bold;
  font-size: 18pt;
  line-height: 1.6em;
`;

const ErrorBody = styled.div`
  font-size: 14pt;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ErrorMessage = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #5f6368;
`;
