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
import {
  expressionIsCalculation,
  FieldDef,
  isBasicAtomic,
  QueryFieldDef,
  SourceDef,
} from '@malloydata/malloy';
import {useCallback, useContext, useState} from 'react';
import {ActionIcon} from '../ActionIcon';
import {AddNewDimension} from '../AddNewDimension';
import {SelectTimeGranularity} from '../SelectTimeGranularity';
import {
  ContextMenuContent,
  ContextMenuOuter,
  ContextMenuSearchHeader,
  ScrollMain,
} from '../CommonElements';
import {FieldButton} from '../FieldButton';
import {FieldList} from '../FieldList';
import {SearchInput} from '../SearchInput';
import {SearchList} from '../SearchList';
import {
  fieldToSummaryItem,
  flatFields,
  isDimension,
  pathParent,
  termsForField,
} from '../../utils';
import {ComposerOptionsContext} from '../../contexts';
interface SelectContextBarProps {
  source: SourceDef;
  toggleField: (fieldPath: string) => void;
  addNewDimension: (dimension: QueryFieldDef) => void;
  onComplete: () => void;
}

export const SelectContextBar: React.FC<SelectContextBarProps> = ({
  source,
  toggleField,
  addNewDimension,
  onComplete,
}) => {
  const {compiler} = useContext(ComposerOptionsContext);
  const [isAddingNewField, setIsAddingNewField] = useState(false);
  const [isSelectingGranularity, setSelectingGranularity] = useState<{
    field: FieldDef;
    path: string;
  }>();
  const [searchTerm, setSearchTerm] = useState('');

  const maybeSelectField = useCallback(
    (path: string, field: FieldDef) => {
      if (field.type === 'date') {
        setSelectingGranularity({field, path});
      } else if (field.type === 'timestamp') {
        setSelectingGranularity({field, path});
      } else {
        toggleField(path);
      }
    },
    [toggleField]
  );

  return (
    <ContextMenuOuter>
      {!isAddingNewField && !isSelectingGranularity && (
        <>
          <ContextMenuSearchHeader>
            <SearchInput
              placeholder="Search"
              value={searchTerm}
              setValue={setSearchTerm}
              autoFocus={true}
            />
          </ContextMenuSearchHeader>
          <ScrollMain>
            <ContextMenuContent>
              {searchTerm === '' && (
                <>
                  <FieldButton
                    icon={<ActionIcon action="add" />}
                    onClick={() => setIsAddingNewField(true)}
                    name="New Dimension"
                    color="other"
                  />
                  <FieldList
                    fields={source.fields}
                    filter={field =>
                      isBasicAtomic(field) &&
                      !expressionIsCalculation(field.expressionType)
                    }
                    showNested={true}
                    selectField={maybeSelectField}
                  />
                </>
              )}
              {searchTerm !== '' && (
                <>
                  <SearchList
                    searchTerm={searchTerm}
                    items={flatFields(source)
                      .filter(({field}) => isDimension(field))
                      .map(({field, path}) => ({
                        item: fieldToSummaryItem(field, path),
                        terms: [...termsForField(field, path), 'select'],
                        detail: pathParent(path),
                        key: keyFor(path),
                        select: () => maybeSelectField(path, field),
                      }))}
                  />
                </>
              )}
            </ContextMenuContent>
          </ScrollMain>
        </>
      )}
      {isAddingNewField && (
        <AddNewDimension
          addDimension={addNewDimension}
          source={source}
          onComplete={onComplete}
        />
      )}
      {isSelectingGranularity && (
        <SelectTimeGranularity
          field={isSelectingGranularity.field}
          path={isSelectingGranularity.path}
          source={source}
          addGroupBy={async (name, expression) => {
            const field = await compiler.compileSelect(
              source,
              name,
              expression
            );
            addNewDimension(field);
          }}
          onComplete={onComplete}
        />
      )}
    </ContextMenuOuter>
  );
};

export function keyFor(path: string): string {
  return 'select/' + path;
}
