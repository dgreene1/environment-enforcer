import { MacroError } from 'babel-plugin-macros';

export function assertNever(value: never): never {
  throw new MacroError(
    `We do not currently support this: ${JSON.stringify(value)}`
  );
}
