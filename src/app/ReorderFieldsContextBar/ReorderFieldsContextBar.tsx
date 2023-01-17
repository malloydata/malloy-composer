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
import { useEffect, useState } from "react";
import { QuerySummaryItem } from "../../types";
import { ActionIcon, ActionIconName } from "../ActionIcon";
import {
  Button,
  ContextMenuMain,
  RightButtonRow,
  ContextMenuTitle,
  EmptyMessage,
} from "../CommonElements";
import { FieldButton } from "../FieldButton";
import { notUndefined } from "../utils";

interface ReorderFieldsContextBarProps {
  updateFieldOrder: (newOrdering: number[]) => void;
  stageSummary: QuerySummaryItem[];
  onComplete: () => void;
  fieldIndex?: number;
}

export const ReorderFieldsContextBar: React.FC<
  ReorderFieldsContextBarProps
> = ({ updateFieldOrder, stageSummary, onComplete, fieldIndex }) => {
  const [selectedField, setSelectedField] = useState<number | undefined>(
    fieldIndex
  );

  const originalOrdering = stageSummary
    .map((item) => {
      if (
        item.type === "field" ||
        item.type === "field_definition" ||
        item.type === "nested_query_definition"
      ) {
        const kind =
          item.type === "field" || item.type === "field_definition"
            ? item.kind
            : "query";
        const action: ActionIconName =
          kind === "dimension"
            ? "group_by"
            : kind === "measure"
            ? "aggregate"
            : "nest";
        return {
          fieldIndex: item.fieldIndex,
          kind,
          name: item.name,
          action,
        };
      } else {
        return undefined;
      }
    })
    .filter(notUndefined);

  const [currentOrdering, setCurrentOrdering] = useState(originalOrdering);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const currentIndex = currentOrdering.findIndex(
        (item) => item.fieldIndex === selectedField
      );
      const moveOffset =
        event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      const otherIndex = currentIndex + moveOffset;
      if (
        currentIndex > -1 &&
        moveOffset !== 0 &&
        otherIndex >= 0 &&
        otherIndex < currentOrdering.length
      ) {
        const newList = [...currentOrdering];
        const tempItem = newList[currentIndex];
        newList[currentIndex] = newList[otherIndex];
        newList[otherIndex] = tempItem;
        setCurrentOrdering(newList);
      }
    };
    window.addEventListener("keyup", handle);
    return () => window.removeEventListener("keyup", handle);
  });

  return (
    <ContextMenuMain>
      <ContextMenuTitle>Reorder Fields</ContextMenuTitle>
      {currentOrdering.map((item) => {
        const active = selectedField === item.fieldIndex;
        const disableHover = selectedField !== undefined;
        return (
          <FieldButton
            key={item.fieldIndex}
            icon={<ActionIcon action={item.action} />}
            name={item.name}
            color={item.kind}
            onClick={() =>
              setSelectedField(
                fieldIndex || active ? undefined : item.fieldIndex
              )
            }
            active={active}
            disableHover={disableHover}
          />
        );
      })}
      {currentOrdering.length === 0 && (
        <EmptyMessage>Query has no fields.</EmptyMessage>
      )}
      <RightButtonRow>
        <Button type="button" color="secondary" onClick={onComplete}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            updateFieldOrder(currentOrdering.map((item) => item.fieldIndex));
            onComplete();
          }}
        >
          Save
        </Button>
      </RightButtonRow>
    </ContextMenuMain>
  );
};
