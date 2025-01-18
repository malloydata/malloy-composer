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
import {SourceDef} from '@malloydata/malloy';
import {OrderByField, StagePath, StageSummary} from '../../types';
import {AggregateContextBar} from '../AggregateContextBar';
import {GroupByContextBar} from '../GroupByContextBar';
import {NestContextBar} from '../NestContextBar';
import {FilterContextBar} from '../FilterContextBar';
import {AddLimit} from '../AddLimit';
import {OrderByContextBar} from '../OrderByContextBar';
import {ActionMenu, ActionSubmenuComponentProps} from '../ActionMenu';
import {DataStyleContextBar} from '../DataStyleContextBar';
import {SelectContextBar} from '../SelectContextBar';
import {
  fieldToSummaryItem,
  flatFields,
  pathParent,
  termsForField,
} from '../../utils';
import {QueryModifiers} from '../../hooks';
import {QUERY_RENDERERS} from '../../core/renderer';

interface StageActionMenuProps {
  source: SourceDef;
  stagePath: StagePath;
  orderByFields: OrderByField[];
  closeMenu: () => void;
  stageSummary: StageSummary;
  isLastStage: boolean;
  queryModifiers: QueryModifiers;
}

export const StageActionMenu: React.FC<StageActionMenuProps> = ({
  source,
  stagePath,
  orderByFields,
  closeMenu,
  stageSummary,
  isLastStage,
  queryModifiers,
}) => {
  return (
    <ActionMenu
      closeMenu={closeMenu}
      actions={[
        {
          kind: 'sub_menu',
          id: 'filter',
          label: 'Filter',
          iconName: 'filter',
          iconColor: 'filter',
          closeOnComplete: true,
          divider: stageSummary.type === 'project',
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <FilterContextBar
              source={source}
              addFilter={(filter, as) =>
                queryModifiers.addFilter(stagePath, filter, as)
              }
              onComplete={onComplete}
              needsRename={false}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'nest',
          label: 'Nest',
          iconName: 'nest',
          iconColor: 'query',
          closeOnComplete: true,
          isEnabled: stageSummary.type === 'reduce',
          divider: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <NestContextBar
              source={source}
              selectField={fieldPath =>
                queryModifiers.toggleField(stagePath, fieldPath)
              }
              selectNewNest={name =>
                queryModifiers.addNewNestedQuery(stagePath, name)
              }
              onComplete={onComplete}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'group_by',
          label: 'Group By',
          iconName: 'group_by',
          iconColor: 'dimension',
          closeOnComplete: true,
          isEnabled: stageSummary.type === 'reduce',
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <GroupByContextBar
              source={source}
              toggleField={fieldPath =>
                queryModifiers.toggleField(stagePath, fieldPath)
              }
              addNewDimension={def =>
                queryModifiers.addNewDimension(stagePath, def)
              }
              onComplete={onComplete}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'aggregate',
          label: 'Aggregate',
          iconName: 'aggregate',
          iconColor: 'measure',
          closeOnComplete: true,
          isEnabled: stageSummary.type === 'reduce',
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <AggregateContextBar
              source={source}
              selectField={fieldPath =>
                queryModifiers.toggleField(stagePath, fieldPath)
              }
              addNewMeasure={def =>
                queryModifiers.addNewMeasure(stagePath, def)
              }
              onComplete={onComplete}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'select',
          label: 'Select',
          iconName: 'aggregate',
          iconColor: 'dimension',
          closeOnComplete: true,
          isEnabled: stageSummary.type === 'project',
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <SelectContextBar
              source={source}
              toggleField={fieldPath =>
                queryModifiers.toggleField(stagePath, fieldPath)
              }
              addNewDimension={def =>
                queryModifiers.addNewDimension(stagePath, def)
              }
              onComplete={onComplete}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'limit',
          label: 'Limit',
          iconName: 'limit',
          iconColor: 'other',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <AddLimit
              addLimit={limit => queryModifiers.addLimit(stagePath, limit)}
              onComplete={onComplete}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'order_by',
          label: 'Order By',
          iconName: 'order_by',
          iconColor: 'other',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <OrderByContextBar
              addOrderBy={(byField, direction) =>
                queryModifiers.addOrderBy(stagePath, byField, direction)
              }
              orderByFields={orderByFields}
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
          isEnabled: isLastStage,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <DataStyleContextBar
              setRenderer={renderName =>
                queryModifiers.setRenderer(stagePath, 0, renderName)
              }
              onComplete={onComplete}
              allowedRenderers={QUERY_RENDERERS}
            />
          ),
        },
      ]}
      searchItems={flatFields(source).map(({field, path}) => ({
        item: fieldToSummaryItem(field, path),
        terms: termsForField(field, path),
        detail: pathParent(path),
        key: path,
        select: () => queryModifiers.toggleField(stagePath, path),
      }))}
    />
  );
};
