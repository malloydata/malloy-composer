/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import {renderHook, act} from '@testing-library/react';
import {ModelDef, QueryFieldDef, SourceDef} from '@malloydata/malloy';
import {model} from '../../example/example_model';
import {useQueryBuilder} from '../../src/hooks';
import {StubCompile} from '../../src/core/stub-compile';
import {getSourceDef} from '../../src/core/models';

const stub = new StubCompile();

interface RenderProps {
  args: [ModelDef, string, string, undefined];
}

describe('useQueryBuilder', () => {
  let testSource: SourceDef;
  let testDimension: QueryFieldDef;

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});

    testSource = getSourceDef(model, 'names');
    testDimension = await stub.compileDimension(testSource, 'abc', 'decade');
  });

  it('Starts with an empty query', () => {
    const {result} = renderHook(
      ({args}: RenderProps) => useQueryBuilder(...args),
      {
        initialProps: {
          args: [model, 'names', 'names.malloy', undefined],
        },
      }
    );

    const {error, querySummary, queryWriter} = result.current;
    const queryMalloy = queryWriter.getQueryStringForNotebook();

    expect(error).toBe(undefined);
    expect(querySummary).toEqual(
      expect.objectContaining({
        name: 'new_query',
        isRunnable: false,
      })
    );
    expect(queryMalloy).toEqual('run: names -> {\n}');
  });

  it('supports modification', () => {
    const {result, rerender} = renderHook(
      ({args}: RenderProps) => useQueryBuilder(...args),
      {
        initialProps: {
          args: [model, 'names', 'names.malloy', undefined],
        },
      }
    );

    const {queryModifiers} = result.current;

    act(() => {
      queryModifiers.addNewDimension({stageIndex: 0}, testDimension);
      queryModifiers.addLimit({stageIndex: 0}, 10);
    });

    rerender({args: [model, 'names', 'names.malloy', undefined]});

    const {error, querySummary, queryWriter} = result.current;
    const queryMalloy = queryWriter.getQueryStringForNotebook();

    expect(error).toBe(undefined);
    expect(querySummary).toEqual(
      expect.objectContaining({
        name: 'new_query',
        isRunnable: true,
      })
    );
    expect(queryMalloy).toEqual(`\
run: names -> {
  group_by: abc is decade
  limit: 10
}`);
  });

  describe('updating the model', () => {
    it('preserves the query when a new source is compatible', () => {
      const {result, rerender} = renderHook(
        ({args}: RenderProps) => useQueryBuilder(...args),
        {
          initialProps: {
            args: [model, 'names', 'names.malloy', undefined],
          },
        }
      );

      const {queryModifiers} = result.current;

      act(() => {
        queryModifiers.addNewDimension({stageIndex: 0}, testDimension);
        queryModifiers.addLimit({stageIndex: 0}, 10);
      });

      const newModel = structuredClone(model);
      rerender({args: [newModel, 'names', 'names.malloy', undefined]});

      const {error, querySummary, queryWriter} = result.current;
      const queryMalloy = queryWriter.getQueryStringForNotebook();

      expect(error).toBe(undefined);
      expect(querySummary).toEqual(
        expect.objectContaining({
          name: 'new_query',
          isRunnable: true,
        })
      );
      expect(queryMalloy).toEqual(`\
run: names -> {
  group_by: abc is decade
  limit: 10
}`);
    });

    it('clears the query when a new source is incompatible', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const {result, rerender} = renderHook(
        ({args}: RenderProps) => useQueryBuilder(...args),
        {
          initialProps: {
            args: [model, 'names', 'names.malloy', undefined],
          },
        }
      );

      const {queryModifiers} = result.current;

      act(() => {
        queryModifiers.addNewDimension({stageIndex: 0}, testDimension);
        queryModifiers.addLimit({stageIndex: 0}, 10);
      });

      rerender({args: [model, 'cohort', 'names.malloy', undefined]});

      const {error, querySummary, queryWriter} = result.current;
      const queryMalloy = queryWriter.getQueryStringForNotebook();

      expect(error).toBe(undefined);
      expect(querySummary).toEqual(
        expect.objectContaining({
          name: 'new_query',
          isRunnable: true,
        })
      );
      expect(queryMalloy).toEqual('run: cohort -> {\n}');
      expect(warnSpy).toHaveBeenCalledWith(
        'Discarding query',
        new Error('decade not found')
      );
    });
  });
});
