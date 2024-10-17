import {ModelDef, SearchIndexResult, StructDef} from '@malloydata/malloy';

export function useSearch(
  _model: ModelDef | undefined,
  _modelPath: string | undefined,
  _source: StructDef | undefined,
  _searchTerm: string,
  _fieldPath?: string
) {
  return {
    searchResults: [] as SearchIndexResult[],
    isLoading: false,
  };
}
