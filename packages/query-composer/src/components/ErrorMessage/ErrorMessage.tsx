/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import styled from 'styled-components';

const SimpleErrorMessage = styled.div`
  padding: 5px;
  background-color: var(--malloy-composer-error-background, #fbb);
  font-family: var(--malloy-composer-fontFamily, sans-serif);
  font-size: var(--malloy-composer-fontSize, 12px);
  color: #4b4c50;
  border-radius: 5px;
`;

const MultiLineErrorMessage = styled(SimpleErrorMessage)`
  white-space: pre-wrap;
  font-family: var(--malloy-composer-code-fontFamily, monospace);
`;

export interface ErrorMessageProps {
  error: Error | null | undefined;
}

export const ErrorMessage = ({
  error,
}: ErrorMessageProps): React.ReactElement | null => {
  if (error) {
    const {message} = error;
    if (message.split('\n').length > 1) {
      return <MultiLineErrorMessage>{message}</MultiLineErrorMessage>;
    } else {
      return <SimpleErrorMessage>{message}</SimpleErrorMessage>;
    }
  }
  return null;
};
