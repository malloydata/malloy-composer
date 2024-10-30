/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import {ReactElement, useRef} from 'react';
import * as React from 'react';
import {
  QuerySummaryItem,
  StagePath,
  StageSummary,
  stagePathPush,
} from '../../types';
import {ModelDef, SourceDef} from '@malloydata/malloy';
import {StageSummaryUI} from './StateSummaryUI';
import {FieldListDiv} from './FieldListDiv';
import {HoverToPopover} from '../HoverToPopover';
import {StageButton} from './StageButton';
import {ClickToPopover} from './ClickToPopover';
import {DimensionActionMenu} from '../DimensionActionMenu';
import {AggregateActionMenu} from '../AggregateActionMenu';
import {FilterActionMenu} from '../FilterActionMenu';
import {LimitActionMenu} from '../LimitActionMenu';
import {OrderByActionMenu} from '../OrderByActionMenu';
import {DataStyleActionMenu} from '../DataStyleActionMenu';
import {NestQueryActionMenu} from '../NestQueryActionMenu';
import {ErrorFieldActionMenu} from '../ErrorFieldActionMenu';
import {FieldButton, BackPart, CloseIconStyled} from '../FieldButton';
import {ActionIcon} from '../ActionIcon';
import {FieldDetailPanel} from '../FieldDetailPanel';
import {VisIcon} from '../VisIcon';
import {ListNest} from '../ListNest';
import {StageActionMenu} from '../StageActionMenu';
import {QueryModifiers, useClickOutside} from '../../hooks';
import {scalarTypeOfField} from '../../utils';

export interface SummaryItemProps {
  item: QuerySummaryItem;
  source: SourceDef;
  stagePath: StagePath;
  stageSummary: StageSummary;
  beginReorderingField: (fieldIndex: number) => void;
  fieldIndex?: number | undefined;
  isSelected: boolean;
  deselect: () => void;
  queryModifiers: QueryModifiers;
  model: ModelDef;
  modelPath: string;
}

