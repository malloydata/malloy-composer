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
  SearchValueMapResult,
  StructDef,
} from "@malloydata/malloy";
import { useState } from "react";
import { AddFilter } from "../AddFilter";
import {
  ContextMenuContent,
  ContextMenuSearchHeader,
  EmptyMessage,
  ScrollMain,
} from "../CommonElements";
import { useSearch } from "../data";
import { FieldList } from "../FieldList";
import { SearchInput } from "../SearchInput";
import { useSearchList } from "../SearchList";
import { LoadingSpinner } from "../Spinner";
import {
  fieldToSummaryItem,
  flatFields,
  isDimension,
  termsForField,
} from "../utils";
import { FieldButton } from "../FieldButton";
import { ActionIcon } from "../ActionIcon";
import { compileFilter } from "../../core/compile";
import { stringFilterToString } from "../../core/filters";

interface FilterContextBarProps {
  source: StructDef;
  addFilter: (filter: FilterExpression, as?: string) => void;
  onComplete: () => void;
  needsRename: boolean;
  topValues: SearchValueMapResult[] | undefined;
  model: ModelDef;
  modelPath: string;
}

export const FilterContextBar: React.FC<FilterContextBarProps> = ({
  model,
  modelPath,
  source,
  addFilter,
  onComplete,
  needsRename,
  topValues,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [field, setField] = useState<{ path: string; def: FieldDef }>();
  const { searchResults, isLoading } = useSearch(
    model,
    modelPath,
    source,
    searchTerm
  );
  const stringSearchResults =
    searchResults &&
    searchResults.filter((r) => r.fieldType === "string").slice(0, 100);

  const searchItems = flatFields(source)
    .filter(({ field }) => isDimension(field))
    .map(({ field, path }) => ({
      item: fieldToSummaryItem(field, path),
      terms: termsForField(field, path),
      key: keyFor(path),
      select: () => setField({ path, def: field }),
    }));

  const { searchList, count: resultCount } = useSearchList({
    searchTerm,
    items: searchItems || [],
    topValues,
  });

  const valueResultCount = stringSearchResults?.length || 0;

  const showFieldResults = resultCount > 0;
  const showValueResults = valueResultCount > 0 || isLoading;

  return (
    <div>
      {!field && (
        <ContextMenuSearchHeader>
          <SearchInput
            placeholder="Search"
            value={searchTerm}
            setValue={setSearchTerm}
            autoFocus={true}
          />
        </ContextMenuSearchHeader>
      )}
      <div>
        {field && (
          <AddFilter
            model={model}
            modelPath={modelPath}
            source={source}
            fieldPath={field.path}
            field={field.def}
            addFilter={addFilter}
            onComplete={onComplete}
            needsRename={needsRename}
          />
        )}
        {!field && (
          <>
            {searchTerm === "" && (
              <ScrollMain>
                <ContextMenuContent>
                  <FieldList
                    fields={source.fields}
                    filter={isDimension}
                    showNested={true}
                    selectField={(path, def) => setField({ path, def })}
                    topValues={topValues}
                  />
                </ContextMenuContent>
              </ScrollMain>
            )}
            {searchTerm !== "" && (
              <>
                {showFieldResults && (
                  <ScrollMain
                    style={{
                      borderBottom: showFieldResults ? "1px solid #efefef" : "",
                      maxHeight: showValueResults ? "200px" : "300px",
                    }}
                  >
                    <ContextMenuContent>{searchList}</ContextMenuContent>
                  </ScrollMain>
                )}
                {showValueResults && source && (
                  <ScrollMain
                    style={{
                      borderBottom: "1px solid #efefef",
                      maxHeight: showFieldResults ? "200px" : "300px",
                    }}
                  >
                    <ContextMenuContent>
                      {stringSearchResults &&
                        stringSearchResults.length > 0 &&
                        stringSearchResults.map((searchResult, index) => {
                          return (
                            <FieldButton
                              key={index}
                              name={searchResult.fieldValue}
                              detail={searchResult.fieldName}
                              icon={<ActionIcon action="filter" />}
                              color="filter"
                              onClick={() => {
                                compileFilter(
                                  source,
                                  stringFilterToString(searchResult.fieldName, {
                                    type: "is_equal_to",
                                    values: [searchResult.fieldValue],
                                  })
                                ).then((expression) => {
                                  addFilter && addFilter(expression);
                                  onComplete();
                                });
                              }}
                            />
                          );
                        })}
                      {stringSearchResults !== undefined &&
                        stringSearchResults.length === 0 && (
                          <EmptyMessage>No value results</EmptyMessage>
                        )}
                      {isLoading && (
                        <EmptyMessage>
                          <LoadingSpinner text="Loading value results..." />
                        </EmptyMessage>
                      )}
                    </ContextMenuContent>
                  </ScrollMain>
                )}
              </>
            )}
            {!showFieldResults && !showValueResults && (
              <EmptyMessage>No results</EmptyMessage>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export function keyFor(path: string): string {
  return "field/" + path;
}
