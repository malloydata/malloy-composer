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
import {
  FilterExpression,
  ModelDef,
  QueryFieldDef,
  SearchValueMapResult,
  StructDef,
} from "@malloydata/malloy";
import { OrderByField, RendererName, StagePath } from "../../types";
import { FilterContextBar } from "../FilterContextBar";
import { RenameField } from "../RenameField";
import { ActionMenu } from "../ActionMenu";
import { DataStyleContextBar } from "../DataStyleContextBar";
import { AddNewMeasure } from "../AddNewMeasure";
import { EditOrderBy } from "../EditOrderBy";

interface AggregateActionMenuProps {
  source: StructDef;
  removeField: () => void;
  addFilter: (filter: FilterExpression, as?: string) => void;
  rename: (newName: string) => void;
  closeMenu: () => void;
  setDataStyle: (renderer: RendererName) => void;
  isRenamed: boolean;
  fieldIndex: number;
  beginReorderingField: () => void;
  isEditable: boolean;
  name: string;
  definition: string | undefined;
  editMeasure: (fieldIndex: number, measure: QueryFieldDef) => void;
  topValues: SearchValueMapResult[] | undefined;
  addOrderBy: (
    stagePath: StagePath,
    fieldIndex: number,
    direction?: "asc" | "desc"
  ) => void;
  orderByField: OrderByField;
  stagePath: StagePath;
  model: ModelDef | undefined;
  modelPath: string;
}

export const AggregateActionMenu: React.FC<AggregateActionMenuProps> = ({
  model,
  modelPath,
  source,
  addFilter,
  rename,
  closeMenu,
  setDataStyle,
  beginReorderingField,
  isRenamed,
  editMeasure,
  name,
  definition,
  isEditable,
  fieldIndex,
  topValues,
  addOrderBy,
  orderByField,
  stagePath,
}) => {
  return (
    <ActionMenu
      closeMenu={closeMenu}
      actions={[
        {
          kind: "sub_menu",
          id: "filter",
          iconName: "filter",
          iconColor: "filter",
          label: "Filter",
          closeOnComplete: true,
          Component: ({ onComplete }) => (
            <FilterContextBar
              model={model}
              modelPath={modelPath}
              source={source}
              addFilter={addFilter}
              onComplete={onComplete}
              needsRename={!isRenamed}
              topValues={topValues}
            />
          ),
        },
        {
          kind: "sub_menu",
          id: "rename",
          iconName: "rename",
          iconColor: "other",
          label: "Rename",
          closeOnComplete: true,
          Component: ({ onComplete }) => (
            <RenameField rename={rename} onComplete={onComplete} />
          ),
        },
        {
          kind: "sub_menu",
          id: "order_by",
          iconName: "order_by",
          label: "Order By",
          iconColor: "other",
          closeOnComplete: true,
          Component: ({ onComplete }) => (
            <EditOrderBy
              byField={orderByField}
              addOrderBy={(fieldIndex, direction) =>
                addOrderBy(stagePath, fieldIndex, direction)
              }
              onComplete={onComplete}
            />
          ),
        },
        {
          kind: "sub_menu",
          id: "style",
          label: "Style",
          iconName: "style",
          iconColor: "other",
          closeOnComplete: true,
          Component: ({ onComplete }) => (
            <DataStyleContextBar
              setDataStyle={setDataStyle}
              onComplete={onComplete}
              allowedRenderers={[
                "number",
                "boolean",
                "currency",
                "image",
                "link",
                "percent",
                "text",
                "time",
              ]}
            />
          ),
        },
        {
          kind: "sub_menu",
          id: "edit_definition",
          label: "Edit Definition",
          iconName: "edit",
          iconColor: "other",
          isEnabled: isEditable,
          closeOnComplete: true,
          Component: ({ onComplete }) => (
            <AddNewMeasure
              source={source}
              addMeasure={(code) => editMeasure(fieldIndex, code)}
              onComplete={onComplete}
              initialCode={definition}
              initialName={name}
            />
          ),
        },
        {
          kind: "one_click",
          id: "move",
          iconName: "move",
          iconColor: "other",
          label: "Move",
          onClick: beginReorderingField,
        },
      ]}
    />
  );
};
