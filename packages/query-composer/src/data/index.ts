import { ModelDef, StructDef } from "@malloydata/malloy";

export function useSearch(
  model: ModelDef,
  modelPath: string,
  source: StructDef | undefined,
  searchTerm: string,
  fieldPath?: string
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
