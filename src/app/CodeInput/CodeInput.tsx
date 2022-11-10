/*
 * Copyright 2021 Google LLC
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

import { useEffect, useRef } from "react";
import styled from "styled-components";
import { FormItem, FormInputLabel } from "../CommonElements";

export interface CodeInputProps {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  autoSelect?: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  value,
  setValue,
  placeholder,
  label,
  autoFocus,
  autoSelect,
}) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoSelect && ref.current) {
      ref.current.select();
    }
  }, [autoSelect]);

  return (
    <FormItem>
      {label && <FormInputLabel>{label}</FormInputLabel>}
      <StyledInput
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoFocus={autoFocus}
        type="text"
      />
    </FormItem>
  );
};

const StyledInput = styled.input`
  font-family: "Roboto Mono";
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #efefef;
  padding: 5px 10px;
  outline: none;
  width: calc(100% - 22px);

  &:focus {
    border-color: #4285f4;
  }
`;

export interface CodeTextAreaProps {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  autoSelect?: boolean;
  rows?: number;
  cols?: number;
}

export const CodeTextArea: React.FC<CodeTextAreaProps> = ({
  value,
  setValue,
  placeholder,
  label,
  autoFocus,
  autoSelect,
  rows = 1,
  cols,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoSelect && ref.current) {
      ref.current.select();
    }
  }, [autoSelect]);

  return (
    <FormItem>
      {label && <FormInputLabel>{label}</FormInputLabel>}
      <StyledTextArea
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoFocus={autoFocus}
        rows={rows}
        cols={cols}
      />
    </FormItem>
  );
};

const StyledTextArea = styled.textarea`
  font-family: "Roboto Mono";
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #efefef;
  padding: 5px 10px;
  outline: none;
  width: calc(100% - 22px);

  &:focus {
    border-color: #4285f4;
  }
`;
