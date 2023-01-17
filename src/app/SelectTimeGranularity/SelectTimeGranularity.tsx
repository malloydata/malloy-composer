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
import {
  Button,
  ContextMenuMain,
  RightButtonRow,
  ContextMenuTitle,
  FormFieldList,
} from "../CommonElements";
import { FieldDef, StructDef } from "@malloydata/malloy";
import { FieldButton } from "../FieldButton";
import { kindOfField, typeOfField } from "../utils";
import { TypeIcon } from "../TypeIcon";
import { SelectDropdown } from "../SelectDropdown";
import { maybeQuoteIdentifier } from "../../core/utils";

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
              {
                label: <Label detail="(1-366)">Day of year</Label>,
                value: "extract_day_of_year",
                divider: true,
              },
              {
                label: <Label detail="(1-31)">Day of month</Label>,
                value: "extract_day",
              },
              {
                label: <Label detail="(1-7)">Day of week</Label>,
                value: "extract_day_of_week",
              },
              {
                label: <Label detail="(1-53)">Week in year</Label>,
                value: "extract_week",
              },
              {
                label: <Label detail="(1-12)">Month in year</Label>,
                value: "extract_month",
              },
              {
                label: <Label detail="(1-4)">Quarter in year</Label>,
                value: "extract_quarter",
              },
              {
                label: <Label detail="(0-23)">Hour of day</Label>,
                value: "extract_hour",
              },
              {
                label: <Label detail="(0-59)">Minute of hour</Label>,
                value: "extract_minute",
              },
              {
                label: <Label detail="(0-59)">Seconds of minute</Label>,
                value: "extract_seconds",
              },
              { label: "Field values", value: "", divider: true },
            ]}
            width={300}
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
                if (granularity.startsWith("extract_")) {
                  const fun = granularity.substring("extract_".length);
                  addGroupBy(
                    `${path}_${fun}`,
                    `${fun}(${maybeQuoteIdentifier(path)})`
                  );
                } else {
                  addGroupBy(
                    `${path}_${granularity}`,
                    `${maybeQuoteIdentifier(path)}.${granularity}`
                  );
                }
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

interface LabelProps {
  detail: string;
}

const Label: React.FC<LabelProps> = ({ children, detail }) => {
  return (
    <span>
      {children} <Detail>{detail}</Detail>
    </span>
  );
};

const Detail = styled.span`
  color: #939393;
`;
