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
import * as React from 'react';
import {useContext, useEffect, useMemo, useState} from 'react';
import {CodeInput, CodeTextArea} from '../CodeInput';
import {
  Button,
  ContextMenuTitle,
  ContextMenuMain,
  RightButtonRow,
  FormError,
  FormFieldList,
  FormInputLabel,
  FormItem,
} from '../CommonElements';
import {SelectDropdown} from '../SelectDropdown';
import {
  FieldDef,
  isLeafAtomic,
  QueryFieldDef,
  SourceDef,
} from '@malloydata/malloy';
import {
  degenerateAggregate,
  degenerateCalculate,
  generateAggregate,
  generateCalculate,
  AggregateType,
  CalculateType,
  sortFlatFields,
} from '../../core/fields';
import {FieldButton} from '../FieldButton';
import {TypeIcon} from '../TypeIcon';
import {
  flatFields,
  isAggregate,
  kindOfField,
  pathParent,
  typeOfField,
} from '../../utils';
import {ComposerOptionsContext} from '../../contexts';
import {maybeQuoteIdentifier} from '../../core/utils';
import {PropertyType} from '../../types';

interface AddMeasureProps {
  source: SourceDef;
  addMeasure: (measure: QueryFieldDef) => void;
  onComplete: () => void;
  initialCode?: string;
  initialName?: string;
  initialProperty?: PropertyType;
}

type FieldTypes =
  | 'string'
  | 'number'
  | 'date'
  | 'timestamp'
  | 'boolean'
  | 'json'
  | 'sql native'
  | 'record'
  | 'array'
  | 'table'
  | 'sql_select'
  | 'error'
  | 'query_source'
  | 'turtle';

const VALID_MEASURES: Record<
  FieldTypes,
  Array<AggregateType | CalculateType>
> = {
  string: ['count_distinct', 'first_value', 'last_value'],
  number: [
    'count_distinct',
    'avg',
    'sum',
    'min',
    'max',
    'first_value',
    'last_value',
    'avg_moving',
    'max_cumulative',
    'max_window',
    'min_cumulative',
    'min_window',
    'row_number',
    'sum_cumulative',
    'sum_moving',
    'sum_window',
  ],
  date: ['count_distinct', 'min', 'max', 'first_value', 'last_value'],
  timestamp: ['count_distinct', 'min', 'max', 'first_value', 'last_value'],
  boolean: ['count_distinct', 'first_value', 'last_value'],
  json: ['count_distinct', 'first_value', 'last_value'],
  'sql native': ['count_distinct', 'first_value', 'last_value'],
  record: [],
  array: [],
  table: [],
  error: [],
  sql_select: [],
  query_source: [],
  turtle: [],
};

const MEASURE_OPTIONS: {
  label: string;
  value: {measureType: AggregateType | CalculateType; property: PropertyType};
  divider?: boolean;
}[] = [
  {
    label: 'Count Distinct',
    value: {measureType: 'count_distinct', property: 'aggregate'},
  },
  {label: 'Sum', value: {measureType: 'sum', property: 'aggregate'}},
  {label: 'Average', value: {measureType: 'avg', property: 'aggregate'}},
  {label: 'Max', value: {measureType: 'max', property: 'aggregate'}},
  {label: 'Min', value: {measureType: 'min', property: 'aggregate'}},
  {
    label: 'Percent of All',
    value: {measureType: 'percent', property: 'aggregate'},
  },
  {
    label: 'Row Number',
    value: {measureType: 'row_number', property: 'calculate'},
  },
  {label: 'Rank', value: {measureType: 'rank', property: 'calculate'}},
  {
    label: 'First Value',
    value: {measureType: 'first_value', property: 'calculate'},
    divider: true,
  },
  {
    label: 'Last Value',
    value: {measureType: 'last_value', property: 'calculate'},
  },
  {
    label: 'Max Cumulative',
    value: {measureType: 'max_cumulative', property: 'calculate'},
    divider: true,
  },
  {
    label: 'Sum Cumulative',
    value: {measureType: 'sum_cumulative', property: 'calculate'},
  },
  {
    label: 'Max Window',
    value: {measureType: 'max_window', property: 'calculate'},
  },
  {
    label: 'Min Window',
    value: {measureType: 'min_window', property: 'calculate'},
  },
  {
    label: 'Sum Window',
    value: {measureType: 'sum_window', property: 'calculate'},
  },
  {
    label: 'Lag',
    value: {measureType: 'lag', property: 'calculate'},
    divider: true,
  },
  {label: 'Lead', value: {measureType: 'lead', property: 'calculate'}},
  {
    label: 'Average Moving',
    value: {measureType: 'avg_moving', property: 'calculate'},
    divider: true,
  },
  {
    label: 'Sum Moving',
    value: {measureType: 'sum_moving', property: 'calculate'},
  },
];

type FlatField = {field: FieldDef; path: string};

enum Mode {
  FIELD,
  COUNT,
  ROW_NUMBER,
  RANK,
  CUSTOM,
}

