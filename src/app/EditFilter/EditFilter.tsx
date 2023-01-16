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
import { FilterExpression, StructDef } from "@malloydata/malloy";
import { useState } from "react";
import { compileFilter } from "../../core/compile";
import { CodeTextArea } from "../CodeInput";
import {
  Button,
  RightButtonRow,
  ContextMenuMain,
  ContextMenuTitle,
} from "../CommonElements";

interface EditFilterProps {
  source: StructDef;
  existing: string;
  editFilter: (filter: FilterExpression) => void;
  onComplete: () => void;
}

export const EditFilter: React.FC<EditFilterProps> = ({
  existing,
  editFilter,
  source,
  onComplete,
}) => {
  const [filter, setFilter] = useState(existing);
  return (
    <ContextMenuMain>
      <ContextMenuTitle>Edit Filter</ContextMenuTitle>
      <form>
        <CodeTextArea
          value={filter}
          setValue={setFilter}
          placeholder="filter_expression"
          autoFocus={true}
          rows={3}
        />
        <RightButtonRow>
          <Button type="button" color="secondary" onClick={onComplete}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              compileFilter(source, filter).then((filterExpression) => {
                editFilter(filterExpression);
                onComplete();
              });
            }}
          >
            Save
          </Button>
        </RightButtonRow>
      </form>
    </ContextMenuMain>
  );
};
