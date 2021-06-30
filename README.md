# Environment Enforcer

[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

_"When you want your code to work in every environment, call on the Environment Enforcer."_

## Usage / Examples

1. Create a single file that will provide your code access to your environment files. Let's call it `environmentVariables.ts`
2. Import this macro and pass it the interface that defines all of the environment variables you require to be present at runtime.

```ts
// inside src/environmentVariables.ts
import EnvironmentEnforcer from 'environmentEnforcer.macro';

interface IExample {
  MY_API_URL: string;
}

export const envVars = EnvironmentEnforcer.parse<IExample>();
```

3. create a folder called `environments` (or see Configuration below for other options) and place it at the level of `package.json`
4. create files within this folder that match your environments. For example, if you don't change the default `stageNames` value, you would want to have 5 files in this folder. So:

```
package.json
environments/
environments/test.json
environments/development.json
environments/qa.json
environments/staging.json
environments/production.json
node_modules/
```

5. The content of each of these files must adhere to the interface you passed into the macro in the step above. So for example, `environments/development.json` would be:

```json
{
  "MY_API_URL": "dev.whateverMyServerIs.com"
}
```

6. EnvironmentEnforcer will make sure that all of your promotions have the expected variables and that your promotions are without fear! :)

### Other Examples

For other examples, please check out the `__fixtures__/successCases` folder in this repo for our integration tests that show working examples.

## Configuration

- `environmentsFolderPathRelativeToPackageJSON`
  - meaning: this is the folder where you would want to put the files that contain the values of your environment variables
  - default value: "./environments"
  - allowed values: a path string that is relative to package
- `stageNames`
  - meaning: this is the array of strings that define the names of the possible NODE_ENV values that this macro will look for
  - default values: `['development', 'qa', 'staging', 'production', 'test']`
  - allowed values: an array of any strings that you expect to be setting NODE_ENV to during your applications CICD process.

## Setting This Configuration via file

This macro works a lot better if you DO NOT try to configure it. The defaults are industry standard. But we allow you to change the configuration if you wish. This is handled by the standard [babel macro PLUGIN config file](https://github.com/kentcdodds/babel-plugin-macros/blob/main/other/docs/user.md#config) process which is described below:

1. Place a file called `babel-plugin-macros.config.js` next to the file that uses the environmentEnforcer macro.
2. The content of this file should look like this:

```js
module.exports = {
  environmentEnforcer: {
    environmentsFolderPathRelativeToPackageJSON: 'mySpecialFolder/environments',
  },
};
```

# Contributions

Contributions welcome as long as they come with strong automated test coverage.
