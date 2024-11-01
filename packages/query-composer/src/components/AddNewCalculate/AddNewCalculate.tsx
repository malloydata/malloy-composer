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
  CalculateType,
  degenerateCalculate,
  generateCalculate,
  sortFlatFields,
} from '../../core/fields';
import {FieldButton} from '../FieldButton';
import {TypeIcon} from '../TypeIcon';
import {flatFields, kindOfField, pathParent, typeOfField} from '../../utils';
import {ComposerOptionsContext} from '../ExploreQueryEditor/ExploreQueryEditor';
import {maybeQuoteIdentifier} from '../../core/utils';

interface AddCalculateProps {
  source: SourceDef;
  addCalculate: (calculate: QueryFieldDef) => void;
  onComplete: () => void;
  initialCode?: string;
  initialName?: string;
}

const VALID_CALCULATES: Record<
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
  | 'turtle',
  CalculateType[]
> = {
  string: ['first_value', 'last_value'],
  number: [
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
  date: ['first_value', 'last_value'],
  timestamp: ['first_value', 'last_value'],
  boolean: ['first_value', 'last_value'],
  json: ['first_value', 'last_value'],
  'sql native': ['first_value', 'last_value'],
  record: ['first_value', 'last_value'],
  array: ['first_value', 'last_value'],
  table: ['first_value', 'last_value'],
  error: [],
  sql_select: [],
  query_source: [],
  turtle: [],
};

const CALCULATE_OPTIONS: {
  label: string;
  value: CalculateType;
  divider?: boolean;
}[] = [
  {label: 'Row Number', value: 'row_number'},
  {label: 'Rank', value: 'rank'},
  {label: 'First Value', value: 'first_value', divider: true},
  {label: 'Last Value', value: 'last_value'},
  {label: 'Max Cumulative', value: 'max_cumulative'},
  {label: 'Max Window', value: 'max_window'},
  {label: 'Min Window', value: 'min_window'},
  {label: 'Sum Cumulative', value: 'sum_cumulative'},
  {label: 'Sum Window', value: 'sum_window'},
  {label: 'Lag', value: 'lag', divider: true},
  {label: 'Lead', value: 'lead'},
  {label: 'Average Moving', value: 'avg_moving', divider: true},
  {label: 'Sum Moving', value: 'sum_moving'},
];

type FlatField = {field: FieldDef; path: string};

enum Mode {
  ROW_NUMBER,
  RANK,
  FIELD,
  CUSTOM,
}

export const AddNewCalculate: React.FC<AddCalculateProps> = ({
  source,
  addCalculate,
  onComplete,
  initialCode,
  initialName,
}) => {
  const {dummyCompiler} = useContext(ComposerOptionsContext);
  let initialMode = Mode.FIELD;
  let initialField: FlatField | undefined;
  let initialType: CalculateType | undefined;
  if (initialCode) {
    const {calculateType, field, path} = degenerateCalculate(
      source,
      initialCode
    );
    initialMode =
      calculateType === 'custom'
        ? Mode.CUSTOM
        : calculateType === 'row_number'
        ? Mode.ROW_NUMBER
        : calculateType === 'rank'
        ? Mode.RANK
        : Mode.FIELD;
    if (field) {
      initialField = {field, path};
    }
    initialType = calculateType;
  }
  const [mode, setMode] = useState(initialMode);
  const [measure, setCalculate] = useState(initialCode || '');
  const [newName, setNewName] = useState(initialName || '');
  const [calculateType, setCalculateType] = useState<CalculateType | undefined>(
    initialType
  );
  const [flatField, setFlatField] = useState<FlatField | undefined>(
    initialField
  );

  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (mode === Mode.FIELD && flatField && calculateType) {
      const newCalculate = generateCalculate(calculateType, flatField.path);
      if (newCalculate) {
        setCalculate(newCalculate);
      }
    } else if (mode === Mode.ROW_NUMBER) {
      setCalculate('row_number()');
    } else if (mode === Mode.RANK) {
      setCalculate('rank()');
    }
  }, [mode, calculateType, flatField]);

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
                {label: 'Row Number', value: Mode.ROW_NUMBER},
                {label: 'Rank', value: Mode.RANK},
                {label: 'Custom', value: Mode.CUSTOM},
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
                value={calculateType}
                options={
                  flatField
                    ? CALCULATE_OPTIONS.filter(({value}) =>
                        VALID_CALCULATES[flatField.field.type].includes(value)
                      )
                    : []
                }
                onChange={value => setCalculateType(value)}
                width={300}
              />
            </FormItem>
          )}
          {mode === Mode.CUSTOM && (
            <CodeTextArea
              autoFocus={!!initialName}
              value={measure}
              setValue={setCalculate}
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
                .compileCalculate(
                  source,
                  maybeQuoteIdentifier(newName),
                  measure
                )
                .then(measure => {
                  if (isLeafAtomic(measure)) {
                    addCalculate(measure);
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
