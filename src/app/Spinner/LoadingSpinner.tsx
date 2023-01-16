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
import React from "react";
import styled, { keyframes } from "styled-components";
import { ReactComponent as SpinnerSVG } from "../assets/img/spinner.svg";
import { ColorKey, COLORS } from "../colors";

interface LoadingSpinnerProps {
  text: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  return (
    <VerticalCenter>
      <HorizontalCenter>
        <Label>{text}</Label>
        <Spinner size={25} />
      </HorizontalCenter>
    </VerticalCenter>
  );
};

interface SpinnerProps {
  size: number;
  color?: ColorKey;
}

export const Spinner: React.FC<SpinnerProps> = ({ size, color }) => {
  return (
    <SpinningSVG
      size={size}
      color={color || "dimension"}
      width={size + "px"}
      height={size + "px"}
    />
  );
};

const rotation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
`;

const SpinningSVG = styled(SpinnerSVG)<{ size: number; color: ColorKey }>`
  ${({ size, color }) => `
    width: ${size}px;
    height: ${size}px;

    .primarystroke {
      stroke: ${COLORS[color].fillStrong}
    }
  `}
  animation: ${rotation} 2s infinite linear;
`;

const Label = styled.div`
  margin-bottom: 10px;
  color: #505050;
  font-size: 15px;
`;

const VerticalCenter = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 0 auto;
  width: 100%;
  height: 100%;
`;

const HorizontalCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
