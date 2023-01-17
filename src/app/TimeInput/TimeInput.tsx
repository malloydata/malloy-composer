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
import moment from "moment";
import { useEffect, useState } from "react";
import { FormInputLabel } from "../CommonElements";

interface TimeInputProps {
  value: Date;
  setValue: (value: Date) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  granularity: "hour" | "minute" | "second";
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  setValue,
  placeholder,
  label,
  autoFocus,
  granularity,
}) => {
  const format =
    granularity === "hour"
      ? "HH:00"
      : granularity === "minute"
      ? "HH:mm"
      : "HH:mm:ss";
  const [tempValue, setTempValue] = useState(moment(value).format(format));

  useEffect(() => {
    setTempValue(moment(value).format(format));
  }, [value, format]);

  return (
    <>
      {label && <FormInputLabel>{label}</FormInputLabel>}
      <StyledInput
        type="text"
        placeholder={placeholder || format}
        value={tempValue}
        onChange={(event) => {
          const raw = event.target.value;
          setTempValue(raw);
          const regex =
            granularity === "hour"
              ? /\d\d:00/
              : granularity === "minute"
              ? /\d\d:\d\d/
              : /\d\d:\d\d:\d\d/;
          if (raw.match(regex)) {
            const m = moment(raw, format);
            if (m.isValid()) {
              setValue(
                moment(value)
                  .hour(m.hour())
                  .minute(m.minute())
                  .second(m.second())
                  .toDate()
              );
            }
          }
        }}
        autoFocus={autoFocus}
      />
    </>
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

export const InputLabel = styled.label`
  font-size: 12px;
  color: #505050;
  font-family: Roboto;
  font-family: Roboto;
  text-transform: none;
`;
