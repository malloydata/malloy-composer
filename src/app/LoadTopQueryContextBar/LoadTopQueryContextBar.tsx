/*
 * Copyright 2022 Google LLC
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

import { ModelDef, StructDef, NamedQuery, TurtleDef, FieldDef, flattenQuery, NamedModelObject } from "@malloydata/malloy";
import { useState } from "react";
import {
  ContextMenuContent,
  ContextMenuOuter,
  ContextMenuSearchHeader,
  ScrollMain,
} from "../CommonElements";
import { FieldList } from "../FieldList";
import { SearchInput } from "../SearchInput";
import { SearchList } from "../SearchList";
import {
  fieldToSummaryItem,
  flatFields,
  isQuery,
  pathParent,
  termsForField,
} from "../utils";

interface LoadTopQueryContextBarProps {
  model: ModelDef | undefined;
  source: StructDef;
  selectField: (field: FieldDef) => void;
  onComplete: () => void;
}

export const LoadTopQueryContextBar: React.FC<LoadTopQueryContextBarProps> = ({
  model,
  source,
  selectField,
  onComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const modelQueries = model && source ? queriesForSourceInModel(model, source) : [];
  const fields = [...source.fields, ...modelQueries];
  return (
    <ContextMenuOuter>
      <ContextMenuSearchHeader>
        <SearchInput
          placeholder="Search"
          value={searchTerm}
          setValue={setSearchTerm}
          autoFocus={true}
        />
      </ContextMenuSearchHeader>
      <ScrollMain>
        <ContextMenuContent>
          {searchTerm === "" && (
            <FieldList
              fields={fields}
              filter={(field) => field.type === "turtle"}
              showNested={true}
              selectField={(_, fieldDef) => {
                selectField(fieldDef);
                onComplete();
              }}
              topValues={undefined}
            />
          )}
          {searchTerm !== "" && (
            <>
              <SearchList
                topValues={undefined}
                searchTerm={searchTerm}
                items={fields
                  .map((field) => ({ field, path: field.as || field.name }))
                  .filter(({ field }) => isQuery(field))
                  .map(({ field, path }) => ({
                    item: fieldToSummaryItem(field, path),
                    terms: [...termsForField(field, path), "query"],
                    detail: pathParent(path),
                    key: keyFor(path),
                    select: () => {
                      selectField(field);
                      onComplete();
                    },
                  }))}
              />
            </>
          )}
        </ContextMenuContent>
      </ScrollMain>
    </ContextMenuOuter>
  );
};

export function keyFor(path: string): string {
  return "load/" + path;
}

function itemIsQuery(item: NamedModelObject): item is NamedQuery {
  return item.type === "query"
}

export function queriesForSourceInModel(modelDef: ModelDef, source: StructDef): TurtleDef[] {
  return Object.values(modelDef.contents)
    .filter(itemIsQuery)
    .filter((item) => item.structRef === (source.as || source.name))
    .flatMap((item) => {
      try {
        const turtleDef = flattenQuery(modelDef, item);
        return [turtleDef];
      } catch (error) {
        console.error(error);
        return [];
      }
    });
}
