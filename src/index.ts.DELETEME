import fs from 'fs';
import path from 'path';
import { pluckInterfaceFromFile } from './pullInterfaceOut';

export interface IParseInput {
  interfaceFilePath: string;
  interfaceName: string;
  /**
   * This is the folder where we will look for the environment files such as production.json, development.json, etc.
   * @default "env/"
   */
  environmentFilesFolder?: string;
  /**
   * Provide this if you would to have a special name for each environment file, or if you would like enforce that each of these files exists, you can be explicit. If not provided, the library will enforce that every file within the environmentFilesFolder meets the interface define by interfaceName
   */
  envFiles?: Array<{
    /**
     * The file that is being describe will only be utilized when NODE_ENV is equal to the following value.
     * @example "production"
     */
    usageWithThisNodeEnv: string;
    /**
     * This is simply the filename and extension.
     * @example "production.json"
     */
    fileSansPath: string;
  }>;
}

export const parse = <T extends object>(input: IParseInput): T => {
  const {
    interfaceName,
    interfaceFilePath,
    environmentFilesFolder,
    envFiles,
  } = input;
  const folderThatContainsEnvFilesRELATIVE = environmentFilesFolder
    ? environmentFilesFolder
    : 'env';

  const folderThatContainsEnvFilesABSOLUTE = ensureAbsolutePath(
    folderThatContainsEnvFilesRELATIVE
  );

  const filesToEvaluate = fs
    .readdirSync(folderThatContainsEnvFilesABSOLUTE)
    .map(fileName => fs.readFileSync(fileName, { encoding: 'utf8' }));

  const interfaceFilePathABSOLUTE = ensureAbsolutePath(interfaceFilePath);

  const fileWithInterfaceAsStr = fs.readFileSync(interfaceFilePathABSOLUTE, {
    encoding: 'utf-8',
  });
  const { interfaceBlock } = pluckInterfaceFromFile({
    fileAsStr: fileWithInterfaceAsStr,
    interfaceFilePath,
    interfaceName,
  });

  return;
};

function ensureAbsolutePath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
}

export const parseEither = <T extends object>(
  input: IParseInput
): { success: true; data: T } | { success: false; error: Error | string } => {
  try {
  } catch (err) {
    return {
      success: false,
      error: err,
    };
  }
};
