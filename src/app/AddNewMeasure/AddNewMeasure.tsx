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
import {
  generateMeasure,
  getFieldType,
  MeasureType,
  sortFields,
} from "../../core/fields";
import { FieldButton } from "../FieldButton";
import { TypeIcon } from "../TypeIcon";

interface AddMeasureProps {
  source: StructDef;
  addMeasure: (measure: QueryFieldDef) => void;
  onComplete: () => void;
  initialCode?: string;
  initialName?: string;
}

const COUNT_TYPES: MeasureType[] = ["count", "distinct", "percent"];

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
    const newMeasure = generateMeasure(measureType, field);
    if (newMeasure) {
      setMeasure(newMeasure);
    }
  }, [measureType, field]);

  const fields = sortFields(source.fields).reduce<
    Array<{ label: JSX.Element; value: string }>
  >((acc, field) => {
    const { type, kind } = getFieldType(field);

    if (
      kind === "dimension" &&
      (COUNT_TYPES.includes(measureType) || type === "number")
    ) {
      const label = (
        <FieldButton
          name={field.name}
          icon={<TypeIcon type={type} kind={kind} />}
          color={kind}
          disableHover={true}
        />
      );
      acc.push({ label, value: field.name });
    }
    return acc;
  }, []);

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
              placeholder="count() * items_per_count"
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
          <Button color="secondary" onClick={() => onComplete()}>
            Cancel
          </Button>
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
            Save
          </Button>
        </RightButtonRow>
      </form>
    </ContextMenuMain>
  );
};
