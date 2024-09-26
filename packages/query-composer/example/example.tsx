import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import {ExploreQueryEditor, useQueryBuilder} from '../src';

import {model, modelPath, source} from './example_model';

const updateQueryInURL = () => {};
const mockDataStyles = {};
const runQueryExternal = () => {
  throw new Error('Unimplemented');
};
const runQueryAction = () => {};
const topValues = [];

const App = () => {
  const {
    queryMalloy,
    queryName,
    // clearQuery,
    // clearResult,
    // runQuery,
    isRunning,
    queryModifiers,
    querySummary,
    dataStyles,
    result,
    registerNewSource,
    // error,
    // setError,
    dirty,
    canUndo,
    undo,
    // redo,
    // resetUndoHistory,
    isQueryEmpty,
    canQueryRun,
  } = useQueryBuilder(
    model,
    modelPath,
    updateQueryInURL,
    mockDataStyles,
    runQueryExternal
  );

  useEffect(() => {
    registerNewSource(source);
  }, [source]);

  return (
    <div>
      <ExploreQueryEditor
        dirty={dirty}
        model={model}
        modelPath={modelPath}
        source={source}
        queryModifiers={queryModifiers}
        topValues={topValues}
        queryName={queryName}
        querySummary={querySummary}
        queryMalloy={queryMalloy}
        dataStyles={dataStyles}
        result={result}
        isRunning={isRunning}
        runQuery={runQueryAction}
        canUndo={canUndo}
        undo={undo}
        isQueryEmpty={isQueryEmpty}
        canQueryRun={canQueryRun}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
