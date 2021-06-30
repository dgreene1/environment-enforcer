import { TSTypeReference } from '@babel/types';
import { assertNever } from '../assertNever';

export function getInterfaceName(
  typeParam: Pick<TSTypeReference, 'type' | 'typeName'>
): string {
  if (typeParam.typeName.type === 'Identifier') {
    return typeParam.typeName.name;
  } else if (typeParam.typeName.type === 'TSQualifiedName') {
    return typeParam.typeName.right.name;
  } else {
    return assertNever(typeParam.typeName);
  }
}
