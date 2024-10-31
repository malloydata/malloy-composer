/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import styled from 'styled-components';

export const StageButton = styled.div<{
  active: boolean;
}>`
  text-transform: uppercase;
  font-size: 12px;
  border: none;
  overflow: hidden;
  background-color: transparent;
  border-radius: 50px;
  padding: 5px 7px 5px 10px;
  text-align: left;
  margin-bottom: 2px;
  user-select: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
  color: #9aa0a6;

  &:hover {
    .back {
      visibility: visible;
    }
  }

  .back {
    visibility: hidden;
  }

  &:hover {
    background-color: #f7f8f8;
  }

  ${({active}) => {
    return active
      ? `
        background-color: #f7f8f8;
        .back {
          visibility: visible;
        }
      `
      : '';
  }}
`;
