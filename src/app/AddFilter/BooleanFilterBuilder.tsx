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
import { ReactElement } from "react";
import styled from "styled-components";
import { booleanFilterChangeType } from "../../core/filters";
import {
  BooleanCustomFilter,
  BooleanFilter,
  BooleanFilterType,
} from "../../types";
import { CodeInput } from "../CodeInput";
import { SelectDropdown } from "../SelectDropdown";

interface BooleanFilterBuilderProps {
  filter: BooleanFilter;
  setFilter: (filter: BooleanFilter) => void;
}

export const BooleanFilterBuilder: React.FC<BooleanFilterBuilderProps> = ({
  filter,
  setFilter,
}) => {
  const changeType = (type: BooleanFilterType) => {
    setFilter(booleanFilterChangeType(filter, type));
  };

  const typeDropdown = (
    <SelectDropdown
      value={filter.type}
      onChange={changeType}
      options={
        [
          { value: "is_true", label: "True" },
          { value: "is_false", label: "False" },
          { value: "is_null", label: "Null" },
          { value: "is_not_null", label: "Not null" },
          { value: "is_true_or_null", label: "True or null" },
          { value: "is_false_or_null", label: "False or null" },
          { value: "custom", label: "Custom" },
        ] as { value: BooleanFilterType; label: string }[]
      }
    />
  );

  const custom = useBooleanCustomBuilder(filter, setFilter, typeDropdown);
  const noBuilder =
    filter.type !== "custom" ? (
      <div style={{ width: "100%" }}>{typeDropdown}</div>
    ) : null;

  return (
    <BuilderRow>
      {custom.builder}
      {noBuilder}
    </BuilderRow>
  );
};

const BuilderRow = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: row;
  padding: 0 15px;
  width: calc(100% - 30px);
`;

const Column = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  width: 100%;
`;

function useBooleanCustomBuilder(
  filter: BooleanFilter,
  setFilter: (filter: BooleanCustomFilter) => void,
  typeDropdown: ReactElement
) {
  if (filter.type !== "custom") {
    return { builder: null, util: null };
  }

  const builder = (
    <Column>
      {typeDropdown}
      <CodeInput
        value={filter.partial}
        setValue={(partial) => setFilter({ type: "custom", partial })}
        placeholder="!= null"
      />
    </Column>
  );

  return { builder };
}
