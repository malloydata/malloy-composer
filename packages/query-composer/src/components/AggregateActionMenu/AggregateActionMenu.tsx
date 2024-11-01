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
import {ModelDef, SourceDef} from '@malloydata/malloy';
import {OrderByField, PropertyType, StagePath} from '../../types';
import {FilterContextBar} from '../FilterContextBar';
import {RenameField} from '../RenameField';
import {ActionMenu, ActionSubmenuComponentProps} from '../ActionMenu';
import {DataStyleContextBar} from '../DataStyleContextBar';
import {AddNewMeasure} from '../AddNewMeasure';
import {EditOrderBy} from '../EditOrderBy';
import {QueryModifiers} from '../../hooks';
import {AddNewCalculate} from '../AddNewCalculate';

interface AggregateActionMenuProps {
  source: SourceDef;
  closeMenu: () => void;
  isRenamed: boolean;
  fieldIndex: number;
  beginReorderingField: () => void;
  isEditable: boolean;
  name: string;
  definition: string | undefined;
  orderByField: OrderByField;
  stagePath: StagePath;
  model: ModelDef;
  modelPath: string;
  queryModifiers: QueryModifiers;
  property: PropertyType;
}

export const AggregateActionMenu: React.FC<AggregateActionMenuProps> = ({
  model,
  modelPath,
  source,
  closeMenu,
  beginReorderingField,
  isRenamed,
  name,
  definition,
  isEditable,
  fieldIndex,
  orderByField,
  stagePath,
  queryModifiers,
  property,
}) => {
  return (
    <ActionMenu
      closeMenu={closeMenu}
      actions={[
        {
          kind: 'sub_menu',
          id: 'filter',
          iconName: 'filter',
          iconColor: 'filter',
          // Cannot filter a custom measure for now...
          isEnabled: definition === undefined,
          label: 'Filter',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <FilterContextBar
              model={model}
              modelPath={modelPath}
              source={source}
              addFilter={(filter, as) =>
                queryModifiers.addFilterToField(
                  stagePath,
                  fieldIndex,
                  filter,
                  as
                )
              }
              onComplete={onComplete}
              needsRename={!isRenamed}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'rename',
          iconName: 'rename',
          iconColor: 'other',
          label: 'Rename',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <RenameField
              rename={name =>
                queryModifiers.renameField(stagePath, fieldIndex, name)
              }
              onComplete={onComplete}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'order_by',
          iconName: 'order_by',
          label: 'Order By',
          iconColor: 'other',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <EditOrderBy
              byField={orderByField}
              addOrderBy={(fieldIndex, direction) =>
                queryModifiers.addOrderBy(stagePath, fieldIndex, direction)
              }
              onComplete={onComplete}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'style',
          label: 'Style',
          iconName: 'style',
          iconColor: 'other',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <DataStyleContextBar
              setRenderer={renderName =>
                queryModifiers.setRenderer(stagePath, fieldIndex, renderName)
              }
              onComplete={onComplete}
              allowedRenderers={[
                'number',
                'boolean',
                'currency',
                'image',
                'url',
                'percent',
                'text',
                'time',
              ]}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'edit_definition',
          label: 'Edit Definition',
          iconName: 'edit',
          iconColor: 'other',
          isEnabled: isEditable,
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => {
            if (property === 'aggregate') {
              return (
                <AddNewMeasure
                  source={source}
                  addMeasure={code =>
                    queryModifiers.editMeasure(stagePath, fieldIndex, code)
                  }
                  onComplete={onComplete}
                  initialCode={definition}
                  initialName={name}
                />
              );
            } else if (property === 'calculate') {
              return (
                <AddNewCalculate
                  source={source}
                  addCalculate={code =>
                    queryModifiers.editMeasure(stagePath, fieldIndex, code)
                  }
                  onComplete={onComplete}
                  initialCode={definition}
                  initialName={name}
                />
              );
            }
            return <div />;
          },
        },
        {
          kind: 'one_click',
          id: 'move',
          iconName: 'move',
          iconColor: 'other',
          label: 'Move',
          onClick: beginReorderingField,
        },
      ]}
    />
  );
};
