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
import { CodeInput } from "../CodeInput";
import { Button, ButtonAndInputRow, ContextMenuTitle } from "../CommonElements";
import { Popover } from "../Popover";

interface SaveQueryPopoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  saveQuery: (name: string) => void;
}

export const SaveQueryPopover: React.FC<SaveQueryPopoverProps> = ({
  saveQuery,
  open,
  setOpen,
}) => {
  const [name, setName] = useState("");
  return (
    <Popover open={open} setOpen={setOpen}>
      <Content>
        <ContextMenuTitle>Save Query</ContextMenuTitle>
        <ButtonAndInputRow>
          <CodeInput
            value={name}
            setValue={setName}
            placeholder="query_name"
            autoFocus={true}
          />
          <Button
            onClick={() => {
              saveQuery(name);
              setName("");
            }}
          >
            Save
          </Button>
        </ButtonAndInputRow>
      </Content>
    </Popover>
  );
};

const Content = styled.div`
  padding: 15px;
`;

interface UseSaveQueryPopoverResult {
  saveQueryPopover: JSX.Element;
  openSaveQueryPopover: () => void;
}

export function useSaveQueryPopover({
  saveQuery,
}: {
  saveQuery: (name: string) => void;
}): UseSaveQueryPopoverResult {
  const [open, setOpen] = useState(false);

  const saveQueryPopover = (
    <SaveQueryPopover
      open={open}
      setOpen={setOpen}
      saveQuery={(name) => {
        saveQuery(name);
        setOpen(false);
      }}
    />
  );

  return { saveQueryPopover, openSaveQueryPopover: () => setOpen(true) };
}
