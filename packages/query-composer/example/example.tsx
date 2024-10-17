import React from 'react';
import ReactDOM from 'react-dom';
import {
  ExploreQueryEditor,
  QuerySummaryPanel,
  useQueryBuilder,
  useRunQuery,
} from '../src/index';

import {model, modelPath, source} from './example_model';

const updateQueryInURL = () => {};
const runQueryAction = () => {
  throw new Error('Unimplemented');
};
const topValues = [];

const App = () => {
  const {queryMalloy, queryName, queryModifiers, querySummary} =
    useQueryBuilder(model, 'names', modelPath, updateQueryInURL);

  const {result, isRunning, runQuery} = useRunQuery(
    model,
    modelPath,
    runQueryAction
  );

  return (
    <div>
      <ExploreQueryEditor
        model={model}
        modelPath={modelPath}
        source={source}
        queryModifiers={queryModifiers}
        topValues={topValues}
        queryName={queryName}
        querySummary={querySummary}
        queryMalloy={queryMalloy}
        runQuery={runQuery}
        isRunning={isRunning}
        result={result}
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
