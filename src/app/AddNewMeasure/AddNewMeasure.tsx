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
  degenerateMeasure,
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
  let initialMode = Mode.FIELD;
  let initialField: FlatField;
  let initialType: MeasureType;
  if (initialCode) {
    const { measureType, field, path } = degenerateMeasure(source, initialCode);
    initialMode =
      measureType === "custom"
        ? Mode.CUSTOM
        : measureType === "count"
        ? Mode.COUNT
        : Mode.FIELD;
    if (field) {
      initialField = { field, path };
    }
    initialType = measureType;
  }
  const [mode, setMode] = useState(initialMode);
  const [measure, setMeasure] = useState(initialCode || "");
  const [newName, setNewName] = useState(initialName || "");
  const [measureType, setMeasureType] = useState<MeasureType>(initialType);
  const [flatField, setFlatField] = useState<FlatField>(initialField);

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
              autoFocus={true}
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
                value={flatField}
                valueEqual={(a, b) => a.path === b.path}
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
