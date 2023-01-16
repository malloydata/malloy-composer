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
import { CodeInput } from "../CodeInput";
import {
  Button,
  ContextMenuMain,
  RightButtonRow,
  ContextMenuTitle,
} from "../CommonElements";

interface AddNewNestProps {
  addNest: (name: string) => void;
  onComplete: () => void;
}

export const AddNewNest: React.FC<AddNewNestProps> = ({
  addNest,
  onComplete,
}) => {
  const [name, setName] = useState("");
  return (
    <ContextMenuMain>
      <ContextMenuTitle>New Nested Query</ContextMenuTitle>
      <form>
        <CodeInput
          value={name}
          setValue={setName}
          placeholder="query_name"
          autoFocus={true}
        />
        <RightButtonRow>
          <Button type="button" color="secondary" onClick={onComplete}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              addNest(name);
              onComplete();
            }}
          >
            Save
          </Button>
        </RightButtonRow>
      </form>
    </ContextMenuMain>
  );
};
