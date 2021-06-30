import { MacroError } from 'babel-plugin-macros';
import fs from 'fs';
import path from 'path';

export interface IMacroConfig {
  environmentsFolderPathRelativeToPackageJSON: string;
  stageNames: string[];
}

export const itemsInAThatArenNotInB = <T>(arrayA: T[], arrayB: T[]): T[] => {
  return arrayA.filter((x) => {
    return !arrayB.includes(x);
  });
};

const validateConfigObj = (input: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  configObj: unknown & object;
}): Partial<IMacroConfig> => {
  const validationsPerProperty: Record<
    keyof IMacroConfig,
    (input: unknown) => void
  > = {
    environmentsFolderPathRelativeToPackageJSON: (input: unknown) => {
      if (typeof input !== 'string') {
        throw new MacroError(
          `environmentsFolderPathRelativeToPackageJSON was not a string`
        );
      }
    },
    stageNames: (input: unknown) => {
      if (!Array.isArray(input) || input.some((x) => typeof x !== 'string')) {
        throw new MacroError(`stageNames must be an array of strings`);
      }
    },
  };

  const configAsObj = input.configObj as unknown as Record<string, unknown>;

  // Check for excess properties
  const keysTheyPassed = Object.keys(configAsObj);
  const keysTheyAreAllowed = Object.keys(validationsPerProperty);
  const potentialExcessProps = itemsInAThatArenNotInB(
    keysTheyPassed,
    keysTheyAreAllowed
  );
  if (potentialExcessProps.length) {
    throw new MacroError(
      `Found additional properties (besides the allowed properties of ${keysTheyAreAllowed.join(
        ', '
      )}) in the config that are not recognized: ${potentialExcessProps.join(
        ', '
      )}`
    );
  }

  // Validate the allowed properties
  Object.keys(validationsPerProperty).forEach((aKey) => {
    if (keysTheyAreAllowed.includes(aKey)) {
      const aKeyStrict = aKey as keyof typeof validationsPerProperty;
      const validationFunction = validationsPerProperty[aKeyStrict];
      const valueTheyProvided = configAsObj[aKeyStrict];

      // Since none of the configs are required, we only need to run validation if they provide a value
      if (valueTheyProvided) {
        validationFunction(valueTheyProvided);
      }
    }
  });

  // If it passed those validations, then it's good to go
  return configAsObj as unknown as Partial<IMacroConfig>;
};

const defaultConfig: IMacroConfig = {
  environmentsFolderPathRelativeToPackageJSON: 'environments',
  stageNames: ['development', 'qa', 'staging', 'production', 'test'],
};

const getConfigFromFile = (): Partial<IMacroConfig> | undefined => {
  const configFilePath = path.resolve(__dirname, `environmentEnforcer.json`);

  if (fs.existsSync(configFilePath)) {
    // eslint-disable-next-line no-console
    console.log(`Loading ${configFilePath}`);
    const configObj = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
    return validateConfigObj({ configObj });
  } else {
    return undefined;
  }
};

export const determineFinalConfig = (input: {
  configFromBabelMacroConfigFile: Record<string, unknown> | undefined;
}): IMacroConfig => {
  return Object.assign(
    {},
    defaultConfig,
    getConfigFromFile(),
    input.configFromBabelMacroConfigFile
      ? validateConfigObj({
          configObj: input.configFromBabelMacroConfigFile,
        })
      : undefined
  );
};
