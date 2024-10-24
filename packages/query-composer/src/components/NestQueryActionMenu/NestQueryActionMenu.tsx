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
import {OrderByField, RendererName, StagePath, StageSummary} from '../../types';
import {AggregateContextBar} from '../AggregateContextBar';
import {GroupByContextBar} from '../GroupByContextBar';
import {NestContextBar} from '../NestContextBar';
import {FilterContextBar} from '../FilterContextBar';
import {AddLimit} from '../AddLimit';
import {OrderByContextBar} from '../OrderByContextBar';
import {ActionMenu, ActionSubmenuComponentProps} from '../ActionMenu';
import {
  FilterCondition,
  QueryFieldDef,
  SourceDef,
  ModelDef,
} from '@malloydata/malloy';
import {DataStyleContextBar} from '../DataStyleContextBar';
import {
  fieldToSummaryItem,
  flatFields,
  pathParent,
  termsForField,
} from '../../utils';
import {RenameField} from '../RenameField';

interface NestQueryActionMenuProps {
  source: SourceDef;
  toggleField: (stagePath: StagePath, fieldPath: string) => void;
  addFilter: (
    stagePath: StagePath,
    filter: FilterCondition,
    as?: string
  ) => void;
  addLimit: (stagePath: StagePath, limit: number) => void;
  addOrderBy: (
    stagePath: StagePath,
    byFieldIndex: number,
    direction?: 'asc' | 'desc'
  ) => void;
  addNewNestedQuery: (stagePath: StagePath, name: string) => void;
  stagePath: StagePath;
  remove: () => void;
  orderByFields: OrderByField[];
  addNewDimension: (stagePath: StagePath, dimension: QueryFieldDef) => void;
  addNewMeasure: (stagePath: StagePath, measure: QueryFieldDef) => void;
  closeMenu: () => void;
  setRenderer: (rendererName: RendererName) => void;
  addStage: () => void;
  stageSummary: StageSummary;
  updateFieldOrder: (stagePath: StagePath, ordering: number[]) => void;
  beginReorderingField: () => void;
  rename: (newName: string) => void;
  model: ModelDef;
  modelPath: string;
  isExpanded: boolean;
  replaceWithDefinition: () => void;
}

export const NestQueryActionMenu: React.FC<NestQueryActionMenuProps> = ({
  model,
  modelPath,
  source,
  toggleField,
  addFilter,
  addLimit,
  addOrderBy,
  addNewNestedQuery,
  stagePath,
  orderByFields,
  addNewDimension,
  addNewMeasure,
  closeMenu,
  setRenderer,
  beginReorderingField,
  addStage,
  rename,
  isExpanded,
  replaceWithDefinition,
}) => {
  return (
    <ActionMenu
      model={model}
      modelPath={modelPath}
      valueSearchSource={source}
      addFilter={filter => addFilter(stagePath, filter)}
      closeMenu={closeMenu}
      actions={[
        {
          kind: 'sub_menu',
          id: 'filter',
          label: 'Filter',
          iconName: 'filter',
          iconColor: 'filter',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <FilterContextBar
              modelPath={modelPath}
              model={model}
              source={source}
              addFilter={(filter, as) => addFilter(stagePath, filter, as)}
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
          divider: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <NestContextBar
              source={source}
              selectField={fieldPath => toggleField(stagePath, fieldPath)}
              selectNewNest={name => addNewNestedQuery(stagePath, name)}
              onComplete={onComplete}
            />
          ),
        },
        {
          kind: 'sub_menu',
          id: 'group_by',
          label: 'Group By',
          iconColor: 'dimension',
          iconName: 'group_by',
          closeOnComplete: true,
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <GroupByContextBar
              source={source}
              toggleField={fieldPath => toggleField(stagePath, fieldPath)}
              addNewDimension={def => addNewDimension(stagePath, def)}
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
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <AggregateContextBar
              source={source}
              selectField={fieldPath => toggleField(stagePath, fieldPath)}
              addNewMeasure={def => addNewMeasure(stagePath, def)}
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
              addLimit={limit => addLimit(stagePath, limit)}
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
                addOrderBy(stagePath, byField, direction)
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
          Component: ({onComplete}: ActionSubmenuComponentProps) => (
            <DataStyleContextBar
              setRenderer={setRenderer}
              onComplete={onComplete}
              allowedRenderers={[
                'table',
                'bar_chart',
                'dashboard',
                'json',
                'line_chart',
                'list',
                'list_detail',
                'point_map',
                'scatter_chart',
                'segment_map',
                'shape_map',
                'sparkline',
              ]}
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
            <RenameField rename={rename} onComplete={onComplete} />
          ),
        },
        {
          kind: 'one_click',
          id: 'add_stage',
          label: 'Add stage',
          iconName: 'stage',
          iconColor: 'other',
          onClick: addStage,
        },
        {
          kind: 'one_click',
          id: 'expand_definition',
          label: 'Duplicate',
          iconName: 'duplicate',
          iconColor: 'other',
          isEnabled: !isExpanded,
          onClick: replaceWithDefinition,
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
      searchItems={flatFields(source).map(({field, path}) => ({
        item: fieldToSummaryItem(field, path),
        terms: termsForField(field, path),
        detail: pathParent(path),
        key: path,
        select: () => toggleField(stagePath, path),
      }))}
    />
  );
};
