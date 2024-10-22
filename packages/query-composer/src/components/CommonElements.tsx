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
import * as React from 'react';
import styled from 'styled-components';
import ChevronLeftIcon from '../assets/img/chevrons/chevron_left.svg?react';
import ChevronRightIcon from '../assets/img/chevrons/chevron_right.svg?react';
import {ColorKey, COLORS} from '../colors';
import {extractErrorMessage} from '../utils';

export const PanelTitle = styled.div`
  text-transform: uppercase;
  color: var(--malloy-composer-color, #939393);
  font-family: var(--malloy-composer-fontFamily, sans-serif);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 22px;
  padding: 7px 10px 6px 20px;
  border-bottom: 1px solid var(--malloy-composer-border, #efefef);
  font-size: 11pt;
  font-weight: 500;
`;

export const FieldLabel = styled.div`
  display: flex;
  font-weight: normal;
  font-family: var(--malloy-composer-code-fontFamily, monospace);
  gap: 5px;
  margin-top: -3px;
  align-items: center;
  user-select: none;
`;

export const FormInputLabel = styled.label`
  font-size: 12px;
  color: var(--malloy-composer-form-foreground, #505050);
  font-family: var(--malloy-composer-form-fontFamily, monospace);
  text-transform: none;
  font-weight: normal;
`;

export const Button = styled.button<{
  color?: 'primary' | 'secondary';
  outline?: boolean;
}>`
  padding: 5.5px 10px;
  font-family: var(--malloy-composer-form-fontFamily, sans-serif);
  border-radius: 5px;
  cursor: pointer;
  min-width: 80px;

  ${({color = 'primary', outline = false}) => `
    ${
      color === 'primary' && !outline
        ? `
        border: 1px solid #4285F4;
        background-color: #4285F4;
        color: white;

        &:active {
          background-color: #175cb7;
        }
      `
        : color === 'primary' && outline
        ? `
        border: 1px solid #d8dade;
        background-color: white;
        color: #4285F4;

        &:active {
          background-color: #efefef;
        }
      `
        : color === 'secondary' && !outline
        ? `
        border: 0;
        background-color: transparent;
        color: #343434;

        &:active {
          background-color: #adadad;
        }
      `
        : `
        border: 1px solid #343434;
        background-color: white;
        color: #343434;

        &:active {
          background-color: #343434;
          color: white;
        }
      `
    }
  `}
`;

export const RightButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 15px;
`;

export const ButtonAndInputRow = styled.form`
  display: flex;
  justify-content: space-between;
  gap: 5px;
`;

interface ChevronButtonProps {
  onClick: () => void;
}

export const ChevronLeftButton: React.FC<ChevronButtonProps> = ({onClick}) => {
  return (
    <ChevronLeftIcon
      width="22px"
      height="22px"
      style={{cursor: 'pointer'}}
      onClick={onClick}
    />
  );
};

export const ChevronRightButton: React.FC<ChevronButtonProps> = ({onClick}) => {
  return (
    <ChevronRightIcon
      width="22px"
      height="22px"
      style={{cursor: 'pointer'}}
      onClick={onClick}
    />
  );
};

export const EmptyMessage = styled.div`
  color: #969696;
  text-align: center;
  margin-top: 30px;
  margin-bottom: 30px;
  font-family: var(--malloy-composer-code-fontFamily, monospace);
  text-transform: none;
  font-size: 16px;
  font-weight: normal;
`;

export const ContextMenuTitle = styled.div`
  font-family: var(--malloy-composer-fontFamily, sans-serif);
  font-size: var(--malloy-composer-fontSize, 14px);
  color: var(--malloy-composer-menu-title, #505050);
  text-transform: none;
  margin-bottom: 15px;
  user-select: none;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export const ContextMenuMain = styled.div`
  padding: 15px;
`;

export const ContextMenuContent = styled.div`
  padding: 10px;
`;

export const ContextMenuSearchHeader = styled.div`
  border-bottom: 1px solid #efefef;
  padding: 10px;
`;

export const ContextMenuOuter = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FormFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const ScrollMain = styled.div`
  overflow-y: auto;
  max-height: 400px;
`;

export const FieldName = styled.div`
  text-overflow: ellipsis;
  text-transform: none;
  color: var(--malloy-composer-foreground, #505050);
  overflow: hidden;
  white-space: nowrap;
`;

export const SmallFieldName = styled(FieldName)`
  font-size: 12px;
`;

export const FieldIcon = styled.div<{
  color: ColorKey;
}>`
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  display: flex;

  ${({color}) => {
    return `
      svg .primaryfill {
        fill: ${COLORS[color].fillStrong};
      }
      svg .primarystroke {
        stroke: ${COLORS[color].fillStrong};
      }
    `;
  }}
`;

export const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledFormError = styled.div`
  background: var(--malloy-composer-error-background, #ffdddd);
  display: flex;
  padding: 6px;
  margin-top: 10px;
  border-radius: 3px;
`;

export interface FormErrorProps {
  error: unknown;
}

export const FormError: React.FC<FormErrorProps> = ({error}) => {
  if (error) {
    const message = extractErrorMessage(error);
    return <StyledFormError>{message}</StyledFormError>;
  } else {
    return null;
  }
};

export const PageHeader = styled.div`
  overflow: hidden;
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background-color: var(
    --malloy-composer-header-background,
    rgb(247, 249, 252)
  );
  flex-shrink: 0;
`;

export const PageContent = styled.div`
  overflow: hidden;
  background-color: var(--malloy-composer-background, white);
  border-radius: 5px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;
