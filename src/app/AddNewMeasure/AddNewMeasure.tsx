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

import { useEffect, useMemo, useState } from "react";
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
import { SelectDropdown } from "../SelectDropdown";
import { FieldDef, QueryFieldDef, StructDef } from "@malloydata/malloy";
import {
  generateMeasure,
  MeasureType,
  sortFlatFields,
} from "../../core/fields";
import { FieldButton } from "../FieldButton";
import { TypeIcon } from "../TypeIcon";
import {
  flatFields,
  isAggregate,
  kindOfField,
  pathParent,
  typeOfField,
} from "../utils";

interface AddMeasureProps {
  source: StructDef;
  addMeasure: (measure: QueryFieldDef) => void;
  onComplete: () => void;
  initialCode?: string;
  initialName?: string;
}

const VALID_MEASURES: Record<
  "string" | "number" | "date" | "timestamp",
  MeasureType[]
> = {
  string: ["count_distinct", "custom"],
  number: ["count_distinct", "avg", "sum", "min", "max", "custom"],
  date: ["count_distinct", "min", "max", "custom"],
  timestamp: ["count_distinct", "min", "max", "custom"],
};

const MEASURE_OPTIONS: {
  label: string;
  value: MeasureType;
  divider?: boolean;
}[] = [
  {
    label: "Count Distinct",
    value: "count_distinct",
  },
  { label: "Sum", value: "sum" },
  { label: "Average", value: "avg" },
  { label: "Max", value: "max" },
  { label: "Min", value: "min" },
  {
    label: "Percent of All",
    value: "percent",
  },
  {
    label: "Custom",
    value: "custom",
    divider: true,
  },
];

type FlatField = { field: FieldDef; path: string };

export const AddNewMeasure: React.FC<AddMeasureProps> = ({
  source,
  addMeasure,
  onComplete,
  initialCode,
  initialName,
}) => {
  const [measure, setMeasure] = useState(initialCode || "");
  const [newName, setNewName] = useState(initialName || "");
  const [measureType, setMeasureType] = useState<MeasureType>(
    // TODO(willscullin) Need to parse initialCode to determine if
    // non-custom display can be used.
    initialName ? "custom" : undefined
  );
  const [flatField, setFlatField] = useState<FlatField>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (flatField && measureType) {
      const newMeasure = generateMeasure(measureType, flatField.path);
      if (newMeasure) {
        setMeasure(newMeasure);
      }
    }
  }, [measureType, flatField]);

  const flattened = useMemo(
    () =>
      sortFlatFields(flatFields(source)).reduce<
        Array<{ label: JSX.Element; value: FlatField }>
      >((acc, { path, field }) => {
        const type = typeOfField(field);
        const kind = kindOfField(field);

        if (["dimension", "measure"].includes(kind)) {
          const label = (
            <FieldButton
              name={field.name}
              icon={<TypeIcon type={type} kind={kind} />}
              color={kind}
              detail={pathParent(path)}
              disableHover={true}
            />
          );
          acc.push({ label, value: { field, path } });
        }
        return acc;
      }, []),
    [source]
  );

  const needsName = initialCode === undefined;
  return (
    <ContextMenuMain>
      <ContextMenuTitle>{needsName ? "New" : "Edit"} measure</ContextMenuTitle>
      <form>
        <FormFieldList>
          {!initialName && (
            <FormItem>
              <FormInputLabel>Field to measure</FormInputLabel>
              <SelectDropdown
                autoFocus={true}
                value={flatField}
                options={flattened}
                onChange={(value) => setFlatField(value)}
                width={300}
              />
            </FormItem>
          )}
          {flatField && (
            <FormItem>
              <FormInputLabel>Type</FormInputLabel>
              <SelectDropdown
                value={measureType}
                options={MEASURE_OPTIONS.filter(
                  ({ value }) =>
                    (isAggregate(flatField.field)
                      ? value === "percent"
                      : VALID_MEASURES[flatField.field.type].includes(value)) ||
                    value === "custom"
                )}
                onChange={(value) => setMeasureType(value)}
                width={300}
              />
            </FormItem>
          )}
          {measureType === "custom" && (
            <CodeTextArea
              autoFocus={!!initialName}
              value={measure}
              setValue={setMeasure}
              placeholder="count() * items_per_count"
              label={needsName ? "Definition" : undefined}
              rows={3}
            />
          )}
          {needsName && (
            <CodeInput
              value={newName}
              setValue={setNewName}
              placeholder="New_Measure_Name"
              label="Name"
            />
          )}
        </FormFieldList>
        <FormError error={error} />
        <RightButtonRow>
          <Button color="secondary" onClick={onComplete}>
            Cancel
          </Button>
          <Button
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
                if (!flatField) {
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
