import type { MacroHandler } from 'babel-plugin-macros';
import { createMacro } from 'babel-plugin-macros';
import { inspect } from 'util';

interface EnvironmentEnforcer {
  parse: <T>() => T;
}

console.log('');

const handler: MacroHandler = (params): void => {
  const { /*babel, */ references /* state, config */ } = params;

  console.log(inspect(references));
};

export default createMacro(
  handler
) as /* it really stinks to have to use a type assertion here, 
but all macros appear to be of type any so let's tell our users
(and test later) that it's actually */ EnvironmentEnforcer;
