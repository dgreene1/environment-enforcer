import { PluginPass } from '@babel/core';
import { TSTypeReference } from '@babel/types';
import appRoot from 'app-root-path';
import { createMacro, MacroError, MacroHandler } from 'babel-plugin-macros';
import fs from 'fs';
import path from 'path';
import { combine } from './arrayHelpers/combine';
import { getInterfaceName } from './astHelpers/getInterfaceName';
import { determineFinalConfig, IMacroConfig } from './configReader';
import { createReadableJoinedError } from './IntrospectableComboError';
import { pluckInterfaceFromFile } from './pullInterfaceOut';
import { validate } from './schemaValidation';
import { convertInterfaceToSchema } from './tsInterfaceToSchema';

export interface EnvironmentEnforcer {
  parse: <T>() => T;
}

const MACRO_FN_NAME: keyof EnvironmentEnforcer = 'parse';

const constructEnvFilePath = (input: {
  config: IMacroConfig;
  stageName: string;
}) => {
  const windowsToLinuxPath = (somePathStr: string) => {
    return somePathStr.split(path.sep).join(path.posix.sep);
  };

  const { config, stageName } = input;
  return path.join(
    appRoot.path,
    windowsToLinuxPath(config.environmentsFolderPathRelativeToPackageJSON),
    `${stageName}.json`
  );
};

interface IValidatedFileOutput {
  envFilePath: string;
  fileContent: unknown;
  fileContentStr: string;
}

interface IEnvFileDiffCheckerInputs {
  typeParam: TSTypeReference;
  state: PluginPass;
  validatedConfig: IMacroConfig;
}

function throwIfAnyEnvironmentFileDiffersFromInterface(
  input: IEnvFileDiffCheckerInputs
): IValidatedFileOutput {
  const { typeParam, state, validatedConfig } = input;
  const interfaceName = getInterfaceName(typeParam);

  const { interfaceBlock } = pluckInterfaceFromFile({
    fileAsStr: state.file.path.getSource(),
    interfaceName,
    interfaceFilePath: state.filename,
  });

  const schema = convertInterfaceToSchema({
    interfaceAsStr: interfaceBlock,
  });

  const errors: string[] = [];

  let resultsForCurrentEnvironment: IValidatedFileOutput | undefined =
    undefined;

  const environments = validatedConfig.stageNames.map((stageName) => {
    return {
      stageName,
      envFilePath: constructEnvFilePath({ stageName, config: validatedConfig }),
    };
  });

  environments.forEach((infoForOneEnv) => {
    const { stageName, envFilePath } = infoForOneEnv;

    if (!fs.existsSync(envFilePath)) {
      errors.push(
        `EnviromentEnforcer expected file "${envFilePath}" to exist, but it did not. Please confirm that that file exists or if you have a configuration file check your configuration to see what you intended.`
      );
    } else {
      const envFile = fs.readFileSync(envFilePath, 'utf-8');
      try {
        const envFileJSON = JSON.parse(envFile);
        const errorsForThisFile = validate(envFileJSON, schema, envFilePath);
        if (errorsForThisFile.length) {
          combine(errors, errorsForThisFile);
        } else {
          if (stageName === process.env.NODE_ENV) {
            resultsForCurrentEnvironment = {
              envFilePath,
              fileContent: envFileJSON,
              fileContentStr: envFile,
            };
          }
        }
      } catch (err) {
        errors.push(
          `File ${envFilePath} was not valid JSON. Full error: ${err}`
        );
      }
    }
  });

  if (errors.length) {
    throw createReadableJoinedError({
      errors,
      interfaceStr: schema.interfaceRaw,
    });
  }

  if (!resultsForCurrentEnvironment) {
    const expectedFilePath = constructEnvFilePath({
      stageName: process.env.NODE_ENV || 'NODE_ENV is undefined',
      config: validatedConfig,
    });
    throw new MacroError(
      `Unable to get the data from ${expectedFilePath}. Please check your env folder. For your convenience, the following are the paths that we looked. If you find it there, please report a bug in the environment-enforcer github. Paths: ${environments
        .map((x) => x.envFilePath)
        .join(', ')}`
    );
  } else {
    return resultsForCurrentEnvironment;
  }
}

const NAME_OF_THIS_MACRO_INCLUDE = 'environment-enforcer.macro';
const FAKE_IMPORT_NAME_FOR_TESTING = 'dist/index.macro';

const appendWithFullFileContent = (state: PluginPass) => {
  return `
  
  File path: ${state.filename}

  Full text of file:
  ${state.file.code}`;
};

const handler: MacroHandler = ({
  state,
  config: configFromBabelMacroConfigFile,
}): void => {
  const validatedConfig = determineFinalConfig({
    configFromBabelMacroConfigFile,
  });

  if (
    !state.file.code.includes(NAME_OF_THIS_MACRO_INCLUDE) &&
    !state.file.code.includes(FAKE_IMPORT_NAME_FOR_TESTING)
  ) {
    throw new MacroError(
      `Expected to find ${NAME_OF_THIS_MACRO_INCLUDE} (or ${FAKE_IMPORT_NAME_FOR_TESTING} (which is less likely due to its use primarily in internal development)); however we did not.${appendWithFullFileContent(
        state
      )}`
    );
  }

  state.file.path.traverse({
    CallExpression: (p) => {
      // console.warn(p); // Uncomment if you want to see the AST to aid development

      if (p.node.callee.type !== 'MemberExpression') return;
      if (p.node.callee.property.type !== 'Identifier') return;
      if (p.node.callee.property.name !== MACRO_FN_NAME) return;

      if (!p.node.typeParameters) {
        throw new MacroError(
          `This macro requires you to explicitly pass the type parameter for the interface that defines the contract for which each environment variable file must adhere to.
          However, we did not find a type parameter for this node: ${JSON.stringify(
            p.node
          )}${appendWithFullFileContent(state)}`
        );
      }

      p.node.typeParameters.params.forEach((typeParam) => {
        if (typeParam.type !== 'TSTypeReference') {
          throw new MacroError(
            `This macro requires that the type parameter be an interface.${appendWithFullFileContent(
              state
            )}`
          );
        }

        const { fileContentStr } =
          throwIfAnyEnvironmentFileDiffersFromInterface({
            typeParam,
            state,
            validatedConfig,
          });

        p.replaceWithSourceString(fileContentStr);
      });
    },
  });
};

export default createMacro(handler, {
  configName: 'environmentEnforcer',
}) as /* it really stinks to have to use a type assertion here, 
but all macros appear to be of type any so let's tell our users
(and test later) that it's actually */ EnvironmentEnforcer;
