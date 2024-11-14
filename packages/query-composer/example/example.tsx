import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {ExploreQueryEditor, useQueryBuilder, useRunQuery} from '../src/index';

import {model as exampleModel, modelPath, topValues} from './example_model';
import styled, {createGlobalStyle} from 'styled-components';
import {SourceDef} from '@malloydata/malloy';

const updateQueryInURL = () => {};
const runQueryAction = () => {
  throw new Error('Unimplemented');
};

const CssVariables = styled.div`
  --malloy-composer-fontSize: 13px;
  --malloy-composer-fontFamily: Arial, sans-serif;
  --malloy-composer-background: #1e1e1e;
  --malloy-composer-foreground: #eeeeee;

  --malloy-composer-header-background: #333333;

  --malloy-composer-code-fontSize: 13px;
  --malloy-composer-code-fontFamily: Courier, monospace;

  --malloy-composer-form-background: #000000;
  --malloy-composer-form-foreground: #eeeeee;
  --malloy-composer-form-border: #ececed;
  --malloy-composer-form-fontFamily: Arial, sans-serif;
  --malloy-composer-form-fontSize: 13px;
  --malloy-composer-form-focus: #b0b0ff;
  --malloy-composer-form-focusBackground: #5050ff;
  --malloy-composer-form-fontSize: 13px;

  --malloy-composer-menu-background: #000000;
  --malloy-composer-menu-foreground: #eeeeee;
  --malloy-composer-menu-border: #bbbbbb;
  --malloy-composer-menu-title: #bbbbbb;
  --malloy-composer-menu-fontFamily: Courier, monospace;
  --malloy-composer-menu-fontSize: 13px;
`;

const App = () => {
  const [modelDef, setModeDef] = useState(exampleModel);
  const {queryMalloy, queryName, queryModifiers, querySummary} =
    useQueryBuilder(modelDef, 'names', modelPath, updateQueryInURL);

  const {result, isRunning, runQuery} = useRunQuery(
    modelDef,
    modelPath,
    runQueryAction
  );

  const source = modelDef.contents['names'] as SourceDef;

  return (
    <div className="dark">
      <GlobalStyle />
      <CssVariables>
        <div
          style={{
            backgroundColor: 'var(--malloy-composer-background)',
            padding: 8,
          }}
        >
          <ExploreQueryEditor
            model={modelDef}
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
            refreshModel={() => setModeDef(structuredClone(exampleModel))}
          />
        </div>
      </CssVariables>
    </div>
  );
};

const GlobalStyle = createGlobalStyle`
  .dark .shiki,
  .dark .shiki span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
  }
  .shiki span {
    font-size: var(--malloy-composer-code-fontSize);
    font-family: var(--malloy-composer-code-fontFamily);
  }
  .shiki code {
    background-color: var(--malloy-composer-background);
  }

  body {
    margin: 0;
  }
`;

ReactDOM.render(<App />, document.getElementById('app'));
