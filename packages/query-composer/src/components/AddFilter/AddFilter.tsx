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
import {FieldDef, FilterCondition, StructDef} from '@malloydata/malloy';
import {useContext, useState} from 'react';
import {CodeInput} from '../CodeInput';
import {
  Button,
  ContextMenuTitle,
  FieldIcon,
  SmallFieldName,
  FormFieldList,
  RightButtonRow,
  FieldLabel,
  FormInputLabel,
} from '../CommonElements';
import {TypeIcon} from '../TypeIcon';
import {StringFilterBuilder} from './StringFilterBuilder';
import {
  BooleanFilter,
  Filter,
  NumberFilter,
  StringFilter,
  TimeFilter,
} from '../../types';
import {
  booleanFilterToString,
  numberFilterToString,
  stringFilterToString,
  timeFilterToString,
} from '../../core/filters';
import styled from 'styled-components';
import {NumberFilterBuilder} from './NumberFilterBuilder';
import {TimeFilterBuilder} from './TimeFilterBuilder';
import {BooleanFilterBuilder} from './BooleanFilterBuilder';
import {kindOfField, typeOfField} from '../../utils';
import {ComposerOptionsContext} from '../../contexts';
interface AddFilterProps {
  source: StructDef;
  field: FieldDef;
  fieldPath: string;
  addFilter: (filter: FilterCondition, as?: string) => void;
  needsRename: boolean;
  onComplete: () => void;
  initial?: Filter;
}

export const AddFilter: React.FC<AddFilterProps> = ({
  source,
  field,
  addFilter,
  needsRename,
  onComplete,
  fieldPath,
  initial,
}) => {
  const {compiler} = useContext(ComposerOptionsContext);
  const type = typeOfField(field);
  const kind = kindOfField(field);
  const [stringFilter, setStringFilter] = useState<StringFilter | undefined>(
    type === 'string'
      ? initial
        ? (initial as StringFilter)
        : {
            type: 'is_equal_to',
            values: [],
          }
      : undefined
  );
  const [numberFilter, setNumberFilter] = useState<NumberFilter | undefined>(
    type === 'number'
      ? initial
        ? (initial as NumberFilter)
        : {
            type: 'is_equal_to',
            values: [],
          }
      : undefined
  );
  const [timeFilter, setTimeFilter] = useState<TimeFilter | undefined>(
    type === 'date' || type === 'timestamp'
      ? initial
        ? (initial as TimeFilter)
        : {
            type: 'is_on',
            date: new Date(),
            granularity: 'day',
          }
      : undefined
  );
  const [booleanFilter, setBooleanFilter] = useState<BooleanFilter | undefined>(
    type === 'boolean'
      ? initial
        ? (initial as BooleanFilter)
        : {
            type: 'is_true',
          }
      : undefined
  );
  const [filter, setFilter] = useState(
    stringFilter
      ? stringFilterToString(fieldPath, stringFilter)
      : numberFilter
      ? numberFilterToString(fieldPath, numberFilter)
      : timeFilter
      ? timeFilterToString(fieldPath, timeFilter)
      : booleanFilter
      ? booleanFilterToString(fieldPath, booleanFilter)
      : ''
  );
  const [newName, setNewName] = useState('');

  return (
    <div>
      <form>
        <ContextMenuTitle style={{padding: '15px', paddingBottom: 0}}>
          Filter
          <FieldLabel>
            <FieldIcon color="dimension">
              <TypeIcon type={type} kind={kind}></TypeIcon>
            </FieldIcon>
            <SmallFieldName>{field.name}</SmallFieldName>
          </FieldLabel>
        </ContextMenuTitle>
        {needsRename && (
          <RenameBox>
            <FormFieldList>
              <CodeInput
                value={newName}
                setValue={setNewName}
                placeholder="field name"
                label="Field Name"
                autoFocus={true}
              />
              <FormInputLabel>Filter</FormInputLabel>
            </FormFieldList>
          </RenameBox>
        )}
        {stringFilter && (
          <StringFilterBuilder
            fieldPath={fieldPath}
            filter={stringFilter}
            setFilter={f => {
              setStringFilter(f);
              setFilter(stringFilterToString(fieldPath, f));
            }}
          />
        )}
        {booleanFilter && (
          <BooleanFilterBuilder
            filter={booleanFilter}
            setFilter={f => {
              setBooleanFilter(f);
              setFilter(booleanFilterToString(fieldPath, f));
            }}
          />
        )}
        {numberFilter && (
          <NumberFilterBuilder
            filter={numberFilter}
            setFilter={f => {
              setNumberFilter(f);
              setFilter(numberFilterToString(fieldPath, f));
            }}
          />
        )}
        {(type === 'date' || type === 'timestamp') && timeFilter && (
          <TimeFilterBuilder
            type={type}
            filter={timeFilter}
            setFilter={f => {
              setTimeFilter(f);
              setFilter(timeFilterToString(fieldPath, f));
            }}
          />
        )}
        <RightButtonRow style={{padding: '0 15px 15px 15px'}}>
          <Button type="button" color="secondary" onClick={onComplete}>
            Cancel
          </Button>
          <Button
            onClick={event => {
              compiler
                .compileFilter(source, filter)
                .then(filterExpression => {
                  addFilter(filterExpression, newName || undefined);
                  onComplete();
                })
                .catch(console.error);
              event.stopPropagation();
              event.preventDefault();
            }}
          >
            Save
          </Button>
        </RightButtonRow>
      </form>
    </div>
  );
};

const RenameBox = styled.div`
  margin: 15px;
  margin-top: 0;
  margin-bottom: 10px;
`;
