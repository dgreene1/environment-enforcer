import plugin, { MacroError } from 'babel-plugin-macros';
import pluginTester from 'babel-plugin-tester';
import path from 'path';
import { throwIfNotIntrospectableComboError } from './IntrospectableComboError';

const rootFixturesDir = '__fixtures__';
const fixtures = {
  /**
   * Tests in this directory will hopefully be automatically run (as long as this string is passed in as the "fixtures" option to babel plugin tester)
   */
  successCases: path.join(__dirname, '..', rootFixturesDir, 'successCases'),
  /**
   * Tests in this directory have to be MANUALLY exposed to babel plugin tester's "tests" property
   */
  errorCases: path.join(__dirname, '..', rootFixturesDir, 'errorCases'),
};

/**
 * This is because you can't use Jest within babel-plugin-tester's error function
 */
const notJest = {
  expectToInclude: (stringToLookIn: string, stringToCheckFor: RegExp): void => {
    if (!stringToCheckFor.test(stringToLookIn)) {
      throw new MacroError(
        `Expected "${stringToLookIn}" to include "${stringToCheckFor}" but it did not.`
      );
    }
  },
};

pluginTester({
  plugin,
  pluginName: 'environment-enforce/macro',
  title: 'Environment Enforcer',
  babelOptions: {
    presets: ['@babel/preset-typescript'],
  },
  pluginOptions: {
    configurableMacro: {
      someConfig: false,
      somePluginConfig: true,
    },
  },
  fixtures: fixtures.successCases,
  tests: [
    {
      fixture: path.join(
        fixtures.errorCases,
        'missing-the-type-parameter',
        'code.ts'
      ),
      pluginOptions: {
        hello: 'hello',
      },
      error:
        /.*This macro requires you to explicitly pass the type parameter for the interface that defines the contract for which each environment variable file must adhere to.*/,
    },
    {
      fixture: path.join(
        fixtures.errorCases,
        'current-env-has-it-but-higher-does-not',
        'code.ts'
      ),
      error: (err) => {
        throwIfNotIntrospectableComboError(err);

        notJest.expectToInclude(
          err.individualErrors[0],
          /Excess properties not allowed: Could not find a schema for property "purposelyUnexpectedProperty" so please ensure that interface "IEnvs" has that property or remove the property from.*qa.json/g
        );

        notJest.expectToInclude(
          err.individualErrors[1],
          /Required property "foobar" was not found on data retrieved from.*production.json/g
        );

        return true;
      },
    },
    {
      fixture: path.join(
        fixtures.errorCases,
        'no-environment-has-expected-variable',
        'code.ts'
      ),
      error: (err) => {
        throwIfNotIntrospectableComboError(err);

        notJest.expectToInclude(
          err.message,
          /Required property "foobar" was not found on data retrieved from.*production.json/g
        );

        notJest.expectToInclude(
          err.message,
          /Required property "foobar" was not found on data retrieved from.*test.json/g
        );

        notJest.expectToInclude(
          err.message,
          /Required property "foobar" was not found on data retrieved from.*qa.json/g
        );

        notJest.expectToInclude(
          err.message,
          /Required property "foobar" was not found on data retrieved from.*staging.json/g
        );

        return true;
      },
    },
    {
      fixture: path.join(
        fixtures.errorCases,
        'missing-custom-env-file',
        'code.ts'
      ),
      error:
        /EnviromentEnforcer expected file .*missing-custom-env-file.*environments.*mySpecialProd-likeEnvironment\.json.* to exist, but it did not. Please confirm that that file exists or if you have a configuration file check your configuration to see what you intended./g,
    },
    {
      fixture: path.join(
        fixtures.errorCases,
        'missing-the-qa-env-file',
        'code.ts'
      ),
      error:
        /EnviromentEnforcer expected file .*missing-the-qa-env-file.*environments.*qa\.json.*to exist, but it did not. Please confirm that that file exists or if you have a configuration file check your configuration to see what you intended./g,
    },
  ],
});
