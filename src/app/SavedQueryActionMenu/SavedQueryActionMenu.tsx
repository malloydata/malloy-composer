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
import { FilterExpression, StructDef } from "@malloydata/malloy";
import { RendererName } from "../../types";
import { ActionMenu } from "../ActionMenu";
import { DataStyleContextBar } from "../DataStyleContextBar";
import { RenameField } from "../RenameField";

interface SavedQueryActionMenuProps {
  source: StructDef;
  removeField: () => void;
  addFilter: (filter: FilterExpression) => void;
  addLimit: () => void;
  renameField: (newName: string) => void;
  replaceWithDefinition: () => void;
  closeMenu: () => void;
  setDataStyle: (renderer: RendererName) => void;
  beginReorderingField: () => void;
}

export const SavedQueryActionMenu: React.FC<SavedQueryActionMenuProps> = ({
  renameField,
  replaceWithDefinition,
  closeMenu,
  setDataStyle,
  beginReorderingField,
}) => {
  return (
    <ActionMenu
      closeMenu={closeMenu}
      actions={[
        {
          kind: "sub_menu",
          id: "rename",
          iconName: "rename",
          iconColor: "other",
          label: "Rename",
          closeOnComplete: true,
          Component: ({ onComplete }) => (
            <RenameField rename={renameField} onComplete={onComplete} />
          ),
        },
        {
          kind: "sub_menu",
          id: "style",
          label: "Style",
          iconColor: "other",
          iconName: "style",
          closeOnComplete: true,
          Component: ({ onComplete }) => (
            <DataStyleContextBar
              setDataStyle={setDataStyle}
              onComplete={onComplete}
              allowedRenderers={[
                "table",
                "bar_chart",
                "dashboard",
                "json",
                "line_chart",
                "list",
                "list_detail",
                "point_map",
                "scatter_chart",
                "segment_map",
                "shape_map",
                "sparkline",
              ]}
            />
          ),
        },
        {
          kind: "one_click",
          id: "expand_definition",
          label: "Duplicate",
          iconName: "duplicate",
          iconColor: "other",
          onClick: replaceWithDefinition,
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
