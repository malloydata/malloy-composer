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
import { useState } from "react";
import styled from "styled-components";
import { OrderByField } from "../../types";
import {
  Button,
  ContextMenuMain,
  ContextMenuTitle,
  FieldIcon,
  FieldLabel,
  FormFieldList,
  RightButtonRow,
  SmallFieldName,
} from "../CommonElements";
import { SelectList } from "../SelectDropdown/SelectDropdown";
import { TypeIcon } from "../TypeIcon";
import { kindOfField, typeOfField } from "../utils";

interface EditOrderByProps {
  byField: OrderByField;
  addOrderBy: (
    fieldIndex: number,
    direction: "asc" | "desc" | undefined
  ) => void;
  onComplete: () => void;
  initialDirection?: "asc" | "desc";
}

type Direction = "asc" | "desc";

export const EditOrderBy: React.FC<EditOrderByProps> = ({
  byField,
  addOrderBy,
  onComplete,
  initialDirection,
}) => {
  const [direction, setDirection] = useState<Direction | undefined>(
    initialDirection || "asc"
  );
  return (
    <ContextMenuMain>
      <ContextMenuTitle>
        Order By
        <FieldLabel>
          <FieldIcon color="dimension">
            <TypeIcon
              type={typeOfField(byField)}
              kind={kindOfField(byField)}
            ></TypeIcon>
          </FieldIcon>
          <SmallFieldName>{byField.name}</SmallFieldName>
        </FieldLabel>
      </ContextMenuTitle>
      <form>
        <FormFieldList>
          <OptionsRow>
            <SelectList
              options={[
                { value: "asc" as Direction, label: "Ascending" },
                { value: "desc" as Direction, label: "Descending" },
              ]}
              value={direction}
              onChange={setDirection}
            />
          </OptionsRow>
        </FormFieldList>
        <RightButtonRow>
          <Button type="button" color="secondary" onClick={onComplete}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (byField !== undefined) {
                addOrderBy(byField.fieldIndex, direction);
                onComplete();
              }
            }}
          >
            Save
          </Button>
        </RightButtonRow>
      </form>
    </ContextMenuMain>
  );
};

const OptionsRow = styled.div`
  display: flex;
  border: 1px solid #efefef;
  border-radius: 5px;
  overflow: hidden;
`;