export const AddNewMeasure: React.FC<AddMeasureProps> = ({
  source,
  addMeasure,
  onComplete,
  initialCode,
  initialName,
  initialProperty,
}) => {
  const {dummyCompiler} = useContext(ComposerOptionsContext);
  let initialMode = Mode.FIELD;
  let initialField: FlatField | undefined;
  let initialType: AggregateType | CalculateType | undefined;
  if (initialCode) {
    const {measureType, field, path} =
      initialProperty === 'aggregate'
        ? degenerateAggregate(source, initialCode)
        : degenerateCalculate(source, initialCode);
    initialMode =
      measureType === 'custom'
        ? Mode.CUSTOM
        : measureType === 'count'
        ? Mode.COUNT
        : measureType === 'row_number'
        ? Mode.ROW_NUMBER
        : measureType === 'rank'
        ? Mode.RANK
        : Mode.FIELD;
    if (field) {
      initialField = {field, path};
    }
    initialType = measureType;
  }
  const [mode, setMode] = useState(initialMode);
  const [measure, setMeasure] = useState(initialCode || '');
  const [newName, setNewName] = useState(initialName || '');
  const [measureType, setMeasureType] = useState<
    AggregateType | CalculateType | undefined
  >(initialType);
  const [property, setProperty] = useState<PropertyType>(
    initialProperty || 'aggregate'
  );
  const [flatField, setFlatField] = useState<FlatField | undefined>(
    initialField
  );

  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (mode === Mode.FIELD && flatField && measureType) {
      const newMeasure =
        property === 'aggregate'
          ? generateAggregate(measureType as AggregateType, flatField.path)
          : generateCalculate(measureType as CalculateType, flatField.path);
      if (newMeasure) {
        setMeasure(newMeasure);
      }
    } else if (mode === Mode.COUNT) {
      setMeasure('count()');
    } else if (mode === Mode.ROW_NUMBER) {
      setMeasure('row_number()');
    } else if (mode === Mode.RANK) {
      setMeasure('rank()');
    }
  }, [mode, measureType, flatField, property]);

  const flattened = useMemo(
    () =>
      sortFlatFields(flatFields(source)).reduce<
        Array<{label: JSX.Element; value: FlatField}>
      >((acc, {path, field}) => {
        const type = typeOfField(field);
        const kind = kindOfField(field);

        if (['dimension', 'measure'].includes(kind)) {
          const label = (
            <FieldButton
              name={field.name}
              icon={<TypeIcon type={type} kind={kind} />}
              color={kind}
              detail={pathParent(path)}
              disableHover={true}
            />
          );
          acc.push({label, value: {field, path}});
        }
        return acc;
      }, []),
    [source]
  );

  const needsName = initialCode === undefined;

  return (
    <ContextMenuMain>
      <ContextMenuTitle>{needsName ? 'New' : 'Edit'} measure</ContextMenuTitle>
      <form>
        <FormFieldList>
          <FormItem>
            <FormInputLabel>Type</FormInputLabel>
            <SelectDropdown
              autoFocus={true}
              value={mode}
              options={[
                {label: 'From a field', value: Mode.FIELD},
                {label: 'Count', value: Mode.COUNT, divider: true},
                {label: 'Row Number', value: Mode.ROW_NUMBER},
                {label: 'Rank', value: Mode.RANK},
                {label: 'Custom', value: Mode.CUSTOM, divider: true},
              ]}
              onChange={value => setMode(value)}
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
                onChange={value => setFlatField(value)}
                width={300}
              />
            </FormItem>
          )}
          {mode == Mode.FIELD && (
            <FormItem>
              <FormInputLabel>Type</FormInputLabel>
              <SelectDropdown
                value={{measureType, property}}
                options={
                  flatField
                    ? MEASURE_OPTIONS.filter(({value}) =>
                        isAggregate(flatField.field) && property === 'aggregate'
                          ? value.measureType === 'percent'
                          : VALID_MEASURES[flatField.field.type].includes(
                              value.measureType
                            )
                      )
                    : []
                }
                onChange={({measureType, property}) => {
                  setMeasureType(measureType);
                  setProperty(property);
                }}
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
              label={needsName ? 'Definition' : undefined}
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
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              if (!newName) {
                return setError(new Error('Enter a name'));
              }
              if (mode === Mode.CUSTOM) {
                if (!measure) {
                  return setError(new Error('Enter a definition'));
                }
              } else if (mode === Mode.FIELD) {
                if (!flatField) {
                  return setError(new Error('Select a field'));
                }
              }
              dummyCompiler
                .compileMeasure(source, maybeQuoteIdentifier(newName), measure)
                .then(measure => {
                  if (isLeafAtomic(measure)) {
                    addMeasure(measure);
                    onComplete();
                  }
                })
                .catch(error => {
                  setError(error);
                });
              return undefined;
            }}
          >
            Save
          </Button>
        </RightButtonRow>
      </form>
    </ContextMenuMain>
  );
};
