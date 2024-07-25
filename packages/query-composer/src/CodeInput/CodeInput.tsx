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
  min-height: calc(1em + 5px);
  padding: 5px 10px;
  outline: none;
  resize: vertical;
  width: calc(100% - 22px);

  &:focus {
    border-color: #4285f4;
  }
`;
