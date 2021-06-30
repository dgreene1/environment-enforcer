import { MacroError } from 'babel-plugin-macros';
import {
  IArrayTypeDef,
  INonArrayDef,
  INonUnionNonIntersectionDef,
  IUnionTypeDef,
  PropertyNameAndTypeDef,
  SimpleType,
  TypeDef,
  typeGuards,
} from './ourSchemaLanguage';

type SplitChar = '{' | '}' | ';' | ',' | ':';

export const stringBetween = (
  strToCheck: string,
  startChar: SplitChar,
  endChar: SplitChar
): string => {
  return strToCheck.substring(
    strToCheck.indexOf(startChar) + 1,
    strToCheck.indexOf(endChar)
  );
};

const simpleTypeToTypeDef = <T extends SimpleType>(
  valueStr: T
): INonUnionNonIntersectionDef<INonArrayDef<T>> => {
  return {
    variation: 'nonUnionNonIntersection',
    details: {
      isArray: false,
      jsType: valueStr,
    },
  };
};

const parseValueStrToUnion = (valueStr: string): IUnionTypeDef => {
  return {
    variation: 'union',
    details: valueStr.split('|').map((aUnionItem) => {
      return parseValueStrToTypeDef({ valueStr: aUnionItem });
    }),
  };
};

const parseValueStrToArray = (
  valueStr: string
): INonUnionNonIntersectionDef<IArrayTypeDef> => {
  const anyArraySignifiers = /(Array<)|(>)|(\[)|(\])/g;
  const valueTypeWithinTheArray = valueStr.replace(anyArraySignifiers, '');
  return {
    variation: 'nonUnionNonIntersection',
    details: {
      isArray: true,
      jsType: parseValueStrToTypeDef({ valueStr: valueTypeWithinTheArray }),
    },
  };
};

const isStrRepresentationOfArray = (valueStr: string) =>
  valueStr.startsWith('Array') || valueStr.endsWith(']');

const parseValueStrToTypeDef = (input: { valueStr: string }): TypeDef => {
  const { valueStr } = input;
  const valueStrCleaned = trimAllSurroundingWhiteAndNewLine(valueStr);
  const containsUnion = valueStrCleaned.includes('|');
  const containsIntersection = valueStrCleaned.includes('&');

  if (containsIntersection) {
    throw new MacroError(
      `Found a & character. Intersections are not currently supported`
    );
  }

  if (isStrRepresentationOfArray(valueStrCleaned)) {
    return parseValueStrToArray(valueStrCleaned);
  } else if (containsUnion) {
    return parseValueStrToUnion(valueStrCleaned);
  } else if (typeGuards.isSimpleType(valueStrCleaned)) {
    return simpleTypeToTypeDef(valueStrCleaned);
  } else {
    throw new MacroError(
      `We found a value that is an unsupported type. Please note that we do not support aliases (i.e. the 'type' keyword at this time), so please be sure to inline any of your types to the interface. This value was an unsupported type: ${JSON.stringify(
        valueStrCleaned
      )}`
    );
  }
};

const parsePropertyToSchema = (input: {
  valueStr: string;
  propertyName: string;
  isOptional: boolean;
}): PropertyNameAndTypeDef => {
  const { propertyName, isOptional, valueStr } = input;
  return {
    propertyName,
    isOptional,
    typeDef: parseValueStrToTypeDef({ valueStr }),
  };
};

const trimAllSurroundingWhiteAndNewLine = (strToTrim: string): string => {
  return strToTrim.replace(/^[\s\n\r]{1,}|[\s\n\r]{1,}$/g, '');
};

const propertyLineStrToSchema = (input: {
  interfaceName: string;
  keyAndValueAsStr: string;
}): PropertyNameAndTypeDef => {
  const { interfaceName, keyAndValueAsStr } = input;
  const strippedKeyAndValue =
    trimAllSurroundingWhiteAndNewLine(keyAndValueAsStr);

  const iterableKeyStartChar = '[';
  if (strippedKeyAndValue.startsWith(iterableKeyStartChar)) {
    throw new MacroError(
      `We currently do not support iteratable objects or interfaces with excess properties. PR contributions are welcome. ` +
        `This error was due to finding the character ${iterableKeyStartChar} in the following line of the "${interfaceName}" interface: ${strippedKeyAndValue}`
    );
  }

  const nestedObjectStartChar = '{';
  if (strippedKeyAndValue.includes(nestedObjectStartChar)) {
    throw new MacroError(
      `We currently do not support nested objects and one was present on interface "${interfaceName}". PR contributions are welcome.`
    );
  }

  const keyAndValueTuple = strippedKeyAndValue.split(':');
  if (keyAndValueTuple.length !== 2) {
    throw new MacroError(
      `Expected 2 items (i.e. a key and value), but instead found ${
        keyAndValueTuple.length
      } items. Full object: ${JSON.stringify(keyAndValueTuple)}`
    );
  }
  const [propertyWithMaybeQuestion, valueStr] = keyAndValueTuple;
  const isOptional = propertyWithMaybeQuestion.endsWith('?');
  const propertyName = propertyWithMaybeQuestion.replace('?', '');

  return parsePropertyToSchema({ valueStr, propertyName, isOptional });
};

export type PropertyNamesToSchema = Record<string, PropertyNameAndTypeDef>;
export interface ISchema {
  interfaceName: string;
  interfaceRaw: string;
  schemasPerProperty: PropertyNamesToSchema;
}

function makeIndexable(
  schemaArray: PropertyNameAndTypeDef[]
): PropertyNamesToSchema {
  const record: PropertyNamesToSchema = {};

  schemaArray.forEach((aPropertySchema) => {
    record[aPropertySchema.propertyName] = aPropertySchema;
  });

  return record;
}

const getInterfaceName = (input: {
  interfaceAsStr: string;
}): { interfaceName: string } => {
  const RegexBetweenInterfaceAndCurly = /(?<=interface)(.*)(?={)/;

  const { interfaceAsStr } = input;

  const matches = interfaceAsStr.match(RegexBetweenInterfaceAndCurly);

  if (!matches || matches.length === 0) {
    throw new MacroError(
      `Could not find an interface name in the block that was searched. We searched: "${interfaceAsStr}"`
    );
  }

  const interfaceName = trimAllSurroundingWhiteAndNewLine(matches[0]);

  return {
    interfaceName,
  };
};

export const convertInterfaceToSchema = (input: {
  interfaceAsStr: string;
}): ISchema => {
  const { interfaceAsStr } = input;
  const { interfaceName } = getInterfaceName({ interfaceAsStr });

  const interfaceInners = trimAllSurroundingWhiteAndNewLine(
    stringBetween(interfaceAsStr, '{', '}')
  );
  const commaOrSemicolonRegex = /[;,]+/;
  const seed: PropertyNameAndTypeDef[] = [];

  const arrayOfInners = interfaceInners
    .split(commaOrSemicolonRegex)
    .reduce((accumulator, aLine) => {
      const strippedLine = trimAllSurroundingWhiteAndNewLine(aLine);
      // Check if this line is basically the end of the interface object
      if (strippedLine !== '') {
        accumulator.push(
          propertyLineStrToSchema({
            interfaceName,
            keyAndValueAsStr: strippedLine,
          })
        );
      }
      return accumulator;
    }, seed);

  return {
    interfaceName,
    interfaceRaw: interfaceAsStr,
    schemasPerProperty: makeIndexable(arrayOfInners),
  };
};
