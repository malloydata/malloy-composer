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
import { QueryFieldDef, StructDef } from "@malloydata/malloy";
import { useState } from "react";
import { ActionIcon } from "../ActionIcon";
import { AddNewMeasure } from "../AddNewMeasure";
import {
  ContextMenuContent,
  ContextMenuOuter,
  ContextMenuSearchHeader,
  ScrollMain,
} from "../CommonElements";
import { FieldButton } from "../FieldButton";
import { FieldList } from "../FieldList";
import { SearchInput } from "../SearchInput";
import { SearchList } from "../SearchList";
import {
  fieldToSummaryItem,
  flatFields,
  isAggregate,
  pathParent,
  termsForField,
} from "../utils";

interface AggregateContextBarProps {
  source: StructDef;
  selectField: (fieldPath: string) => void;
  addNewMeasure: (measure: QueryFieldDef) => void;
  onComplete: () => void;
}

export const AggregateContextBar: React.FC<AggregateContextBarProps> = ({
  source,
  selectField,
  addNewMeasure,
  onComplete,
}) => {
  const [isAddingNewField, setIsAddingNewField] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <ContextMenuOuter>
      {!isAddingNewField && (
        <>
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
                <>
                  <FieldButton
                    icon={<ActionIcon action="add" />}
                    onClick={() => setIsAddingNewField(true)}
                    name="New Measure"
                    color="other"
                  />
                  <FieldList
                    fields={source.fields}
                    filter={isAggregate}
                    showNested={true}
                    selectField={selectField}
                    topValues={undefined}
                  />
                </>
              )}
              {searchTerm !== "" && (
                <>
                  <SearchList
                    topValues={undefined}
                    searchTerm={searchTerm}
                    items={flatFields(source)
                      .filter(({ field }) => isAggregate(field))
                      .map(({ field, path }) => ({
                        item: fieldToSummaryItem(field, path),
                        terms: [...termsForField(field, path), "aggregate"],
                        detail: pathParent(path),
                        key: keyFor(path),
                        select: () => selectField(path),
                      }))}
                  />
                </>
              )}
            </ContextMenuContent>
          </ScrollMain>
        </>
      )}
      {isAddingNewField && (
        <AddNewMeasure
          addMeasure={addNewMeasure}
          source={source}
          onComplete={onComplete}
        />
      )}
    </ContextMenuOuter>
  );
};

export function keyFor(path: string): string {
  return "aggregate/" + path;
}
