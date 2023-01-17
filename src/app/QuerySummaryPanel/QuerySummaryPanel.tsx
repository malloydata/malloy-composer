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

import { ReactElement, useEffect, useRef, useState } from "react";
import {
  QuerySummary,
  QuerySummaryItem,
  StagePath,
  stagePathPush,
  StageSummary,
} from "../../types";
import { FieldButton } from "../FieldButton";
import { ActionIcon } from "../ActionIcon";
import { Popover } from "../Popover";
import { DimensionActionMenu } from "../DimensionActionMenu";
import { AggregateActionMenu } from "../AggregateActionMenu";
import { LimitActionMenu } from "../LimitActionMenu";
import { ListNest } from "../ListNest";
import { NestQueryActionMenu } from "../NestQueryActionMenu";
import styled from "styled-components";
import { FilterActionMenu } from "../FilterActionMenu";
import { ModelDef, SearchValueMapResult, StructDef } from "@malloydata/malloy";
import { OrderByActionMenu } from "../OrderByActionMenu";
import { EmptyMessage } from "../CommonElements";
import { DataStyleActionMenu } from "../DataStyleActionMenu";
import { VisIcon } from "../VisIcon";
import { StageActionMenu } from "../StageActionMenu";
import { BackPart, CloseIconStyled } from "../FieldButton/FieldButton";
import { ErrorFieldActionMenu } from "../ErrorFieldActionMenu";
import { notUndefined, scalarTypeOfField } from "../utils";
import { useClickOutside } from "../hooks";
import { HoverToPopover } from "../HoverToPopover";
import { FieldDetailPanel } from "../FieldDetailPanel";
import { QueryModifiers } from "../hooks/use_query_builder";

interface QuerySummaryPanelProps {
  model: ModelDef;
  source: StructDef;
  querySummary: QuerySummary;
  stagePath: StagePath | undefined;
  topValues: SearchValueMapResult[] | undefined;
  queryName: string;
  queryModifiers: QueryModifiers;
  modelPath: string | undefined;
}

