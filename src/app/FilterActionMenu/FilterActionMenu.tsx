/*
 * Copyright 2021 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
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
