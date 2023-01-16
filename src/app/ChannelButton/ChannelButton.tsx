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
import { COLORS } from "../colors";
import { ChannelIcon, ChannelIconName } from "../ChannelIcon";

export const ChannelButton: React.FC<{
  icon: ChannelIconName;
  text: string;
  onClick: () => void;
  selected: boolean;
  disabled?: boolean;
}> = ({ icon, text, onClick, selected, disabled = false }) => {
  return (
    <StyledButton onClick={onClick} selected={selected} disabled={disabled}>
      <ChannelIcon name={icon} />
      {text}
    </StyledButton>
  );
};

const StyledButton = styled.button<{ selected: boolean; disabled: boolean }>`
  outline: none;
  border: none;
  color: ${COLORS.dimension.fillStrong};
  display: flex;
  flex-direction: column;
  background-color: transparent;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 10px;
  font-weight: 600;

  ${({ selected, disabled }) =>
    (!disabled
      ? `
      cursor: pointer;

      &:hover {
        background-color: ${COLORS.other.fillLight};
      }

      .primary-fill {
        fill: ${COLORS.other.fillStrong};
      }

      color: ${COLORS.other.fillStrong};
    `
      : `
      .primary-fill {
        fill: ${COLORS.other.fillMedium};
      }

      color: ${COLORS.other.fillMedium};
    `) +
    (selected
      ? `
      color: ${COLORS.dimension.fillStrong};

      &:hover {
        background-color: ${COLORS.dimension.fillLight};
      }

      .primary-fill {
        fill: ${COLORS.dimension.fillStrong};
      }
      `
      : "")}
`;
