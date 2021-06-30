import { MacroError } from 'babel-plugin-macros';
import { combine } from './arrayHelpers/combine';
import { assertNever } from './assertNever';
import {
  IArrayTypeDef,
  INonArrayDef,
  IUnionTypeDef,
  SimpleType,
  TypeDef,
} from './ourSchemaLanguage';
import { ISchema } from './tsInterfaceToSchema';

// Don't export. I wouldn't recommend using this function in other places. But it is valuable for internal use
function assertIsStringNumRecord(
  data: unknown,
  fileWhereDataCameFrom: string,
  propertyName?: string
): asserts data is Record<string | number, unknown> {
  const propertyLogSection = propertyName
    ? `on property "${propertyName}" `
    : '';

  if (typeof data !== 'object') {
    throw new MacroError(
      `data (${propertyLogSection}taken from "${fileWhereDataCameFrom}") was not an object like expected. Instead was: ${JSON.stringify(
        data
      )}`
    );
  }
  if (Array.isArray(data)) {
    throw new MacroError(
      `data (${propertyLogSection}taken from "${fileWhereDataCameFrom}") was an array but we require it to be an object. It was: ${JSON.stringify(
        data
      )}`
    );
  }
}

const validateSimple = (input: {
  propertyValue: unknown;
  propertyName: string;
  typeDef: INonArrayDef<SimpleType>;
}): string[] => {
  const errors: string[] = [];
  const { propertyValue, propertyName, typeDef } = input;

  if (typeof propertyValue !== typeDef.jsType) {
    errors.push(
      `"${propertyName}" must have a value of type "${
        typeDef.jsType
      }" but instead was "${typeof propertyValue}" and the value of it was "${propertyValue}"`
    );
  }

  return errors;
};

const validateArray = (input: {
  propertyValue: unknown;
  propertyName: string;
  typeDef: IArrayTypeDef;
}): string[] => {
  const errors: string[] = [];
  const { propertyValue, propertyName, typeDef } = input;

  if (!Array.isArray(propertyValue)) {
    errors.push(
      `"${propertyName}" was expected to be an array but the value was not. Instead, it was "${typeof propertyValue}" and the value of it was "${propertyValue}"`
    );
  } else {
    propertyValue.forEach((item, i) => {
      combine(
        errors,
        validateUnknown({
          propertyValue: item,
          propertyName: `${propertyName}[${i}]`,
          typeDef: typeDef.jsType,
        })
      );
    });
  }

  return errors;
};

const validateUnion = (input: {
  propertyValue: unknown;
  propertyName: string;
  typeDef: IUnionTypeDef;
}): string[] => {
  const errors: string[] = [];
  const { propertyValue, propertyName, typeDef } = input;

  let dataSatisfiedAtKeastOneDef = false;

  typeDef.details.forEach((aUnionMember) => {
    const errorsForThisDef = validateUnknown({
      propertyValue,
      propertyName,
      typeDef: aUnionMember,
    });

    if (errorsForThisDef.length === 0) {
      dataSatisfiedAtKeastOneDef = true;
    }

    combine(errors, errorsForThisDef);
  });

  // You would never want to consider the data a failure if it matched at least one of the items in the union
  return dataSatisfiedAtKeastOneDef ? [] : errors;
};

const validateUnknown = (input: {
  propertyValue: unknown;
  propertyName: string;
  typeDef: TypeDef;
}): string[] => {
  const errors: string[] = [];
  const { propertyValue, propertyName, typeDef } = input;

  if (typeDef.variation === 'nonUnionNonIntersection') {
    if (typeDef.details.isArray === true) {
      combine(
        errors,
        validateArray({ propertyValue, propertyName, typeDef: typeDef.details })
      );
    } else if (typeDef.details.isArray === false) {
      combine(
        errors,
        validateSimple({
          propertyValue,
          propertyName,
          typeDef: typeDef.details,
        })
      );
    } else {
      assertNever(typeDef.details);
    }
  } else if (typeDef.variation === 'union') {
    validateUnion({ propertyValue, propertyName, typeDef });
  } else {
    assertNever(typeDef);
  }

  return errors;
};

export type SchemaForValidations = Pick<
  ISchema,
  'interfaceName' | 'schemasPerProperty'
>;

const validateInternalSchema = (schema: SchemaForValidations): void => {
  Object.keys(schema.schemasPerProperty).forEach((propertySchemaName) => {
    const anPropertySchema = schema.schemasPerProperty[propertySchemaName];

    if (anPropertySchema.propertyName !== propertySchemaName) {
      throw new MacroError(
        `This is an internal error of a scenario that we'd hoped would never occur. The internally generated schema has a mismatch in that ${anPropertySchema.propertyName} is not equal to ${propertySchemaName} for one of the items. It always should be. Please report this on the environment-enforcer github.`
      );
    }
  });
};

export const validate = (
  data: unknown,
  schema: SchemaForValidations,
  fileWhereDataCameFrom: string
): string[] => {
  assertIsStringNumRecord(data, fileWhereDataCameFrom);
  validateInternalSchema(schema);

  const errors: string[] = [];

  const propertiesThatHaveBeenFound = Object.keys(
    schema.schemasPerProperty
  ).reduce((accumulator, nameOfProp) => {
    accumulator.set(nameOfProp, false);

    return accumulator;
  }, new Map<string, boolean>());

  Object.keys(data).forEach((keyName) => {
    const schemaForThisProp = schema.schemasPerProperty[keyName];

    if (!schemaForThisProp) {
      errors.push(
        `Excess properties not allowed: Could not find a schema for property "${keyName}" so please ensure that interface "${schema.interfaceName}" has that property or remove the property from "${fileWhereDataCameFrom}".`
      );
    } else {
      const { propertyName, typeDef } = schemaForThisProp;
      const propertyValue = data[keyName];

      propertiesThatHaveBeenFound.set(keyName, true);

      combine(
        errors,
        validateUnknown({ propertyName, propertyValue, typeDef })
      );
    }
  });

  // Check missing properties
  propertiesThatHaveBeenFound.forEach((foundAlready, propertyNameOnSchema) => {
    if (foundAlready === false) {
      const { isOptional } = schema.schemasPerProperty[propertyNameOnSchema];

      if (!isOptional) {
        errors.push(
          `Required property "${propertyNameOnSchema}" was not found on data retrieved from "${fileWhereDataCameFrom}". For your convenience, here is the data: ${JSON.stringify(
            data
          )}`
        );
      }
    }
  });

  return errors;
};