export const QuerySummaryPanel: React.FC<QuerySummaryPanelProps> = ({
  model,
  modelPath,
  querySummary,
  stagePath,
  queryName,
  topValues,
  queryModifiers,
}) => {
  if (
    querySummary.stages[0].items.length === 0 &&
    querySummary.stages.length === 1
  ) {
    if (!stagePath || !stagePath.parts || stagePath.parts.length === 0) {
      return (
        <EmptyMessage>
          <div>Add fields to the query</div>
          <div>with the “+” button</div>
        </EmptyMessage>
      );
    }
  }

  return (
    <FieldListDiv>
      {querySummary.stages.map((stage, stageIndex) => {
        const nestStagePath = stagePathPush(stagePath, {
          stageIndex,
          fieldIndex: 0,
        });
        return (
          <div key={"stage/" + stageIndex}>
            {querySummary.stages.length > 1 && (
              <ClickToPopover
                popoverContent={({ closeMenu }) => (
                  <StageActionMenu
                    model={model}
                    modelPath={modelPath}
                    source={stage.inputSource}
                    toggleField={queryModifiers.toggleField}
                    addFilter={queryModifiers.addFilter}
                    addLimit={queryModifiers.addLimit}
                    addOrderBy={queryModifiers.addOrderBy}
                    addNewNestedQuery={queryModifiers.addNewNestedQuery}
                    stagePath={nestStagePath}
                    remove={() => queryModifiers.removeStage(nestStagePath)}
                    orderByFields={stage.orderByFields}
                    addNewDimension={queryModifiers.addNewDimension}
                    addNewMeasure={queryModifiers.addNewMeasure}
                    closeMenu={closeMenu}
                    isLastStage={stageIndex === querySummary.stages.length - 1}
                    setDataStyle={(renderer) =>
                      queryModifiers.setDataStyle(queryName, renderer)
                    }
                    stageSummary={stage.items}
                    updateFieldOrder={queryModifiers.updateFieldOrder}
                    topValues={topValues}
                  />
                )}
                content={({ isOpen }) => (
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
              stage={stage}
              queryModifiers={queryModifiers}
              stagePath={nestStagePath}
              key={"stage/" + stageIndex}
              source={stage.inputSource}
              topValues={topValues}
            />
          </div>
        );
      })}
    </FieldListDiv>
  );
};

interface SummaryStageProps {
  stage: StageSummary;
  stagePath: StagePath;
  source: StructDef;
  topValues: SearchValueMapResult[] | undefined;
  fieldIndex?: number | undefined;
  queryModifiers: QueryModifiers;
  model: ModelDef;
  modelPath: string | undefined;
}

const StageSummaryUI: React.FC<SummaryStageProps> = ({
  model,
  modelPath,
  stage,
  topValues,
  queryModifiers,
  source,
  stagePath,
}) => {
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number>();

  const beginReorderingField = (fieldIndex: number) => {
    setSelectedFieldIndex(fieldIndex);
  };

  const currentFieldOrdering = stage.items
    .map((item) => ("fieldIndex" in item ? item.fieldIndex : undefined))
    .filter(notUndefined);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const currentIndex = currentFieldOrdering.findIndex(
        (fieldIndex) => fieldIndex === selectedFieldIndex
      );
      const moveOffset =
        event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      const otherIndex = currentIndex + moveOffset;
      if (
        currentIndex > -1 &&
        moveOffset !== 0 &&
        otherIndex >= 0 &&
        otherIndex < currentFieldOrdering.length
      ) {
        const newList = [...currentFieldOrdering];
        const tempItem = newList[currentIndex];
        newList[currentIndex] = newList[otherIndex];
        newList[otherIndex] = tempItem;
        queryModifiers.updateFieldOrder(stagePath, newList);
        setSelectedFieldIndex(otherIndex);
      }
    };
    window.addEventListener("keyup", handle);
    return () => window.removeEventListener("keyup", handle);
  });

  return (
    <FieldListDiv>
      {stage.items.map((item, index) => (
        <SummaryItem
          model={model}
          modelPath={modelPath}
          key={`${item.type}/${index}`}
          item={item}
          stageSummary={stage.items}
          beginReorderingField={beginReorderingField}
          isSelected={
            "fieldIndex" in item && item.fieldIndex === selectedFieldIndex
          }
          deselect={() => setSelectedFieldIndex(undefined)}
          topValues={topValues}
          queryModifiers={queryModifiers}
          source={source}
          stagePath={stagePath}
        />
      ))}
    </FieldListDiv>
  );
};

const FieldListDiv = styled.div`
  display: flex;
  gap: 2px;
  flex-direction: column;
`;

interface ClickToPopoverProps {
  popoverContent: (props: {
    setOpen: (open: boolean) => void;
    closeMenu: () => void;
  }) => ReactElement;
  content: (props: { isOpen: boolean; closeMenu: () => void }) => ReactElement;
}

const ClickToPopover: React.FC<ClickToPopoverProps> = ({
  popoverContent,
  content,
}) => {
  const [open, setOpen] = useState(false);
  const closing = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    closing.current = true;
    setOpen(false);
  };

  useEffect(() => {
    closing.current = false;
  }, [open]);

  return (
    <>
      <ClickToPopoverDiv onClick={() => !closing.current && setOpen(true)}>
        <div ref={ref} key={open ? "open" : "closed"}>
          {content({ isOpen: open, closeMenu })}
        </div>
        <Popover open={open} setOpen={setOpen} referenceDiv={ref}>
          {popoverContent({ setOpen, closeMenu })}
        </Popover>
      </ClickToPopoverDiv>
    </>
  );
};

const ClickToPopoverDiv = styled.div`
  position: relative;
`;

interface SummaryItemProps {
  item: QuerySummaryItem;
  source: StructDef;
  stagePath: StagePath;
  stageSummary: QuerySummaryItem[];
  beginReorderingField: (fieldIndex: number) => void;
  fieldIndex?: number | undefined;
  isSelected: boolean;
  deselect: () => void;
  topValues: SearchValueMapResult[] | undefined;
  queryModifiers: QueryModifiers;
  model: ModelDef;
  modelPath: string | undefined;
}

