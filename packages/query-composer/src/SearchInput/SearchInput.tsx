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
import { KeyboardEvent } from "react";
import styled from "styled-components";
import { ActionIcon } from "../ActionIcon";

interface SearchInputProps {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onTab?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  setValue,
  placeholder,
  autoFocus,
  onTab,
}) => {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      onTab && onTab();
      event.stopPropagation();
      event.preventDefault();
    }
  };

  return (
    <SearchRow>
      <SearchIcon>
        <ActionIcon action="search" color="other" />
      </SearchIcon>
      <StyledInput
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoFocus={autoFocus}
        tabIndex={1}
        onKeyDown={onKeyDown}
      />
    </SearchRow>
  );
};

const SearchRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const SearchIcon = styled.div`
  position: fixed;
  left: 15px;
  top: 9px;
  pointer-events: none;
`;

const StyledInput = styled.input`
  font-family: "Roboto Mono";
  font-size: 14px;
  border-radius: 5px;
  border: none;
  padding: 3px 10px 1px 38px;
  outline: none;
  width: calc(100% - 22px);

  &:focus {
    border-color: #4285f4;
  }
`;
