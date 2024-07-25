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
import { useEffect, useState } from "react";
import { COLORS } from "../colors";
import { FormItem, FormInputLabel } from "../CommonElements";

interface NumberInputProps {
  value: number;
  setValue: (value: number) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  setValue,
  placeholder,
  label,
  autoFocus,
}) => {
  const [tempValue, setTempValue] = useState(value.toString());

  useEffect(() => {
    setTempValue(value.toString());
  }, [value]);

  return (
    <FormItem>
      {label && <FormInputLabel>{label}</FormInputLabel>}
      <StyledInput
        type="number"
        placeholder={placeholder}
        value={tempValue}
        size={1}
        onChange={(event) => {
          const raw = event.target.value;
          setTempValue(raw);
          const v = parseFloat(raw);
          if (!Number.isNaN(v)) {
            setValue(v);
          }
        }}
        autoFocus={autoFocus}
      />
    </FormItem>
  );
};

const StyledInput = styled.input`
  font-family: Roboto;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #efefef;
  padding: 5.75px 10px;
  outline: none;
  width: calc(100% - 22px);

  &:focus {
    border-color: #4285f4;
    background-color: ${COLORS.dimension.fillLight};
  }
`;