const SummaryItem: React.FC<SummaryItemProps> = ({
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
  topValues,
  queryModifiers,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const children: {
    childItem: QuerySummaryItem;
    fieldIndex?: number;
  }[] = [];
  if ("styles" in item && item.styles) {
    children.push(...item.styles.map((childItem) => ({ childItem })));
  }
  if ("filters" in item && item.filters) {
    children.push(
      ...item.filters.map((childItem) => ({
        childItem,
        fieldIndex: item.fieldIndex,
      }))
    );
  }

  useClickOutside(ref, () => isSelected && deselect());

  return (
    <div ref={ref}>
      <ClickToPopover
        popoverContent={({ closeMenu }) => {
          if (
            (item.type === "field" || item.type === "field_definition") &&
            item.kind !== "query"
          ) {
            if (item.kind === "dimension") {
              return (
                <DimensionActionMenu
                  model={model}
                  modelPath={modelPath}
                  source={source}
                  removeField={() =>
                    queryModifiers.removeField(stagePath, item.fieldIndex)
                  }
                  rename={(newName) => {
                    queryModifiers.renameField(
                      stagePath,
                      item.fieldIndex,
                      newName
                    );
                  }}
                  closeMenu={closeMenu}
                  setDataStyle={(renderer) =>
                    queryModifiers.setDataStyle(item.name, renderer)
                  }
                  stagePath={stagePath}
                  stageSummary={stageSummary}
                  updateFieldOrder={queryModifiers.updateFieldOrder}
                  fieldIndex={item.fieldIndex}
                  beginReorderingField={() => {
                    beginReorderingField(item.fieldIndex);
                    closeMenu();
                  }}
                  filterField={item.type === "field" ? item.field : undefined}
                  filterFieldPath={
                    item.type === "field" ? item.path : undefined
                  }
                  name={item.name}
                  isEditable={item.type === "field_definition"}
                  definition={
                    item.type === "field_definition" ? item.source : undefined
                  }
                  addFilter={queryModifiers.addFilter}
                  editDimension={(fieldIndex, dimension) =>
                    queryModifiers.editDimension(
                      stagePath,
                      fieldIndex,
                      dimension
                    )
                  }
                  addOrderBy={queryModifiers.addOrderBy}
                  orderByField={{
                    name: item.name,
                    fieldIndex: item.fieldIndex,
                    type: scalarTypeOfField(item.field),
                  }}
                />
              );
            } else if (item.kind === "measure") {
              const isRenamed =
                item.type === "field_definition" ||
                (item.kind === "measure" && item.isRenamed);
              return (
                <AggregateActionMenu
                  model={model}
                  modelPath={modelPath}
                  stagePath={stagePath}
                  source={source}
                  removeField={() =>
                    queryModifiers.removeField(stagePath, item.fieldIndex)
                  }
                  addFilter={(filter, as) =>
                    queryModifiers.addFilterToField(
                      stagePath,
                      item.fieldIndex,
                      filter,
                      as
                    )
                  }
                  rename={(newName) => {
                    queryModifiers.renameField(
                      stagePath,
                      item.fieldIndex,
                      newName
                    );
                  }}
                  closeMenu={closeMenu}
                  setDataStyle={(renderer) =>
                    queryModifiers.setDataStyle(item.name, renderer)
                  }
                  isRenamed={isRenamed}
                  beginReorderingField={() => {
                    beginReorderingField(item.fieldIndex);
                    closeMenu();
                  }}
                  fieldIndex={item.fieldIndex}
                  name={item.name}
                  isEditable={item.type === "field_definition"}
                  definition={
                    item.type === "field_definition" ? item.source : undefined
                  }
                  editMeasure={(fieldIndex, dimension) =>
                    queryModifiers.editMeasure(stagePath, fieldIndex, dimension)
                  }
                  topValues={topValues}
                  addOrderBy={queryModifiers.addOrderBy}
                  orderByField={{
                    name: item.name,
                    fieldIndex: item.fieldIndex,
                    type: scalarTypeOfField(item.field),
                  }}
                />
              );
            }
          } else if (item.type === "filter") {
            return (
              <FilterActionMenu
                model={model}
                modelPath={modelPath}
                source={source}
                filterSource={item.filterSource}
                filterField={item.field}
                fieldPath={item.fieldPath}
                parsedFilter={item.parsed}
                removeFilter={() =>
                  queryModifiers.removeFilter(stagePath, item.filterIndex)
                }
                editFilter={(filter) =>
                  queryModifiers.editFilter(
                    stagePath,
                    fieldIndex,
                    item.filterIndex,
                    filter
                  )
                }
                closeMenu={closeMenu}
              />
            );
          } else if (item.type === "limit") {
            return (
              <LimitActionMenu
                removeLimit={() => queryModifiers.removeLimit(stagePath)}
                editLimit={(limit) =>
                  queryModifiers.editLimit(stagePath, limit)
                }
                closeMenu={closeMenu}
                limit={item.limit}
              />
            );
          } else if (item.type === "order_by") {
            return (
              <OrderByActionMenu
                removeOrderBy={() =>
                  queryModifiers.removeOrderBy(stagePath, item.orderByIndex)
                }
                closeMenu={closeMenu}
                orderByField={item.byField}
                orderByIndex={item.orderByIndex}
                existingDirection={item.direction}
                editOrderBy={(direction) =>
                  queryModifiers.editOrderBy(
                    stagePath,
                    item.orderByIndex,
                    direction
                  )
                }
              />
            );
          } else if (item.type === "data_style") {
            return (
              <DataStyleActionMenu
                onComplete={closeMenu}
                setDataStyle={(renderer) =>
                  queryModifiers.setDataStyle(item.styleKey, renderer)
                }
                allowedRenderers={item.allowedRenderers}
              />
            );
          } else if (
            item.type === "nested_query_definition" ||
            (item.type === "field" && item.kind === "query")
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
                toggleField={queryModifiers.toggleField}
                addFilter={queryModifiers.addFilter}
                addLimit={queryModifiers.addLimit}
                addOrderBy={queryModifiers.addOrderBy}
                addNewNestedQuery={queryModifiers.addNewNestedQuery}
                stagePath={nestStagePath}
                remove={() =>
                  queryModifiers.removeField(stagePath, item.fieldIndex)
                }
                orderByFields={item.stages[0].orderByFields}
                addNewDimension={queryModifiers.addNewDimension}
                addNewMeasure={queryModifiers.addNewMeasure}
                closeMenu={closeMenu}
                setDataStyle={(renderer) =>
                  queryModifiers.setDataStyle(item.name, renderer)
                }
                addStage={() =>
                  queryModifiers.addStage(stagePath, item.fieldIndex)
                }
                stageSummary={item.stages[0].items}
                updateFieldOrder={queryModifiers.updateFieldOrder}
                topValues={topValues}
                rename={(newName) => {
                  queryModifiers.renameField(
                    stagePath,
                    item.fieldIndex,
                    newName
                  );
                }}
                beginReorderingField={() => {
                  beginReorderingField(item.fieldIndex);
                  closeMenu();
                }}
                isExpanded={item.type === "nested_query_definition"}
                replaceWithDefinition={() =>
                  queryModifiers.replaceWithDefinition(
                    stagePath,
                    item.fieldIndex
                  )
                }
              />
            );
          } else if (item.type === "error_field") {
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
        }}
        content={({ isOpen, closeMenu }) => {
          if (item.type === "field" || item.type === "field_definition") {
            const isSaved = item.type === "field" && !item.isRefined;
            let button: ReactElement;
            if (item.kind === "dimension") {
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
            } else if (item.kind === "measure") {
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
                      fieldPath={item.type === "field" ? item.path : undefined}
                      definition={
                        item.type !== "field" ? item.source : undefined
                      }
                      topValues={undefined}
                    />
                  );
                }}
              />
            );
          } else if (item.type === "filter") {
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
                    <FieldDetailPanel
                      filterExpression={item.filterSource}
                      topValues={undefined}
                    />
                  );
                }}
              />
            );
          } else if (item.type === "limit") {
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
          } else if (item.type === "order_by") {
            return (
              <FieldButton
                icon={<ActionIcon action="order_by" />}
                name={`${item.byField.name} ${item.direction || ""}`}
                canRemove={true}
                onRemove={() => {
                  queryModifiers.removeOrderBy(stagePath, item.orderByIndex);
                  closeMenu();
                }}
                color="other"
                active={isOpen || isSelected}
              />
            );
          } else if (item.type === "data_style") {
            return (
              <FieldButton
                icon={<VisIcon renderer={item.renderer} />}
                name={item.renderer}
                color="other"
                canRemove={item.canRemove}
                onRemove={() => {
                  queryModifiers.setDataStyle(item.styleKey, undefined);
                  closeMenu();
                }}
                active={isOpen || isSelected}
              />
            );
          } else if (item.type === "nested_query_definition") {
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
          } else if (item.type === "error_field") {
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
      {item.type === "nested_query_definition" &&
        (item.stages[0].items.length > 0 || item.stages.length > 1) &&
        item.stages.map((stage, stageIndex) => {
          const nestStagePath = stagePathPush(stagePath, {
            fieldIndex: item.fieldIndex,
            stageIndex,
          });
          return (
            <ListNest key={"stage/" + stageIndex}>
              {item.stages.length > 1 && (
                <ClickToPopover
                  popoverContent={({ closeMenu }) => (
                    <StageActionMenu
                      model={model}
                      modelPath={modelPath}
                      source={stage.inputSource}
                      toggleField={queryModifiers.toggleField}
                      addFilter={queryModifiers.addFilter}
                      addLimit={queryModifiers.addLimit}
                      addOrderBy={queryModifiers.addOrderBy}
                      addNewNestedQuery={queryModifiers.addNewNestedQuery}
                      stagePath={nestStagePath}
                      remove={() => queryModifiers.removeStage(nestStagePath)}
                      orderByFields={stage.orderByFields}
                      addNewDimension={queryModifiers.addNewDimension}
                      addNewMeasure={queryModifiers.addNewMeasure}
                      closeMenu={closeMenu}
                      setDataStyle={(renderer) =>
                        queryModifiers.setDataStyle(item.name, renderer)
                      }
                      isLastStage={stageIndex === item.stages.length - 1}
                      stageSummary={stage.items}
                      updateFieldOrder={queryModifiers.updateFieldOrder}
                      topValues={topValues}
                    />
                  )}
                  content={({ isOpen }) => (
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
                stage={stage}
                stagePath={nestStagePath}
                source={source}
                topValues={topValues}
                queryModifiers={queryModifiers}
              />
            </ListNest>
          );
        })}
      {children.length > 0 && (
        <ListNest>
          <FieldListDiv>
            {children.map(({ childItem, fieldIndex }, index) => {
              return (
                <SummaryItem
                  model={model}
                  modelPath={modelPath}
                  key={"child:" + index}
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
                  topValues={topValues}
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

export const StageButton = styled.div<{
  active: boolean;
}>`
  text-transform: uppercase;
  font-size: 12px;
  border: none;
  overflow: hidden;
  background-color: transparent;
  border-radius: 50px;
  padding: 5px 7px 5px 10px;
  text-align: left;
  margin-bottom: 2px;
  user-select: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  font-family: "Google Sans";
  color: #9aa0a6;

  &:hover {
    .back {
      visibility: visible;
    }
  }

  .back {
    visibility: hidden;
  }

  &:hover {
    background-color: #f7f8f8;
  }

  ${({ active }) => {
    return active
      ? `
      background-color: #f7f8f8;
      .back {
        visibility: visible;
      }
    `
      : "";
  }}
`;
