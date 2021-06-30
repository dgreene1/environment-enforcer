import { MacroError } from 'babel-plugin-macros';

export type InterfacePullerProps = {
  interfaceFilePath: string;
  interfaceName: string;
  fileAsStr: string;
};

export const pluckInterfaceFromFile = (
  input: InterfacePullerProps
): {
  interfaceBlock: string;
} => {
  const { interfaceName, interfaceFilePath, fileAsStr } = input;

  const interfaceDeclarationToken = `interface ${interfaceName}`;
  const interfaceDeclarationIndex = fileAsStr.indexOf(
    interfaceDeclarationToken
  );
  if (interfaceDeclarationIndex < 0) {
    throw new MacroError(
      `Could not find an occurrence of "${interfaceDeclarationToken}" in file "${interfaceFilePath}"`
    );
  }

  const indexOfNextDeclaration = fileAsStr.search(
    /(export)|(const)|(let)|(var)|(class)|(enum)|(type)/
  );

  const endOfBlock =
    indexOfNextDeclaration < 0 ? Infinity : indexOfNextDeclaration;
  const interfaceBlock = fileAsStr.substring(
    interfaceDeclarationIndex,
    endOfBlock
  );

  return {
    interfaceBlock,
  };
};
