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
  FilterExpression,
  QueryFieldDef,
  StructDef,
  Result as MalloyResult,
  ModelDef,
  NamedQuery,
  TurtleDef,
} from "@malloydata/malloy";
import { DataStyles } from "@malloydata/render";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QueryBuilder } from "../../core/query";
import { QuerySummary, RendererName, StagePath } from "../../types";
import { useRunQuery } from "../data/use_run_query";

interface UseQueryBuilderResult {
  queryBuilder: React.MutableRefObject<QueryBuilder | undefined>;
  queryMalloy: {
    model: string;
    source: string;
    markdown: string;
    isRunnable: boolean;
  };
  queryName: string;
  clearQuery: (noURLUpdate?: boolean) => void;
  runQuery: () => void;
  isRunning: boolean;
  clearResult: () => void;
  source: StructDef | undefined;
  queryModifiers: QueryModifiers;
  querySummary: QuerySummary | undefined;
  result: MalloyResult | undefined;
  dataStyles: DataStyles;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
  registerNewSource: (source: StructDef) => void;
  dirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  resetUndoHistory: () => void;
  isQueryEmpty: boolean;
  canQueryRun: boolean;
}

export interface QueryModifiers {
  addFilter: (
    stagePath: StagePath,
    filter: FilterExpression,
    as?: string
  ) => void;
  toggleField: (stagePath: StagePath, fieldPath: string) => void;
  addLimit: (stagePath: StagePath, limit: number) => void;
  addOrderBy: (
    stagePath: StagePath,
    byFieldIndex: number,
    direction?: "asc" | "desc"
  ) => void;
  addNewNestedQuery: (stagePath: StagePath, name: string) => void;
  addNewDimension: (stagePath: StagePath, dimension: QueryFieldDef) => void;
  addNewMeasure: (stagePath: StagePath, measure: QueryFieldDef) => void;
  setDataStyle: (
    name: string,
    renderer: RendererName | undefined,
    noURLUpdate?: boolean
  ) => DataStyles;
  setDataStyles: (styles: DataStyles, noURLUpdate?: boolean) => void;
  addStage: (stagePath: StagePath | undefined, fieldIndex?: number) => void;
  replaceQuery: (field: TurtleDef) => void;
  loadQuery: (queryPath: string) => void;
  updateFieldOrder: (stagePath: StagePath, newOrdering: number[]) => void;
  removeField: (stagePath: StagePath, fieldIndex: number) => void;
  removeFilter: (
    stagePath: StagePath,
    filterIndex: number,
    fieldIndex?: number
  ) => void;
  removeLimit: (stagePath: StagePath) => void;
  removeOrderBy: (stagePath: StagePath, orderByIndex: number) => void;
  renameField: (
    stagePath: StagePath,
    fieldIndex: number,
    newName: string
  ) => void;
  addFilterToField: (
    stagePath: StagePath,
    fieldIndex: number,
    filter: FilterExpression,
    as?: string
  ) => void;
  editLimit: (stagePath: StagePath, limit: number) => void;
  editFilter: (
    stagePath: StagePath,
    fieldIndex: number | undefined,
    filterIndex: number,
    filter: FilterExpression
  ) => void;
  replaceWithDefinition: (stagePath: StagePath, fieldIndex: number) => void;
  editDimension: (
    stagePath: StagePath,
    fieldIndex: number,
    dimension: QueryFieldDef
  ) => void;
  editMeasure: (
    stagePath: StagePath,
    fieldIndex: number,
    measure: QueryFieldDef
  ) => void;
  editOrderBy: (
    stagePath: StagePath,
    orderByIndex: number,
    direction: "asc" | "desc" | undefined
  ) => void;
  removeStage: (stagePath: StagePath) => void;
  clearQuery: (noURLUpdate?: boolean) => void;
  onDrill: (filters: FilterExpression[]) => void;
  setQuery: (query: NamedQuery, noURLUpdate?: boolean) => void;
}

