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
import { compileDimension } from "../../core/compile";
import { CodeInput } from "../CodeInput";
import {
  Button,
  ContextMenuMain,
  RightButtonRow,
  ContextMenuTitle,
  FormError,
  FormFieldList,
} from "../CommonElements";
import { QueryFieldDef, StructDef } from "@malloydata/malloy";

interface AddFilterProps {
  source: StructDef;
  addDimension: (dimension: QueryFieldDef) => void;
  onComplete: () => void;
  initialCode?: string;
  initialName?: string;
}

export const AddNewDimension: React.FC<AddFilterProps> = ({
  source,
  addDimension,
  onComplete,
  initialCode,
  initialName,
}) => {
  const [dimension, setDimension] = useState(initialCode || "");
  const [newName, setNewName] = useState(initialName || "");
  const [error, setError] = useState<Error>();
  const needsName = initialCode === undefined;
  return (
    <ContextMenuMain>
      <ContextMenuTitle>
        {needsName ? "New" : "Edit"} Dimension
      </ContextMenuTitle>
      <form>
        <FormFieldList>
          {needsName && (
            <CodeInput
              value={newName}
              setValue={setNewName}
              placeholder="field name"
              label="Field Name"
              autoFocus={true}
            />
          )}
          <CodeInput
            value={dimension}
            setValue={setDimension}
            placeholder="some_field * 10"
            label={needsName ? "Definition" : undefined}
          />
        </FormFieldList>
        <FormError error={error} />
        <RightButtonRow>
          <Button type="button" color="secondary" onClick={onComplete}>
            Cancel
          </Button>
          <Button
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              compileDimension(source, newName, dimension)
                .then((dimension) => {
                  addDimension(dimension);
                  onComplete();
                })
                .catch(setError);
            }}
          >
            Save
          </Button>
        </RightButtonRow>
      </form>
    </ContextMenuMain>
  );
};
