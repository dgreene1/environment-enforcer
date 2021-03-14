export type InterfacePullerProps = {
  interfaceFilePath: string;
  interfaceName: string;
  fileAsStr: string;
};

export const pluckInterfaceFromFile = (
  input: InterfacePullerProps
): {
  interfaceName: string;
  interfaceBlock: string;
} => {
  const { interfaceName, interfaceFilePath, fileAsStr } = input;

  const interfaceDeclarationToken = `export interface ${interfaceName}`;
  const interfaceDeclarationIndex = fileAsStr.indexOf(
    interfaceDeclarationToken
  );
  if (interfaceDeclarationIndex < 0) {
    throw new Error(
      `Could not find an occurance of "${interfaceDeclarationToken}" in file "${interfaceFilePath}"`
    );
  }

  const indexOfNextDeclaration = fileAsStr
    .substring(interfaceDeclarationIndex + 1)
    .search(/(export)|(const)|(let)|(var)|(class)|(enum)|(type)/);
  console.log(indexOfNextDeclaration);
  const endOfBlock =
    indexOfNextDeclaration < 0 ? Infinity : indexOfNextDeclaration;
  const interfaceBlock = fileAsStr.substring(
    interfaceDeclarationIndex,
    endOfBlock
  );

  return {
    interfaceName,
    interfaceBlock,
  };
};
