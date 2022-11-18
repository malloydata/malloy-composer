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

import { useRouteError } from "react-router-dom";
import { EmptyMessage } from "../CommonElements";
import { MalloyLogo } from "../MalloyLogo";

export const ErrorElement = (): JSX.Element => {
  const error = useRouteError() as Error;

  // eslint-disable-next-line no-console
  console.error(error);

  return (
    <EmptyMessage>
      <MalloyLogo />
      <h1>Oops, something went wrong.</h1>
      <div>
        <div>{error.message}</div>
        <div>Try reloading the page.</div>
      </div>
    </EmptyMessage>
  );
};
