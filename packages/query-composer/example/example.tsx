import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import {
  ExploreQueryEditor,
  QuerySummaryPanel,
  useQueryBuilder,
} from '../src/index';

import {model, modelPath, source} from './example_model';

const updateQueryInURL = () => {};
const runQueryExternal = () => {
  throw new Error('Unimplemented');
};
const runQueryAction = () => {};
const topValues = [];

const App = () => {
  const {
    queryMalloy,
    queryName,
    isRunning,
    queryModifiers,
    querySummary,
    result,
    registerNewSource,
    dirty,
    canUndo,
    undo,
    isQueryEmpty,
    canQueryRun,
  } = useQueryBuilder(model, modelPath, updateQueryInURL, runQueryExternal);

  useEffect(() => {
    registerNewSource(source);
  }, [registerNewSource]);

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
        result={result}
        isRunning={isRunning}
        runQuery={runQueryAction}
        canUndo={canUndo}
        undo={undo}
        isQueryEmpty={isQueryEmpty}
        canQueryRun={canQueryRun}
      />
      {querySummary && (
        <QuerySummaryPanel
          model={model}
          modelPath={modelPath}
          querySummary={querySummary}
          queryModifiers={queryModifiers}
          source={source}
          stagePath={{stageIndex: 0}}
          topValues={topValues}
        />
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