export function useQueryBuilder(
  model?: ModelDef,
  modelPath?: string,
  updateQueryInURL?: (params: {
    run: boolean;
    query: string | undefined;
    styles: DataStyles;
  }) => void,
  modelDataStyles?: DataStyles
): UseQueryBuilderResult {
  const queryBuilder = useRef<QueryBuilder>(new QueryBuilder(undefined));
  const [error, setError] = useState<Error | undefined>();
  const [dirty, setDirty] = useState(false);
  const [, setVersion] = useState(0);
  const history = useRef({ size: 0, position: 0 });
  const navigate = useNavigate();

  const dataStyles = useRef<DataStyles>({});

  const registerNewSource = (source: StructDef) => {
    queryBuilder.current.updateSource(source);
  };

  const queryName = queryBuilder.current.getQuery()?.name;

  const {
    result,
    runQuery: runQueryRaw,
    isRunning,
    clearResult,
  } = useRunQuery(setError, model, modelPath);

  const runQuery = () => {
    const summary = queryBuilder.current.getQuerySummary({
      ...modelDataStyles,
      ...dataStyles.current,
    });
    const topLevel = {
      stageIndex: summary ? summary.stages.length - 1 : 0,
    };
    setError(undefined);
    if (!queryBuilder.current?.hasLimit(topLevel)) {
      // TODO magic number here: we run the query before we set this limit,
      //      and this limit just happens to be the default limit
      modifyQuery((qb) => qb.addLimit(topLevel, 10), true);
    }
    const query = queryBuilder.current.getQuery();
    if (queryBuilder.current?.canRun()) {
      const queryString = queryBuilder.current.getQueryStringForModel();
      runQueryRaw(queryString, query.name);
      setDirty(false);
    }
  };

  const modifyQuery = (
    modify: (queryBuilder: QueryBuilder) => void,
    noURLUpdate = false
  ) => {
    const backup = JSON.parse(JSON.stringify(queryBuilder.current.getQuery()));
    modify(queryBuilder.current);
    // TODO this is hack to get the calling component to always rerender
    // when the query changes. This used to be done by setting a query
    // string state variable, but that was annoying to keep track of.
    // So instead we have a useless `version` which we update.
    setVersion((x) => x + 1);
    if (queryBuilder.current?.canRun()) {
      try {
        const queryString = queryBuilder.current.getQueryStringForModel();
        if (!noURLUpdate) {
          updateQueryInURL({
            run: noURLUpdate,
            query: queryString,
            styles: dataStyles.current,
          });
        }
        setDirty(true);
        setError(undefined);
      } catch (error) {
        queryBuilder.current.setQuery(backup);
        // eslint-disable-next-line no-console
        console.error(error);
        setError(error);
      }
    } else {
      setDirty(true);
    }
    if (!noURLUpdate) {
      const newPosition = history.current.position + 1;
      history.current.position = newPosition;
      history.current.size = newPosition;
    }
  };

  const undo = () => {
    if (history.current.position > 0) {
      history.current.position--;
      navigate(-1);
    }
  };

  const redo = () => {
    if (history.current.position < history.current.size) {
      history.current.position++;
      navigate(1);
    }
  };

  const resetUndoHistory = () => {
    history.current.position = 0;
    history.current.size = 0;
  };

  const clearQuery = (noURLUpdate = false) => {
    if (queryBuilder.current.isEmpty()) return;
    modifyQuery((qb) => {
      qb.clearQuery();
      dataStyles.current = {};
    }, noURLUpdate);
    clearResult();
    updateQueryInURL({ run: false, query: undefined, styles: {} });
  };

  const toggleField = (stagePath: StagePath, fieldPath: string) => {
    modifyQuery((qb) => qb.toggleField(stagePath, fieldPath));
  };

  const removeField = (stagePath: StagePath, fieldIndex: number) => {
    modifyQuery((qb) => qb.removeField(stagePath, fieldIndex));
  };

  const addFilter = (stagePath: StagePath, filter: FilterExpression) => {
    modifyQuery((qb) => qb.addFilter(stagePath, filter));
  };

  const editFilter = (
    stagePath: StagePath,
    fieldIndex: number | undefined,
    filterIndex: number,
    filter: FilterExpression
  ) => {
    modifyQuery((qb) =>
      qb.editFilter(stagePath, fieldIndex, filterIndex, filter)
    );
  };

  const removeFilter = (
    stagePath: StagePath,
    filterIndex: number,
    fieldIndex?: number
  ) => {
    modifyQuery((qb) => qb.removeFilter(stagePath, filterIndex, fieldIndex));
  };

  const addLimit = (stagePath: StagePath, limit: number) => {
    modifyQuery((qb) => qb.addLimit(stagePath, limit));
  };

  const addStage = (stagePath: StagePath | undefined, fieldIndex?: number) => {
    modifyQuery((qb) => qb.addStage(stagePath, fieldIndex));
  };

  const removeStage = (stagePath: StagePath) => {
    modifyQuery((qb) => qb.removeStage(stagePath));
  };

  const addOrderBy = (
    stagePath: StagePath,
    byFieldIndex: number,
    direction?: "asc" | "desc"
  ) => {
    modifyQuery((qb) => qb.addOrderBy(stagePath, byFieldIndex, direction));
  };

  const editOrderBy = (
    stagePath: StagePath,
    orderByIndex: number,
    direction: "asc" | "desc" | undefined
  ) => {
    modifyQuery((qb) => qb.editOrderBy(stagePath, orderByIndex, direction));
  };

  const removeOrderBy = (stagePath: StagePath, orderByIndex: number) => {
    modifyQuery((qb) => qb.removeOrderBy(stagePath, orderByIndex));
  };

  const removeLimit = (stagePath: StagePath) => {
    modifyQuery((qb) => qb.removeLimit(stagePath));
  };

  const renameField = (
    stagePath: StagePath,
    fieldIndex: number,
    newName: string
  ) => {
    modifyQuery((qb) => qb.renameField(stagePath, fieldIndex, newName));
  };

  const addFilterToField = (
    stagePath: StagePath,
    fieldIndex: number,
    filter: FilterExpression,
    as?: string
  ) => {
    modifyQuery((qb) => qb.addFilterToField(stagePath, fieldIndex, filter, as));
  };

  const addNewNestedQuery = (stagePath: StagePath, name: string) => {
    modifyQuery((qb) => qb.addNewNestedQuery(stagePath, name));
  };

  const addNewDimension = (stagePath: StagePath, dimension: QueryFieldDef) => {
    modifyQuery((qb) => qb.addNewField(stagePath, dimension));
  };

  const setQuery = (query: NamedQuery, noURLUpdate = false) => {
    modifyQuery((qb) => qb.setQuery(query), noURLUpdate);
  };

  const editDimension = (
    stagePath: StagePath,
    fieldIndex: number,
    dimension: QueryFieldDef
  ) => {
    modifyQuery((qb) =>
      qb.editFieldDefinition(stagePath, fieldIndex, dimension)
    );
  };

  const editMeasure = (
    stagePath: StagePath,
    fieldIndex: number,
    measure: QueryFieldDef
  ) => {
    modifyQuery((qb) => qb.editFieldDefinition(stagePath, fieldIndex, measure));
  };

  const updateFieldOrder = (stagePath: StagePath, order: number[]) => {
    modifyQuery((qb) => qb.reorderFields(stagePath, order));
  };

  const replaceWithDefinition = (stagePath: StagePath, fieldIndex: number) => {
    modifyQuery((qb) => qb.replaceWithDefinition(stagePath, fieldIndex));
  };

  const loadQuery = (queryPath: string) => {
    modifyQuery((qb) => qb.loadQuery(queryPath));
  };

  const replaceQuery = (field: TurtleDef) => {
    modifyQuery((qb) => qb.replaceQuery(field));
  };

  const addNewMeasure = addNewDimension;

  const onDrill = (filters: FilterExpression[]) => {
    modifyQuery((qb) => {
      qb.clearQuery();
      for (const filter of filters) {
        qb.addFilter({ stageIndex: 0 }, filter);
      }
    });
  };

  const setDataStyle = (
    name: string,
    renderer: RendererName | undefined,
    noURLUpdate = false
  ) => {
    const newDataStyles = { ...dataStyles.current };
    if (renderer === undefined) {
      if (name in newDataStyles) {
        delete newDataStyles[name];
      }
    } else {
      newDataStyles[name] = { renderer };
    }
    modifyQuery(() => {
      dataStyles.current = newDataStyles;
    }, noURLUpdate);
    return newDataStyles;
  };

  const setDataStyles = (styles: DataStyles, noURLUpdate = false) => {
    modifyQuery(() => {
      dataStyles.current = styles;
    }, noURLUpdate);
  };

  const currentDataStyles = { ...modelDataStyles, ...dataStyles.current };
  const querySummary = queryBuilder.current.getQuerySummary(currentDataStyles);

  return {
    dirty,
    queryBuilder,
    queryMalloy: queryBuilder.current.getQueryStrings(
      dataStyles.current[queryName]?.renderer,
      modelPath
    ),
    queryName,
    clearQuery,
    runQuery,
    isRunning,
    clearResult,
    source: queryBuilder.current.getSource(),
    querySummary,
    dataStyles: currentDataStyles,
    result,
    error,
    canUndo: history.current.position > 0,
    canRedo: history.current.position < history.current.size,
    setError,
    registerNewSource,
    undo,
    redo,
    resetUndoHistory,
    isQueryEmpty: queryBuilder.current.isEmpty(),
    canQueryRun: queryBuilder.current.canRun(),
    queryModifiers: {
      setDataStyles,
      setQuery,
      addFilter,
      toggleField,
      addLimit,
      addOrderBy,
      addNewNestedQuery,
      addNewDimension,
      addNewMeasure,
      setDataStyle,
      addStage,
      loadQuery,
      replaceQuery,
      updateFieldOrder,
      removeField,
      removeFilter,
      removeLimit,
      removeOrderBy,
      renameField,
      addFilterToField,
      editLimit: addLimit,
      editFilter,
      replaceWithDefinition,
      editDimension,
      editMeasure,
      editOrderBy,
      removeStage,
      clearQuery,
      onDrill,
    },
  };
}
