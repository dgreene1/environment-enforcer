// assume that create react app has been run
// but verify this by checking that it created the usual files
// copy the test code into a helper directory
const WRAPPED_ENV_VARS_FILENAME_AND_EXT = `wrappedEnvVars.ts`;
const envVarToPrintKey = `ENV_VAR_TO_PRINT`;
const exportedVariableContainerName = `envVars`;
const wrappedEnvVarsCode = `
  import EnvironmentEnforcer from "environment-enforcer.macro";

  interface IExample {
    ${envVarToPrintKey}: string;
  }

  export const ${exportedVariableContainerName} = EnvironmentEnforcer.parse<IExample>();
`;

// Create the environment folders

// replace the App.tsx code
const newAppDotTSXCode = `
  import React from 'react';
  import logo from './logo.svg';
  import './App.css';
  import { ${exportedVariableContainerName} } from './${WRAPPED_ENV_VARS_FILENAME_AND_EXT}';

  function App() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <div data-test-id="test-1">{${exportedVariableContainerName}.${envVarToPrintKey}}</div>
        </header>
      </div>
    );
  }

  export default App;
`;
