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
  ModelDef,
  StructDef,
} from "@malloydata/malloy";
import { Filter } from "../../types";
import { ActionMenu } from "../ActionMenu";
import { AddFilter } from "../AddFilter";
import { EditFilter } from "../EditFilter";

interface FilterActionMenuProps {
  model: ModelDef | undefined;
  modelPath: string;
  source: StructDef;
  filterSource: string;
  removeFilter: () => void;
  editFilter: (filter: FilterExpression) => void;
  closeMenu: () => void;
  filterField: FieldDef | undefined;
  parsedFilter: Filter | undefined;
  fieldPath: string | undefined;
}

export const FilterActionMenu: React.FC<FilterActionMenuProps> = ({
  filterSource,
  editFilter,
  closeMenu,
  source,
  filterField,
  parsedFilter,
  model,
  modelPath,
  fieldPath,
}) => {
  return (
    <ActionMenu
      closeMenu={closeMenu}
      actions={[
        {
          id: "edit",
          label: "Change filter",
          iconName: "filter",
          iconColor: "filter",
          kind: "sub_menu",
          closeOnComplete: true,
          Component: ({ onComplete }) =>
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
