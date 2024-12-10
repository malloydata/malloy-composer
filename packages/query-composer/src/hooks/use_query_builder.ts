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
  FilterCondition,
  QueryFieldDef,
  ModelDef,
  NamedQuery,
  TurtleDef,
} from '@malloydata/malloy';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {QueryBuilder, QueryWriter} from '../core/query';
import {QuerySummary, RendererName, StagePath} from '../types';
import {getSourceDef} from '../core/models';

export interface UseQueryBuilderResult {
  queryWriter: QueryWriter;
  queryModifiers: QueryModifiers;
  querySummary: QuerySummary | undefined;
  error: Error | undefined;
}

export interface QueryModifiers {
  addFilter: (
    stagePath: StagePath,
    filter: FilterCondition,
    as?: string
  ) => void;
  toggleField: (stagePath: StagePath, fieldPath: string) => void;
  addLimit: (stagePath: StagePath, limit: number) => void;
  addOrderBy: (
    stagePath: StagePath,
    byFieldIndex: number,
    direction?: 'asc' | 'desc'
  ) => void;
  addNewNestedQuery: (stagePath: StagePath, name: string) => void;
  addNewDimension: (stagePath: StagePath, dimension: QueryFieldDef) => void;
  addNewMeasure: (stagePath: StagePath, measure: QueryFieldDef) => void;
  setRenderer: (
    stagePath: StagePath,
    fieldIndex: number | undefined,
    renderer: RendererName | undefined
  ) => void;
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
    filter: FilterCondition,
    as?: string
  ) => void;
  editLimit: (stagePath: StagePath, limit: number) => void;
  editFilter: (
    stagePath: StagePath,
    fieldIndex: number | undefined,
    filterIndex: number,
    filter: FilterCondition
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
    direction: 'asc' | 'desc' | undefined
  ) => void;
  removeStage: (stagePath: StagePath) => void;
  clearQuery: (noURLUpdate?: boolean) => void;
  onDrill: (filters: FilterCondition[]) => void;
  setQuery: (query: NamedQuery, noURLUpdate?: boolean) => void;
}

