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
import {ReactElement} from 'react';
import styled from 'styled-components';
import CloseIcon from '../../assets/img/query_clear_hover.svg?react';
import {ColorKey, COLORS} from '../../colors';
import {FieldName, FieldIcon} from '../CommonElements';
import {largeNumberLabel} from '../../utils';

interface FieldButtonProps {
  icon: ReactElement;
  onClick?: (event: React.MouseEvent) => void;
  canRemove?: boolean;
  onRemove?: () => void;
  name: string;
  unsaved?: boolean;
  color: ColorKey;
  active?: boolean;
  disableHover?: boolean;
  detail?: string;
  fullDetail?: boolean;
  trapMouseDown?: boolean;
  weight?: number;
}

export const FieldButton: React.FC<FieldButtonProps> = ({
  icon,
  name,
  onClick,
  canRemove,
  onRemove,
  unsaved = false,
  color,
  active = false,
  disableHover = false,
  detail,
  fullDetail = false,
  trapMouseDown = false,
  weight,
}) => {
  return (
    <FieldButtonRaw
      onClick={onClick}
      color={color}
      active={active}
      disableHover={disableHover}
      onMouseDown={e => {
        if (trapMouseDown) {
          // Allows PillInputs to accept a search value
          // without losing focus
          e.stopPropagation();
        }
      }}
    >
      <FrontPart>
        <FieldIcon color={color}>{icon}</FieldIcon>
        <FieldName>{name}</FieldName>
        {unsaved ? <UnsavedIndicator color={color} /> : ''}
      </FrontPart>
      {canRemove && (
        <BackPart className="back" title="Remove">
          <CloseIconStyled
            color={color}
            width="20px"
            height="20px"
            className="close"
            onClick={() => onRemove && onRemove()}
          />
        </BackPart>
      )}
      {!canRemove && detail !== undefined && (
        <DetailPart
          style={{color: COLORS[color].fillStrong, opacity: 0.8}}
          noShrink={fullDetail}
        >
          {detail}
          {weight && <Weight>{largeNumberLabel(weight)}</Weight>}
        </DetailPart>
      )}
    </FieldButtonRaw>
  );
};

export const UnsavedIndicator = styled.div<{
  color: ColorKey;
}>`
  width: 8px;
  margin-top: 3px;
  height: 8px;
  min-width: 8px;
  min-height: 8px;
  border-radius: 100px;

  ${({color}) => {
    return `
    background-color: ${COLORS[color].fillStrong};
    `;
  }}
`;

export const FrontPart = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
`;

export const BackPart = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
`;

export const Weight = styled.div`
  color: #9aa0a6;
`;

export const DetailPart = styled.div<{
  noShrink: boolean;
}>`
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  ${({noShrink}) => `flex-shrink: ${noShrink ? 0 : 4};`}
  font-size: 12px;
  font-weight: normal;
  text-transform: none;
  margin-right: 5px;
  justify-content: start;
  text-overflow: ellipsis;
  color: #9aa0a6;
`;

export const FieldButtonRaw = styled.div<{
  color: ColorKey;
  active: boolean;
  disableHover: boolean;
}>`
  border: none;
  background-color: transparent;
  border-radius: 50px;
  padding: 4px 7px;
  text-align: left;
  cursor: pointer;
  display: flex;
  color: var(--malloy-composer-foreground, #353535);
  user-select: none;
  font-size: var(--malloy-composer-fontSize, 14px);
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  font-family: var(--malloy-composer-code-fontFamily, monospace);

  ${({active, color}) => {
    if (active) {
      return `
        background-color: ${COLORS[color].fillMedium};
        .back {
          display: flex;
        }
      `;
    } else {
      return '';
    }
  }}

  &:hover {
    .back {
      display: flex;
    }
  }

  .back {
    display: none;
  }

  ${({color, disableHover}) => {
    if (!disableHover) {
      return `
        &:hover {
          background-color: ${COLORS[color].fillMedium};
        }
      `;
    }
    return null;
  }}
`;

export const CloseIconStyled = styled(CloseIcon)<{
  color: ColorKey;
}>`
  cursor: pointer;
  ${({color}) => {
    return `
      .cross {
        fill: ${COLORS[color].fillStrong};
      }
      .circle {
        fill: ${COLORS[color].fillMedium};
      }
    `;
  }}
`;
