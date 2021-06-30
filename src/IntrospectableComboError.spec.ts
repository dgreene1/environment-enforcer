import { MacroError } from 'babel-plugin-macros';
import {
  createReadableJoinedError,
  IntrospectableComboError,
  throwIfNotIntrospectableComboError,
} from './IntrospectableComboError';

describe('createReadableJoinedError', () => {
  it('should produce an error that maintains the individual pieces; but, also combines them into one .message', () => {
    // Arrange
    const input = {
      errors: ['woopsie', 'uh oh'],
      interfaceStr: 'mockInterface',
    };

    // Act
    const manufacturedError = createReadableJoinedError(input);

    // Assert
    expect(manufacturedError.individualErrors).toEqual(
      expect.arrayContaining(['woopsie', 'uh oh'])
    );
    expect(manufacturedError.message).toContain('Validation Errors (2 errors)');
    expect(manufacturedError.message).toContain('woopsie');
    expect(manufacturedError.message).toContain('uh oh');
    expect(manufacturedError.message).toContain(
      'For convenience, this is the interface that was used for validation: mockInterface'
    );
  });
});

describe('throwIfNotIntrospectableComboError', () => {
  it('should throw an error if it does not have an array of individual errors', () => {
    // Arrange
    const notFull: Pick<
      IntrospectableComboError,
      'message' | 'name' | 'stack'
    > = new MacroError('hi');

    // Act
    const thingToTest = () => throwIfNotIntrospectableComboError(notFull);

    // Assert
    expect(thingToTest).toThrowError(
      `expected err to have individualErrors but it did not. Please create Github issue so we can fix this.`
    );
  });

  it('should throw an error if it did not inherit from MacroError because then it is just structurally the same but not from the right constructor', () => {
    // Arrange
    const notFull: Pick<
      IntrospectableComboError,
      'message' | 'name' | 'stack'
      // eslint-disable-next-line no-restricted-syntax
    > = new Error('hi');

    // Act
    const thingToTest = () => throwIfNotIntrospectableComboError(notFull);

    // Assert
    expect(thingToTest).toThrowError(
      `expected err to be an instanceof MacroError like all IntrospectableComboErrors are, but it was not. Please create Github issue so we can fix this.`
    );
  });
});
