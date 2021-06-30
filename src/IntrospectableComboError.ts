import { MacroError } from 'babel-plugin-macros';
import { EOL } from 'os';

export type IntrospectableComboError = MacroError & {
  individualErrors: string[];
};

export function throwIfNotIntrospectableComboError(
  err: unknown
): asserts err is IntrospectableComboError {
  if (!(err instanceof MacroError)) {
    throw new MacroError(
      `expected err to be an instanceof MacroError like all IntrospectableComboErrors are, but it was not. Please create Github issue so we can fix this.`
    );
  }
  const innocentUntilProvenGuilty = err as Partial<IntrospectableComboError>;
  if (
    !innocentUntilProvenGuilty.individualErrors ||
    !Array.isArray(innocentUntilProvenGuilty.individualErrors)
  ) {
    throw new MacroError(
      `expected err to have individualErrors but it did not. Please create Github issue so we can fix this.`
    );
  }
}

export const createReadableJoinedError = (input: {
  errors: string[];
  interfaceStr: string;
}): IntrospectableComboError => {
  const { errors, interfaceStr } = input;

  const plurality = errors.length > 1 ? 's' : '';
  const errorsJoined = errors.reduce((acc, anError, i) => {
    acc += `${EOL} (${i + 1}) ${anError}`;
    return acc;
  }, '');
  const result = new MacroError(
    `Validation Errors (${errors.length} error${plurality}): ${errorsJoined}` +
      `\n For convenience, this is the interface that was used for validation: ${interfaceStr}`
  );

  (result as IntrospectableComboError).individualErrors = errors;
  // let's "eat our own dog food" so we can ensure our type can be read later in the unit tests
  throwIfNotIntrospectableComboError(result);

  return result as IntrospectableComboError;
};
