/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ModelDef, SearchIndexResult, StructDef} from '@malloydata/malloy';
import {SearchContext} from '../contexts/search_context';
import {useContext} from 'react';

export function useSearch(
  _model: ModelDef | undefined,
  _modelPath: string | undefined,
  _source: StructDef | undefined,
  searchTerm: string,
  fieldPath?: string
): {searchResults: SearchIndexResult[] | undefined; isLoading: boolean} {
  const {topValues} = useContext(SearchContext);
  if (topValues && searchTerm) {
    let searchValues = topValues;

    if (fieldPath) {
      const fieldValues = topValues.find(
        value => value.fieldName === fieldPath
      );
      if (fieldValues) {
        searchValues = [fieldValues];
      } else {
        searchValues = [];
      }
    }

    searchTerm = searchTerm.toLowerCase();

    return {
      searchResults: searchValues.reduce<SearchIndexResult[]>(
        (acc, searchValue) => {
          searchValue.values
            .filter(
              value =>
                value.fieldValue?.toLowerCase().includes(searchTerm) ?? false
            )
            .forEach(value => {
              acc.push({
                fieldValue: value.fieldValue,
                fieldName: searchValue.fieldName,
                fieldType: 'string',
                weight: value.weight,
              });
            });
          return acc;
        },
        []
      ),
      isLoading: false,
    };
  }
  return {
    searchResults: undefined,
    isLoading: false,
  };
}
