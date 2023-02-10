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
  ModelDef,
  StructDef,
  NamedQuery,
  TurtleDef,
  FieldDef,
  flattenQuery,
  NamedModelObject,
} from "@malloydata/malloy";
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
  const modelQueries =
    model && source ? queriesForSourceInModel(model, source) : [];
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
  return item.type === "query";
}

export function queriesForSourceInModel(
  modelDef: ModelDef,
  source: StructDef
): TurtleDef[] {
  return Object.values(modelDef.contents)
    .filter(itemIsQuery)
    .filter((item) => item.structRef === (source.as || source.name))
    .flatMap((item) => {
      try {
        const turtleDef = flattenQuery(modelDef, item);
        return [turtleDef];
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return [];
      }
    });
}
