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
