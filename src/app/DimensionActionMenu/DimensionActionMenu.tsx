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
  FieldDef,
  FilterExpression,
  QueryFieldDef,
  StructDef,
  ModelDef,
} from "@malloydata/malloy";
import {
  RendererName,
  StagePath,
  QuerySummaryItem,
  OrderByField,
} from "../../types";
import { ActionMenu } from "../ActionMenu";
import { AddFilter } from "../AddFilter";
import { AddNewDimension } from "../AddNewDimension";
import { DataStyleContextBar } from "../DataStyleContextBar";
import { EditOrderBy } from "../EditOrderBy";
import { RenameField } from "../RenameField";

interface DimensionActionMenuProps {
  model: ModelDef;
  removeField: () => void;
  rename: (name: string) => void;
  closeMenu: () => void;
  setDataStyle: (renderer: RendererName) => void;
  updateFieldOrder: (stagePath: StagePath, ordering: number[]) => void;
  stagePath: StagePath;
  fieldIndex: number;
  stageSummary: QuerySummaryItem[];
  beginReorderingField: () => void;
  isEditable: boolean;
  name: string;
  definition: string | undefined;
  editDimension: (fieldIndex: number, dimension: QueryFieldDef) => void;
  source: StructDef;
  filterField?: FieldDef;
  filterFieldPath?: string;
  addFilter: (stagePath: StagePath, filterExpression: FilterExpression) => void;
  addOrderBy: (
    stagePath: StagePath,
    fieldIndex: number,
    direction?: "asc" | "desc"
  ) => void;
  orderByField: OrderByField;
  modelPath: string | undefined;
}

export const DimensionActionMenu: React.FC<DimensionActionMenuProps> = ({
  source,
  model,
  modelPath,
  rename,
  name,
  closeMenu,
  setDataStyle,
  fieldIndex,
  beginReorderingField,
  isEditable,
  editDimension,
  definition,
  filterField,
  filterFieldPath,
  addFilter,
  stagePath,
  addOrderBy,
  orderByField,
}) => {
  return (
    <ActionMenu
      closeMenu={closeMenu}
      actions={[
        {
          kind: "sub_menu",
          id: "rename",
          iconName: "rename",
          label: "Rename",
          iconColor: "other",
          closeOnComplete: true,
          Component: ({ onComplete }) => (
            <RenameField rename={rename} onComplete={onComplete} />
          ),
        },
        {
          kind: "sub_menu",
          id: "filter_on",
          iconName: "filter",
          label: "Filter By",
          iconColor: "filter",
          closeOnComplete: true,
          Component: ({ onComplete }) =>
            filterField && filterFieldPath ? (
              <AddFilter
                model={model}
                modelPath={modelPath}
                onComplete={onComplete}
                source={source}
                field={filterField}
                fieldPath={filterFieldPath}
                needsRename={false}
                addFilter={(filter) => addFilter(stagePath, filter)}
              />
            ) : (
              <div />
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
        // {
        //   kind: "sub_menu",
        //   id: "reorder",
        //   label: "Move Field",
        //   iconName: "order_by",
        //   iconColor: "other",
        //   closeOnComplete: true,
        //   Component: ({ onComplete }) => <ReorderFieldsContextBar
        //     stageSummary={stageSummary}
        //     updateFieldOrder={(order) => updateFieldOrder(stagePath, order)}
        //     onComplete={onComplete}
        //     fieldIndex={fieldIndex}
        //   />
        // },
        {
          kind: "sub_menu",
          id: "edit_definition",
          label: "Edit Definition",
          iconName: "edit",
          isEnabled: isEditable,
          iconColor: "other",
          closeOnComplete: true,
          Component: ({ onComplete }) => (
            <AddNewDimension
              source={source}
              addDimension={(code) => editDimension(fieldIndex, code)}
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
