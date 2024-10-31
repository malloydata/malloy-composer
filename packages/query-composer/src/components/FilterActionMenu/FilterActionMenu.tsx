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
  FieldDef,
  FilterCondition,
  ModelDef,
  StructDef,
} from '@malloydata/malloy';
import {Filter, StagePath} from '../../types';
import {ActionMenu, ActionSubmenuComponentProps} from '../ActionMenu';
import {AddFilter} from '../AddFilter';
import {EditFilter} from '../EditFilter';
import {QueryModifiers} from '../../hooks';

interface FilterActionMenuProps {
  model: ModelDef;
  modelPath: string;
  stagePath: StagePath;
  source: StructDef;
  filterSource: string;
  closeMenu: () => void;
  filterField: FieldDef | undefined;
  parsedFilter: Filter | undefined;
  fieldPath: string;
  fieldIndex: number | undefined;
  filterIndex: number;
  queryModifiers: QueryModifiers;
}

export const FilterActionMenu: React.FC<FilterActionMenuProps> = ({
  filterSource,
  closeMenu,
  source,
  filterField,
  parsedFilter,
  model,
  modelPath,
  stagePath,
  fieldPath,
  fieldIndex,
  filterIndex,
  queryModifiers,
}) => {
  const editFilter = (filter: FilterCondition) =>
    queryModifiers.editFilter(stagePath, fieldIndex, filterIndex, filter);
  return (
    <ActionMenu
      closeMenu={closeMenu}
      actions={[
        {
          id: 'edit',
          label: 'Change filter',
          iconName: 'filter',
          iconColor: 'filter',
          kind: 'sub_menu',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) =>
            filterField && parsedFilter ? (
              <AddFilter
                model={model}
                source={source}
                field={filterField}
                addFilter={editFilter}
                fieldPath={fieldPath}
                needsRename={false}
                onComplete={onComplete}
                modelPath={modelPath}
                initial={parsedFilter}
              />
            ) : (
              <EditFilter
                editFilter={editFilter}
                onComplete={onComplete}
                existing={filterSource}
                source={source}
              />
            ),
        },
      ]}
    />
  );
};
