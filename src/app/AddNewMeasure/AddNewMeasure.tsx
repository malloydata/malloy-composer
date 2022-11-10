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

import { useEffect, useState } from "react";
import { compileMeasure } from "../../core/compile";
import { CodeInput, CodeTextArea } from "../CodeInput";
import {
  Button,
  ContextMenuTitle,
  ContextMenuMain,
  RightButtonRow,
  FormError,
  FormFieldList,
  FormInputLabel,
  FormItem,
} from "../CommonElements";
import { SelectDropdown } from "../SelectDropdown/SelectDropdown";
import { QueryFieldDef, StructDef } from "@malloydata/malloy";

interface AddMeasureProps {
  source: StructDef;
  addMeasure: (measure: QueryFieldDef) => void;
  onComplete: () => void;
  initialCode?: string;
  initialName?: string;
}

type MeasureType =
  | "count"
  | "distinct"
  | "max"
  | "min"
  | "average"
  | "sum"
  | "percent"
  | "custom";

const COUNT_TYPES: MeasureType[] = ["count", "percent"];

export const AddNewMeasure: React.FC<AddMeasureProps> = ({
  source,
  addMeasure,
  onComplete,
  initialCode,
  initialName,
}) => {
  const [measure, setMeasure] = useState(initialCode || "");
  const [newName, setNewName] = useState(initialName || "");
  const [measureType, setMeasureType] = useState<MeasureType>("count");
  const [field, setField] = useState<string>("");
  const [error, setError] = useState<Error>();

  useEffect(() => {
    switch (measureType) {
      case "count":
        setMeasure("count()");
        break;
      case "distinct":
        setMeasure(`count(distinct \`${field}\`)`);
        break;
      case "min":
      case "max":
      case "average":
      case "sum":
        setMeasure(`${measureType}(\`${field}\`)`);
        break;
      case "percent":
        setMeasure(`count() / all(count(), \`${field}\`) * 100.0`);
        break;
    }
  }, [measureType, field]);

  const fields = source.fields
    .reduce<Array<{ label: string; value: string }>>((acc, { type, name }) => {
      if (COUNT_TYPES.includes(measureType) || type === "number") {
        acc.push({ label: name, value: name });
      }
      return acc;
    }, [])
    .sort((a, b) => a.label.localeCompare(b.label));

  const needsName = initialCode === undefined;
  return (
    <ContextMenuMain>
      <ContextMenuTitle>{needsName ? "New" : "Edit"} measure</ContextMenuTitle>
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
          <FormItem>
            <FormInputLabel>Type</FormInputLabel>
            <SelectDropdown
              value={measureType}
              options={[
                { label: "Count", value: "count" },
                {
                  label: "Count Distinct",
                  value: "distinct",
                },
                { label: "Sum", value: "sum" },
                { label: "Average", value: "average" },
                { label: "Max", value: "max" },
                { label: "Min", value: "min" },
                {
                  label: "Percent of All",
                  value: "percent",
                  divider: true,
                },
                {
                  label: "Custom",
                  value: "custom",
                  divider: true,
                },
              ]}
              onChange={(value) => setMeasureType(value as MeasureType)}
              width={300}
            />
          </FormItem>
          {measureType === "custom" ? (
            <CodeTextArea
              value={measure}
              setValue={setMeasure}
              placeholder="some_field * 10"
              label={needsName ? "Definition" : undefined}
              rows={3}
            />
          ) : measureType === "count" ? null : (
            <FormItem>
              <FormInputLabel>Field to measure</FormInputLabel>
              <SelectDropdown
                value={field}
                options={fields}
                onChange={(value) => setField(value)}
                width={300}
              />
            </FormItem>
          )}
        </FormFieldList>
        <FormError error={error} />
        <RightButtonRow>
          <Button
            type="submit"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!newName) {
                return setError(new Error("Enter a name"));
              }
              if (measureType === "custom") {
                if (!measure) {
                  return setError(new Error("Enter a definition"));
                }
              } else {
                if (!field) {
                  return setError(new Error("Select a field"));
                }
              }
              compileMeasure(source, newName, measure)
                .then((measure) => {
                  addMeasure(measure);
                  onComplete();
                })
                .catch((error) => {
                  setError(error);
                });
            }}
          >
            Done
          </Button>
        </RightButtonRow>
      </form>
    </ContextMenuMain>
  );
};
