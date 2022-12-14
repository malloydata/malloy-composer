/*
 * Copyright 2021 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import { useState } from "react";
import { CodeInput } from "../CodeInput";
import {
  Button,
  ContextMenuMain,
  ContextMenuTitle,
  ButtonAndInputRow,
} from "../CommonElements";

interface LimitContextBarProps {
  existing?: number;
  addLimit: (limit: number) => void;
  onComplete: () => void;
}

export const AddLimit: React.FC<LimitContextBarProps> = ({
  existing,
  addLimit,
  onComplete,
}) => {
  const [limit, setLimit] = useState(existing?.toString() || "10");
  return (
    <ContextMenuMain>
      <ContextMenuTitle>Limit</ContextMenuTitle>
      <ButtonAndInputRow>
        <CodeInput
          value={limit}
          setValue={setLimit}
          autoFocus={true}
          autoSelect={true}
        />{" "}
        <Button type="button" color="secondary" onClick={onComplete}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const parsed = parseInt(limit);
            if (!Number.isNaN(parsed)) {
              addLimit(parsed);
              onComplete();
            }
          }}
        >
          Save
        </Button>
      </ButtonAndInputRow>
    </ContextMenuMain>
  );
};
