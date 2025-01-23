/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import {FormItem, FormInputLabel, StyledInput} from '../CommonElements';

interface StringInputProps {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
}

export const StringInput: React.FC<StringInputProps> = ({
  value,
  setValue,
  placeholder,
  label,
  autoFocus,
}) => {
  return (
    <FormItem>
      {label && <FormInputLabel>{label}</FormInputLabel>}
      <StyledInput
        placeholder={placeholder}
        value={value}
        size={1}
        onChange={event => {
          const v = event.target.value;
          setValue(v);
        }}
        autoFocus={autoFocus}
      />
    </FormItem>
  );
};
