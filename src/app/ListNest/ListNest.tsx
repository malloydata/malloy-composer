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

export const ListNest: React.FC = ({ children }) => {
  return (
    <NestDiv>
      <NestBar />
      <NestIndented>{children}</NestIndented>
    </NestDiv>
  );
};

const NestDiv = styled.div`
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  gap: 2px;
  margin-left: 13px;
`;

const NestBar = styled.div`
  width: 6px;
  min-width: 6px;
  padding: 5px 0px;
  margin: 0 1px;
  background-color: #efefef;
  border-radius: 100px;
`;

const NestIndented = styled.div`
  width: calc(100% - 10px);
`;
