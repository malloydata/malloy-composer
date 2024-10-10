import {ModelDef, StructDef} from '@malloydata/malloy';

export function useSearch(
  _model: ModelDef,
  _modelPath: string,
  _source: StructDef | undefined,
  _searchTerm: string,
  _fieldPath?: string
) {
  return {
    searchResults: undefined,
    isLoading: false,
  };
}

// const { searchResults, isLoading } = useSearch(
//     model,
//     modelPath,
//     source,
//     searchValue,
//     fieldPath
//   );
