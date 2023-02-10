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
import { useState, useRef } from "react";
import styled from "styled-components";
import { useClickOutside } from "../hooks";
import { Popover } from "../Popover";
import { ReactComponent as ChevronDown } from "../assets/img/chevrons/chevron_down.svg";
import { ReactComponent as Checkmark } from "../assets/img/checkmark.svg";
import { COLORS } from "../colors";

interface SelectDropdownProps<T> {
  autoFocus?: boolean;
  value: T | undefined;
  placeholder?: string;
  onChange?: (newValue: T) => void;
  options: { label: string | JSX.Element; value: T; divider?: boolean }[];
  disabled?: boolean;
  valueEqual?: (a: T, b: T) => boolean;
  width?: number;
}

const Wrapper = styled.div`
  position: relative;
`;

const InputBox = styled.button`
  background-color: transparent;
  font-size: 14px;
  border: 1px solid #efefef;
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
  color: #5f6368;
  display: flex;
  justify-content: space-between;
  text-transform: none;
  align-items: center;
  font-family: Arial;
  &:hover {
    border: 1px solid #ececed;
  }
  :focus {
    box-shadow: none;
    border: 1px solid #4285f4;
    outline: none;
  }
  &[disabled] {
    cursor: default;
    background-color: #f6f6f6;
  }
  width: 100%;
`;

const OptionDiv = styled.label`
  padding: 0px 10px;
  height: 30px;
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: #5f6368;
  display: flex;
  align-items: center;
  &:hover {
    background-color: ${COLORS.dimension.fillLight};
  }
`;

const OptionSpan = styled.span`
  margin-left: 8px;
`;

const CheckIcon = styled(Checkmark)`
  vertical-align: text-top;
  width: 20px;
  min-width: 20px;
  opacity: 70%;
  visibility: hidden;

  &.selected {
    visibility: visible;
  }
`;

export const SelectDropdown = <T,>({
  autoFocus,
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled = false,
  valueEqual = (a: T, b: T) => a === b,
  width = 200,
}: SelectDropdownProps<T>): JSX.Element => {
  const [open, setOpen] = useState(false);
  const wrapperElement = useRef<HTMLDivElement>(null);
  const label =
    (value !== undefined &&
      options.find((option) => valueEqual(option.value, value))?.label) ||
    placeholder;

  const select = (value: T) => {
    onChange && onChange(value);
    setOpen(false);
  };

  useClickOutside(wrapperElement, () => {
    setOpen(false);
  });

  return (
    <Wrapper ref={wrapperElement}>
      <InputBox
        type="button"
        autoFocus={autoFocus}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) setOpen(true);
        }}
      >
        {label}
        <ChevronDown width="22px" height="22px" />
      </InputBox>
      <Popover
        open={open}
        setOpen={setOpen}
        placement="bottom-start"
        width={width}
        maxHeight={500}
      >
        <SelectList
          options={options}
          value={value}
          valueEqual={valueEqual}
          onChange={select}
        />
      </Popover>
    </Wrapper>
  );
};

interface SelectListProps<T> {
  value: T | undefined;
  options: { label: string | JSX.Element; value: T; divider?: boolean }[];
  valueEqual?: (a: T, b: T) => boolean;
  onChange: (value: T) => void;
}

export function SelectList<T>({
  options,
  value,
  onChange,
  valueEqual = (a: T, b: T) => a === b,
}: SelectListProps<T>): JSX.Element {
  return (
    <SelectListDiv>
      {options.reduce<JSX.Element[]>((result, option, index) => {
        const isSelected =
          value !== undefined && valueEqual(value, option.value);
        if (option.divider) {
          result.push(<OptionDivider key={"divider" + index} />);
        }
        result.push(
          <OptionDiv
            key={index}
            onClick={() => onChange(option.value)}
            className={isSelected ? "selected" : ""}
          >
            <OptionRadio type="radio" defaultChecked={isSelected} />
            <CheckIcon className={isSelected ? "selected" : ""} />
            <OptionSpan>{option.label}</OptionSpan>
          </OptionDiv>
        );
        return result;
      }, [])}
    </SelectListDiv>
  );
}

interface DropdownMenuProps {
  options: {
    label: string | JSX.Element;
    onSelect: (event: React.MouseEvent) => void;
    divider?: boolean;
  }[];
}

export function DropdownMenu({ options }: DropdownMenuProps): JSX.Element {
  return (
    <SelectListDiv>
      {options.reduce<JSX.Element[]>((result, option, index) => {
        if (option.divider) {
          result.push(<OptionDivider key={"divider" + index} />);
        }
        result.push(
          <OptionDiv key={index} onClick={(event) => option.onSelect(event)}>
            <OptionSpan>{option.label}</OptionSpan>
          </OptionDiv>
        );
        return result;
      }, [])}
    </SelectListDiv>
  );
}

const OptionRadio = styled.input`
  width: 0;
  height: 0;
`;

const SelectListDiv = styled.div`
  font-size: 14px;
  font-family: Roboto;
  text-transform: none;
  font-weight: normal;
  width: 100%;
  padding: 10px 0;
  overflow-y: auto;
  max-height: 400px;
`;

const OptionDivider = styled.div`
  border-top: 1px solid #ececec;
  width: 100%;
  margin: 0 10px;
  margin: 5px 0;
`;
