/*
 * Copyright 2022 Google LLC
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
import {
  Button,
  ContextMenuMain,
  RightButtonRow,
  ContextMenuTitle,
  FormFieldList,
} from "../CommonElements";
import { FieldDef, StructDef } from "@malloydata/malloy";
import { FieldButton } from "../FieldButton";
import { kindOfField, quoteIdentifier, typeOfField } from "../utils";
import { TypeIcon } from "../TypeIcon";
import { SelectDropdown } from "../SelectDropdown";

interface SelectTimeGranularityProps {
  field: FieldDef;
  path: string;
  source: StructDef;
  addGroupBy: (name: string, expression?: string) => void;
  onComplete: () => void;
}

export const SelectTimeGranularity: React.FC<SelectTimeGranularityProps> = ({
  field,
  path,
  addGroupBy,
  onComplete,
}) => {
  const [granularity, setGranularity] = useState("year");
  const type = typeOfField(field);
  const kind = kindOfField(field);

  return (
    <ContextMenuMain>
      <ContextMenuTitle>
        Group by
        <FieldButton
          name={field.name}
          icon={<TypeIcon type={type} kind={kind} />}
          color={kind}
          disableHover={true}
        />
      </ContextMenuTitle>
      <form>
        <FormFieldList>
          <SelectDropdown
            value={granularity}
            options={[
              { label: "Year", value: "year" },
              { label: "Quarter", value: "quarter" },
              { label: "Month", value: "month" },
              { label: "Week", value: "week" },
              { label: "Day", value: "day" },
              { label: "Hour", value: "hour" },
              { label: "Minute", value: "minute" },
              { label: "Seconds", value: "seconds" },
              { label: "Field Values", value: "", divider: true },
            ]}
            onChange={setGranularity}
          />
        </FormFieldList>
        <RightButtonRow>
          <Button type="button" color="secondary" onClick={onComplete}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              if (granularity) {
                addGroupBy(
                  `${path}_${granularity}`,
                  `${quoteIdentifier(path)}.${granularity}`
                );
              } else {
                addGroupBy(path);
              }
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