export const SummaryItem: React.FC<SummaryItemProps> = ({
  model,
  modelPath,
  item,
  source,
  stagePath,
  fieldIndex,
  stageSummary,
  isSelected,
  beginReorderingField,
  deselect,
  queryModifiers,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const children: {
    childItem: QuerySummaryItem;
    fieldIndex?: number;
  }[] = [];
  if ('styles' in item && item.styles) {
    children.push(...item.styles.map(childItem => ({childItem})));
  }
  if ('filters' in item && item.filters) {
    children.push(
      ...item.filters.map(childItem => ({
        childItem,
        fieldIndex: item.fieldIndex,
      }))
    );
  }

  useClickOutside(ref, () => isSelected && deselect());

  return (
    <div ref={ref}>
      <ClickToPopover
        popoverContent={({closeMenu}) => {
          if (
            (item.type === 'field' || item.type === 'field_definition') &&
            item.kind !== 'query'
          ) {
            if (item.kind === 'dimension') {
              return (
                <DimensionActionMenu
                  model={model}
                  modelPath={modelPath}
                  source={source}
                  closeMenu={closeMenu}
                  stagePath={stagePath}
                  stageSummary={stageSummary}
                  fieldIndex={item.fieldIndex}
                  beginReorderingField={() => {
                    beginReorderingField(item.fieldIndex);
                    closeMenu();
                  }}
                  filterField={item.type === 'field' ? item.field : undefined}
                  filterFieldPath={
                    item.type === 'field' ? item.path : undefined
                  }
                  name={item.name}
                  isEditable={item.type === 'field_definition'}
                  definition={
                    item.type === 'field_definition' ? item.source : undefined
                  }
                  orderByField={{
                    name: item.name,
                    fieldIndex: item.fieldIndex,
                    type: scalarTypeOfField(item.field),
                  }}
                  queryModifiers={queryModifiers}
                />
              );
            } else if (item.kind === 'measure') {
              const isRenamed =
                item.type === 'field_definition' || item.isRenamed;
              return (
                <AggregateActionMenu
                  model={model}
                  modelPath={modelPath}
                  stagePath={stagePath}
                  source={source}
                  closeMenu={closeMenu}
                  isRenamed={isRenamed}
                  beginReorderingField={() => {
                    beginReorderingField(item.fieldIndex);
                    closeMenu();
                  }}
                  fieldIndex={item.fieldIndex}
                  name={item.name}
                  isEditable={item.type === 'field_definition'}
                  definition={
                    item.type === 'field_definition' ? item.source : undefined
                  }
                  orderByField={{
                    name: item.name,
                    fieldIndex: item.fieldIndex,
                    type: scalarTypeOfField(item.field),
                  }}
                  queryModifiers={queryModifiers}
                />
              );
            }
          } else if (item.type === 'filter') {
            return (
              <FilterActionMenu
                model={model}
                modelPath={modelPath}
                stagePath={stagePath}
                source={source}
                filterSource={item.filterSource}
                filterField={item.field}
                fieldPath={item.fieldPath as string}
                fieldIndex={fieldIndex}
                filterIndex={item.filterIndex}
                parsedFilter={item.parsed}
                closeMenu={closeMenu}
                queryModifiers={queryModifiers}
              />
            );
          } else if (item.type === 'limit') {
            return (
              <LimitActionMenu
                stagePath={stagePath}
                closeMenu={closeMenu}
                limit={item.limit}
                queryModifiers={queryModifiers}
              />
            );
          } else if (item.type === 'order_by') {
            return (
              <OrderByActionMenu
                stagePath={stagePath}
                closeMenu={closeMenu}
                orderByField={item.byField}
                orderByIndex={item.orderByIndex}
                existingDirection={item.direction}
                queryModifiers={queryModifiers}
              />
            );
          } else if (item.type === 'data_style') {
            return (
              <DataStyleActionMenu
                stagePath={stagePath}
                fieldIndex={item.fieldIndex}
                onComplete={closeMenu}
                allowedRenderers={item.allowedRenderers}
                queryModifiers={queryModifiers}
              />
            );
          } else if (
            item.type === 'nested_query_definition' ||
            (item.type === 'field' && item.kind === 'query')
          ) {
            const nestStagePath = stagePathPush(stagePath, {
              fieldIndex: item.fieldIndex,
              stageIndex: 0,
            });
            return (
              <NestQueryActionMenu
                model={model}
                modelPath={modelPath}
                source={source}
                stagePath={nestStagePath}
                fieldIndex={item.fieldIndex}
                orderByFields={item.stages[0].orderByFields}
                closeMenu={closeMenu}
                beginReorderingField={() => {
                  beginReorderingField(item.fieldIndex);
                  closeMenu();
                }}
                isExpanded={item.type === 'nested_query_definition'}
                queryModifiers={queryModifiers}
              />
            );
          } else if (item.type === 'error_field') {
            return (
              <ErrorFieldActionMenu
                remove={() =>
                  queryModifiers.removeField(stagePath, item.fieldIndex)
                }
                closeMenu={closeMenu}
              />
            );
          } else {
            return <div />;
          }
          return null;
        }}
        content={({isOpen, closeMenu}) => {
          if (item.type === 'field' || item.type === 'field_definition') {
            const isSaved = item.type === 'field' && !item.isRefined;
            let button: ReactElement;
            if (item.kind === 'dimension') {
              button = (
                <FieldButton
                  icon={<ActionIcon action="group_by" />}
                  name={item.name}
                  unsaved={!isSaved}
                  canRemove={true}
                  onRemove={() => {
                    queryModifiers.removeField(stagePath, item.fieldIndex);
                    closeMenu();
                  }}
                  color="dimension"
                  active={isOpen || isSelected}
                />
              );
            } else if (item.kind === 'measure') {
              button = (
                <FieldButton
                  icon={<ActionIcon action="aggregate" />}
                  name={item.name}
                  canRemove={true}
                  unsaved={!isSaved}
                  onRemove={() => {
                    queryModifiers.removeField(stagePath, item.fieldIndex);
                    closeMenu();
                  }}
                  color="measure"
                  active={isOpen || isSelected}
                />
              );
            } else {
              button = (
                <FieldButton
                  icon={<ActionIcon action="nest" />}
                  name={item.name}
                  canRemove={true}
                  onRemove={() => {
                    queryModifiers.removeField(stagePath, item.fieldIndex);
                    closeMenu();
                  }}
                  color="query"
                  active={isOpen || isSelected}
                />
              );
            }
            return (
              <HoverToPopover
                width={300}
                enabled={!isOpen}
                content={() => button}
                zIndex={9}
                popoverContent={() => {
                  return (
                    <FieldDetailPanel
                      fieldPath={item.type === 'field' ? item.path : undefined}
                      definition={
                        item.type !== 'field' ? item.source : undefined
                      }
                    />
                  );
                }}
              />
            );
          } else if (item.type === 'filter') {
            return (
              <HoverToPopover
                width={300}
                enabled={!isOpen}
                zIndex={9}
                content={() => (
                  <FieldButton
                    icon={<ActionIcon action="filter" />}
                    name={item.filterSource}
                    canRemove={true}
                    onRemove={() => {
                      queryModifiers.removeFilter(
                        stagePath,
                        item.filterIndex,
                        fieldIndex
                      );
                      closeMenu();
                    }}
                    color="filter"
                    active={isOpen || isSelected}
                  />
                )}
                popoverContent={() => {
                  return (
                    <FieldDetailPanel filterExpression={item.filterSource} />
                  );
                }}
              />
            );
          } else if (item.type === 'limit') {
            return (
              <FieldButton
                icon={<ActionIcon action="limit" />}
                name={`limit: ${item.limit}`}
                canRemove={true}
                onRemove={() => {
                  queryModifiers.removeLimit(stagePath);
                  closeMenu();
                }}
                color="other"
                active={isOpen || isSelected}
              />
            );
          } else if (item.type === 'order_by') {
            return (
              <FieldButton
                icon={<ActionIcon action="order_by" />}
                name={`${item.byField.name} ${item.direction || ''}`}
                canRemove={true}
                onRemove={() => {
                  queryModifiers.removeOrderBy(stagePath, item.orderByIndex);
                  closeMenu();
                }}
                color="other"
                active={isOpen || isSelected}
              />
            );
          } else if (item.type === 'data_style' && item.renderer) {
            return (
              <FieldButton
                icon={<VisIcon renderer={item.renderer} />}
                name={item.renderer}
                color="other"
                canRemove={item.canRemove}
                onRemove={() => {
                  queryModifiers.setRenderer(
                    stagePath,
                    item.fieldIndex,
                    undefined
                  );
                  closeMenu();
                }}
                active={isOpen || isSelected}
              />
            );
          } else if (item.type === 'nested_query_definition') {
            return (
              <FieldButton
                icon={<ActionIcon action="nest" />}
                name={item.name}
                unsaved={true}
                canRemove={true}
                onRemove={() => {
                  queryModifiers.removeField(stagePath, item.fieldIndex);
                  closeMenu();
                }}
                color="query"
                active={isOpen || isSelected}
              />
            );
          } else if (item.type === 'error_field') {
            return (
              <FieldButton
                icon={<ActionIcon action="error" />}
                name={item.name}
                unsaved={false}
                canRemove={true}
                onRemove={() => {
                  queryModifiers.removeField(stagePath, item.fieldIndex);
                  closeMenu();
                }}
                color="error"
                active={isOpen || isSelected}
              />
            );
          } else {
            return <div />;
          }
        }}
      />
      {item.type === 'nested_query_definition' &&
        (item.stages[0].items.length > 0 || item.stages.length > 1) &&
        item.stages.map((stageSummary, stageIndex) => {
          const nestStagePath = stagePathPush(stagePath, {
            fieldIndex: item.fieldIndex,
            stageIndex,
          });
          return (
            <ListNest key={'stage/' + stageIndex}>
              {item.stages.length > 1 && (
                <ClickToPopover
                  popoverContent={({closeMenu}) => (
                    <StageActionMenu
                      model={model}
                      modelPath={modelPath}
                      source={stageSummary.inputSource}
                      stagePath={nestStagePath}
                      orderByFields={stageSummary.orderByFields}
                      closeMenu={closeMenu}
                      isLastStage={stageIndex === item.stages.length - 1}
                      stageSummary={stageSummary}
                      queryModifiers={queryModifiers}
                    />
                  )}
                  content={({isOpen}) => (
                    <StageButton active={isOpen}>
                      Stage {stageIndex + 1}
                      <BackPart className="back">
                        <CloseIconStyled
                          color="other"
                          width="20px"
                          height="20px"
                          className="close"
                          onClick={() =>
                            queryModifiers.removeStage(nestStagePath)
                          }
                        />
                      </BackPart>
                    </StageButton>
                  )}
                />
              )}
              <StageSummaryUI
                model={model}
                modelPath={modelPath}
                stageSummary={stageSummary}
                stagePath={nestStagePath}
                source={source}
                queryModifiers={queryModifiers}
              />
            </ListNest>
          );
        })}
      {children.length > 0 && (
        <ListNest>
          <FieldListDiv>
            {children.map(({childItem, fieldIndex}, index) => {
              return (
                <SummaryItem
                  model={model}
                  modelPath={modelPath}
                  key={'child:' + index}
                  item={childItem}
                  source={source}
                  stagePath={stagePath}
                  fieldIndex={fieldIndex}
                  stageSummary={stageSummary}
                  isSelected={false}
                  beginReorderingField={() => {
                    // Only used for filters, reordering not needed
                  }}
                  deselect={() => {
                    // Only used for filters, reordering not needed
                  }}
                  queryModifiers={queryModifiers}
                />
              );
            })}
          </FieldListDiv>
        </ListNest>
      )}
    </div>
  );
};
