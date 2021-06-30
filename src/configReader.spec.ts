import { determineFinalConfig, IMacroConfig } from './configReader';

describe('determineFinalConfig', () => {
  it('should produce the default if the macro was not provided a config file', () => {
    // Arrange
    const exectedDefaults: IMacroConfig = {
      environmentsFolderPathRelativeToPackageJSON: 'environments',
      stageNames: ['development', 'qa', 'staging', 'production', 'test'],
    };

    // Act
    const result = determineFinalConfig({
      configFromBabelMacroConfigFile: undefined,
    });

    // Assert
    expect(result).toEqual(exectedDefaults);
  });

  it('should produce a combined result if the file was valid', () => {
    // Arrange
    const configFromBabelMacroConfigFile: Record<string, unknown> = {
      stageNames: ['special-stage', 'qa'],
    };
    const expectedResults: IMacroConfig = {
      environmentsFolderPathRelativeToPackageJSON: 'environments',
      stageNames: ['special-stage', 'qa'],
    };

    // Act
    const result = determineFinalConfig({
      configFromBabelMacroConfigFile,
    });

    // Assert
    expect(result).toEqual(expectedResults);
  });

  it('should throw if the config file was malformed (ie stageNames was not an array of string)', () => {
    // Arrange
    const configFromBabelMacroConfigFile: Record<string, unknown> = {
      stageNames: 'I was supposed to be an array of strings',
    };

    // Act
    const fnToTest = () =>
      determineFinalConfig({
        configFromBabelMacroConfigFile,
      });

    // Assert
    expect(fnToTest).toThrowError('stageNames must be an array of strings');
  });

  it('should throw if the config file was malformed (ie environmentsFolderPathRelativeToPackageJSON was not a string)', () => {
    // Arrange
    const configFromBabelMacroConfigFile: Record<string, unknown> = {
      environmentsFolderPathRelativeToPackageJSON: 4,
    };

    // Act
    const fnToTest = () =>
      determineFinalConfig({
        configFromBabelMacroConfigFile,
      });

    // Assert
    expect(fnToTest).toThrowError(
      'environmentsFolderPathRelativeToPackageJSON was not a string'
    );
  });

  it('should throw if the config file was malformed (ie it had additional properties)', () => {
    // Arrange
    const configFromBabelMacroConfigFile: Record<string, unknown> = {
      anAdditionalProperty: 'I am excess',
    };

    // Act
    const fnToTest = () =>
      determineFinalConfig({
        configFromBabelMacroConfigFile,
      });

    // Assert
    expect(fnToTest).toThrowError(
      'Found additional properties (besides the allowed properties of environmentsFolderPathRelativeToPackageJSON, stageNames) in the config that are not recognized: anAdditionalProperty'
    );
  });
});