export function useQueryBuilder(
  modelDef?: ModelDef,
  sourceName?: string,
  modelPath?: string,
  updateQueryInURL?: (params: {run: boolean; query: string | undefined}) => void
): UseQueryBuilderResult {
  const query = useRef<TurtleDef>();
  const [error, setError] = useState<Error>();
  const sourceDef =
    modelDef && sourceName ? getSourceDef(modelDef, sourceName) : undefined;
  const queryBuilder = useMemo<QueryBuilder>(() => {
    const qb = new QueryBuilder(sourceDef);
    if (query.current) {
      try {
        qb.setQuery(query.current);
        qb.getQueryStringForNotebook();
      } catch (error) {
        console.warn('Discarding query', error);
        qb.clearQuery();
      }
    }
    return qb;
  }, [sourceDef]);
  const [querySummary, setQuerySummary] = useState(() => {
    try {
      return queryBuilder.getQuerySummary();
    } catch (error) {
      if (!error) setError(error as Error);
      return undefined;
    }
  });

  useEffect(() => {
    console.info('> sourceDef changed');
  }, [sourceDef]);

  const modifyQuery = useCallback(
    (modify: (queryBuilder: QueryBuilder) => void, noURLUpdate = false) => {
      query.current = structuredClone(queryBuilder.getQuery());
      setError(undefined);
      modify(queryBuilder);
      if (queryBuilder.canRun()) {
        try {
          const queryString = queryBuilder.getQueryStringForNotebook();
          if (!noURLUpdate) {
            updateQueryInURL?.({
              run: noURLUpdate,
              query: queryString,
            });
          }
        } catch (error) {
          queryBuilder.setQuery(query.current);
          console.error(error);
          setError(error as Error);
        }
      }
      try {
        setQuerySummary(queryBuilder.getQuerySummary());
        query.current = structuredClone(queryBuilder.getQuery());
      } catch (error) {
        queryBuilder.setQuery(query.current);
        console.error(error);
        setError(error as Error);
      }
    },
    [queryBuilder, updateQueryInURL]
  );

  const queryModifiers = useMemo(() => {
    const clearQuery = (noURLUpdate = false) => {
      if (queryBuilder.isEmpty()) return;
      modifyQuery(qb => {
        qb.clearQuery();
      }, noURLUpdate);
      updateQueryInURL?.({run: false, query: undefined});
    };

    const toggleField = (stagePath: StagePath, fieldPath: string) => {
      modifyQuery(qb => qb.toggleField(stagePath, fieldPath));
    };

    const setRenderer = (
      stagePath: StagePath,
      fieldIndex: number | undefined,
      renderer: RendererName | undefined
    ) => {
      modifyQuery(qb => qb.setRenderer(stagePath, fieldIndex, renderer));
    };

    const removeField = (stagePath: StagePath, fieldIndex: number) => {
      modifyQuery(qb => qb.removeField(stagePath, fieldIndex));
    };

    const addFilter = (stagePath: StagePath, filter: FilterCondition) => {
      modifyQuery(qb => qb.addFilter(stagePath, filter));
    };

    const editFilter = (
      stagePath: StagePath,
      fieldIndex: number | undefined,
      filterIndex: number,
      filter: FilterCondition
    ) => {
      modifyQuery(qb =>
        qb.editFilter(stagePath, fieldIndex, filterIndex, filter)
      );
    };

    const removeFilter = (
      stagePath: StagePath,
      filterIndex: number,
      fieldIndex?: number
    ) => {
      modifyQuery(qb => qb.removeFilter(stagePath, filterIndex, fieldIndex));
    };

    const addLimit = (stagePath: StagePath, limit: number) => {
      modifyQuery(qb => qb.addLimit(stagePath, limit));
    };

    const addStage = (
      stagePath: StagePath | undefined,
      fieldIndex?: number
    ) => {
      modifyQuery(qb => qb.addStage(stagePath, fieldIndex));
    };

    const removeStage = (stagePath: StagePath) => {
      modifyQuery(qb => qb.removeStage(stagePath));
    };

    const addOrderBy = (
      stagePath: StagePath,
      byFieldIndex: number,
      direction?: 'asc' | 'desc'
    ) => {
      modifyQuery(qb => qb.addOrderBy(stagePath, byFieldIndex, direction));
    };

    const editOrderBy = (
      stagePath: StagePath,
      orderByIndex: number,
      direction: 'asc' | 'desc' | undefined
    ) => {
      modifyQuery(qb => qb.editOrderBy(stagePath, orderByIndex, direction));
    };

    const removeOrderBy = (stagePath: StagePath, orderByIndex: number) => {
      modifyQuery(qb => qb.removeOrderBy(stagePath, orderByIndex));
    };

    const removeLimit = (stagePath: StagePath) => {
      modifyQuery(qb => qb.removeLimit(stagePath));
    };

    const renameField = (
      stagePath: StagePath,
      fieldIndex: number,
      newName: string
    ) => {
      modifyQuery(qb => qb.renameField(stagePath, fieldIndex, newName));
    };

    const addFilterToField = (
      stagePath: StagePath,
      fieldIndex: number,
      filter: FilterCondition,
      as?: string
    ) => {
      modifyQuery(qb => qb.addFilterToField(stagePath, fieldIndex, filter, as));
    };

    const addNewNestedQuery = (stagePath: StagePath, name: string) => {
      modifyQuery(qb => qb.addNewNestedQuery(stagePath, name));
    };

    const addNewDimension = (
      stagePath: StagePath,
      dimension: QueryFieldDef
    ) => {
      modifyQuery(qb => qb.addNewField(stagePath, dimension));
    };

    const setQuery = (query: NamedQuery, noURLUpdate = false) => {
      modifyQuery(qb => qb.setQuery(query), noURLUpdate);
    };

    const editDimension = (
      stagePath: StagePath,
      fieldIndex: number,
      dimension: QueryFieldDef
    ) => {
      modifyQuery(qb =>
        qb.editFieldDefinition(stagePath, fieldIndex, dimension)
      );
    };

    const editMeasure = (
      stagePath: StagePath,
      fieldIndex: number,
      measure: QueryFieldDef
    ) => {
      modifyQuery(qb => qb.editFieldDefinition(stagePath, fieldIndex, measure));
    };

    const updateFieldOrder = (stagePath: StagePath, order: number[]) => {
      modifyQuery(qb => qb.reorderFields(stagePath, order));
    };

    const replaceWithDefinition = (
      stagePath: StagePath,
      fieldIndex: number
    ) => {
      modifyQuery(qb => qb.replaceWithDefinition(stagePath, fieldIndex));
    };

    const loadQuery = (queryPath: string) => {
      modifyQuery(qb => qb.loadQuery(queryPath));
    };

    const replaceQuery = (field: TurtleDef) => {
      modifyQuery(qb => qb.replaceQuery(field));
    };

    const addNewMeasure = addNewDimension;

    const onDrill = (filters: FilterCondition[]) => {
      modifyQuery(qb => {
        qb.onDrill(filters);
      });
    };

    return {
      setQuery,
      addFilter,
      toggleField,
      addLimit,
      addOrderBy,
      addNewNestedQuery,
      addNewDimension,
      addNewMeasure,
      setRenderer,
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
    };
  }, [modifyQuery, queryBuilder, updateQueryInURL]);

  useEffect(() => {
    console.info('> modifyQuery changed');
  }, [modifyQuery]);

  useEffect(() => {
    console.info('> queryBuilder changed');
  }, [queryBuilder]);

  useEffect(() => {
    console.info('> updateQueryInURL changed');
  }, [updateQueryInURL]);

  useEffect(() => {
    console.info('> querySummary changed');
  }, [querySummary]);

  const queryWriter = queryBuilder.getWriter();

  return {
    queryModifiers,
    querySummary,
    queryWriter,
    error,
  };
}
