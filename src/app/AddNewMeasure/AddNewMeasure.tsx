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
  string: ["count_distinct"],
  number: ["count_distinct", "avg", "sum", "min", "max"],
  date: ["count_distinct", "min", "max"],
  timestamp: ["count_distinct", "min", "max"],
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
];

type FlatField = { field: FieldDef; path: string };

enum Mode {
  FIELD,
  COUNT,
  CUSTOM,
}

export const AddNewMeasure: React.FC<AddMeasureProps> = ({
  source,
  addMeasure,
  onComplete,
  initialCode,
  initialName,
}) => {
  // TODO(willscullin) Need to parse initialCode to determine if
  // non-custom display can be used.
  const [mode, setMode] = useState(initialName ? Mode.CUSTOM : Mode.FIELD);
  const [measure, setMeasure] = useState(initialCode || "");
  const [newName, setNewName] = useState(initialName || "");
  const [measureType, setMeasureType] = useState<MeasureType>();
  const [flatField, setFlatField] = useState<FlatField>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (mode === Mode.FIELD && flatField && measureType) {
      const newMeasure = generateMeasure(measureType, flatField.path);
      if (newMeasure) {
        setMeasure(newMeasure);
      }
    } else if (mode === Mode.COUNT) {
      setMeasure("count()");
    }
  }, [mode, measureType, flatField]);

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
          <FormItem>
            <FormInputLabel>Type</FormInputLabel>
            <SelectDropdown
              value={mode}
              options={[
                { label: "From a field", value: Mode.FIELD },
                { label: "Count", value: Mode.COUNT },
                { label: "Custom", value: Mode.CUSTOM },
              ]}
              onChange={(value) => setMode(value)}
              width={300}
            />
          </FormItem>
          {mode == Mode.FIELD && (
            <FormItem>
              <FormInputLabel>Field</FormInputLabel>
              <SelectDropdown
                autoFocus={true}
                value={flatField}
                options={flattened}
                onChange={(value) => setFlatField(value)}
                width={300}
              />
            </FormItem>
          )}
          {mode == Mode.FIELD && (
            <FormItem>
              <FormInputLabel>Type</FormInputLabel>
              <SelectDropdown
                value={measureType}
                options={
                  flatField
                    ? MEASURE_OPTIONS.filter(({ value }) =>
                        isAggregate(flatField.field)
                          ? value === "percent"
                          : VALID_MEASURES[flatField.field.type].includes(value)
                      )
                    : []
                }
                onChange={(value) => setMeasureType(value)}
                width={300}
              />
            </FormItem>
          )}
          {mode === Mode.CUSTOM && (
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
              placeholder="new_measure"
              label="Name"
            />
          )}
        </FormFieldList>
        <FormError error={error} />
        <RightButtonRow>
          <Button type="button" color="secondary" onClick={onComplete}>
            Cancel
          </Button>
          <Button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!newName) {
                return setError(new Error("Enter a name"));
              }
              if (mode === Mode.CUSTOM) {
                if (!measure) {
                  return setError(new Error("Enter a definition"));
                }
              } else if (mode === Mode.FIELD) {
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
