// ##############
// NOTE: consider trying to put tests in environmentEnforcer.macro.spec.ts instead
// ##############

import { MacroError } from 'babel-plugin-macros';
import { SchemaForValidations, validate } from './schemaValidation';

describe('validate', () => {
  it(`should fail if a property is missing`, () => {
    // ARRANGE
    const data = {};

    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        expectedProperty: {
          isOptional: false,
          propertyName: 'expectedProperty',
          typeDef: {
            variation: 'nonUnionNonIntersection',
            details: {
              isArray: false,
              jsType: 'string',
            },
          },
        },
      },
    };

    // ACT
    const errors = validate(data, schema, 'mockFileName.blah');

    // ASSERT
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(
      `Required property "expectedProperty" was not found on data retrieved from "mockFileName.blah". For your convenience, here is the data: {}`
    );
  });

  it(`should catch excesss properties`, () => {
    // ARRANGE
    const data = {
      unexpectedProperty: `unexpectedProperty's value`,
      expectedProperty: `expectedProperty's value`,
    };

    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        expectedProperty: {
          isOptional: false,
          propertyName: 'expectedProperty',
          typeDef: {
            variation: 'nonUnionNonIntersection',
            details: {
              isArray: false,
              jsType: 'string',
            },
          },
        },
      },
    };

    // ACT
    const errors = validate(data, schema, 'mockFileName.blah');

    // ASSERT
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(
      `Excess properties not allowed: Could not find a schema for property "unexpectedProperty" so please ensure that interface "IEnvVarsForThisTest" has that property or remove the property from "mockFileName.blah".`
    );
  });

  it(`should fail if the data is not a number`, () => {
    // ARRANGE
    const data = {
      myPropName: 'I am a string',
    };
    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        myPropName: {
          isOptional: false,
          propertyName: 'myPropName',
          typeDef: {
            variation: 'nonUnionNonIntersection',
            details: {
              isArray: false,
              jsType: 'number',
            },
          },
        },
      },
    };

    // ACT
    const errors = validate(data, schema, 'mockFileName.blah');

    // ASSERT
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(
      `"myPropName" must have a value of type "number" but instead was "string" and the value of it was "I am a string"`
    );
  });

  it(`HAPPY PATH for array of numbers`, () => {
    // ARRANGE
    const data = {
      myPropName: [1, 2],
    };
    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        myPropName: {
          isOptional: false,
          propertyName: 'myPropName',
          typeDef: {
            variation: 'nonUnionNonIntersection',
            details: {
              isArray: true,
              jsType: {
                variation: 'nonUnionNonIntersection',
                details: {
                  isArray: false,
                  jsType: 'number',
                },
              },
            },
          },
        },
      },
    };

    // ACT
    const errors = validate(data, schema, 'mockFileName.blah');

    // ASSERT
    expect(errors).toHaveLength(0);
  });

  it(`should fail if there are strings in the number array`, () => {
    // ARRANGE
    const data = {
      myPropName: [1, '2'],
    };
    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        myPropName: {
          isOptional: false,
          propertyName: 'myPropName',
          typeDef: {
            variation: 'nonUnionNonIntersection',
            details: {
              isArray: true,
              jsType: {
                variation: 'nonUnionNonIntersection',
                details: {
                  isArray: false,
                  jsType: 'number',
                },
              },
            },
          },
        },
      },
    };

    // ACT
    const errors = validate(data, schema, 'mockFileName.blah');

    // ASSERT
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(
      '"myPropName[1]" must have a value of type "number" but instead was "string" and the value of it was "2"'
    );
  });

  it(`should fail if the array was not actually an array`, () => {
    // ARRANGE
    const data = {
      myPropName: 'I should have been an array',
    };
    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        myPropName: {
          isOptional: false,
          propertyName: 'myPropName',
          typeDef: {
            variation: 'nonUnionNonIntersection',
            details: {
              isArray: true,
              jsType: {
                variation: 'nonUnionNonIntersection',
                details: {
                  isArray: false,
                  jsType: 'number',
                },
              },
            },
          },
        },
      },
    };

    // ACT
    const errors = validate(data, schema, 'mockFileName.blah');

    // ASSERT
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(
      `"myPropName" was expected to be an array but the value was not. Instead, it was "string" and the value of it was "I should have been an array"`
    );
  });

  it(`should fail if the data is not a string`, () => {
    // ARRANGE
    const data = {
      myPropName: 52,
    };
    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        myPropName: {
          isOptional: false,
          propertyName: 'myPropName',
          typeDef: {
            variation: 'nonUnionNonIntersection',
            details: {
              isArray: false,
              jsType: 'string',
            },
          },
        },
      },
    };

    // ACT
    const errors = validate(data, schema, 'mockFileName.blah');

    // ASSERT
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(
      `"myPropName" must have a value of type "string" but instead was "number" and the value of it was "52"`
    );
  });

  it(`should validate that a union is allowed`, () => {
    // ARRANGE
    const dataWithString = {
      maybeNumberOrString: 'I am a string',
    };
    const dataWithNumber = {
      maybeNumberOrString: 52,
    };

    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        maybeNumberOrString: {
          isOptional: false,
          propertyName: 'maybeNumberOrString',
          typeDef: {
            variation: 'union',
            details: [
              {
                details: {
                  isArray: false,
                  jsType: 'string',
                },
                variation: 'nonUnionNonIntersection',
              },
              {
                details: {
                  isArray: false,
                  jsType: 'number',
                },
                variation: 'nonUnionNonIntersection',
              },
            ],
          },
        },
      },
    };

    // ACT
    const errorsForDataWithString = validate(
      dataWithString,
      schema,
      'mockFileName.blah'
    );
    const errorsForDataWithNumber = validate(
      dataWithNumber,
      schema,
      'mockFileName.blah'
    );

    // ASSERT
    expect(errorsForDataWithString).toHaveLength(0);
    expect(errorsForDataWithNumber).toHaveLength(0);
  });

  it(`should validate that an OPTIONAL union is allowed`, () => {
    // ARRANGE
    const dataWithMissing = {};
    const dataWithUndefined = {
      maybeNumberOrString: undefined,
    };
    const dataWithActualValue = {
      maybeNumberOrString: 'hi',
    };

    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        maybeNumberOrString: {
          isOptional: true,
          propertyName: 'maybeNumberOrString',
          typeDef: {
            variation: 'union',
            details: [
              {
                details: {
                  isArray: false,
                  jsType: 'string',
                },
                variation: 'nonUnionNonIntersection',
              },
              {
                details: {
                  isArray: false,
                  jsType: 'number',
                },
                variation: 'nonUnionNonIntersection',
              },
            ],
          },
        },
      },
    };

    // ACT
    const errorsForMissingCase = validate(
      dataWithMissing,
      schema,
      'mockFileName.blah'
    );
    const errorsForLiterallyUndefined = validate(
      dataWithUndefined,
      schema,
      'mockFileName.blah'
    );
    const errorsForThereCase = validate(
      dataWithActualValue,
      schema,
      'mockFileName.blah'
    );

    // ASSERT
    expect(errorsForMissingCase).toHaveLength(0);
    expect(errorsForLiterallyUndefined).toHaveLength(0);
    expect(errorsForThereCase).toHaveLength(0);
  });

  it(`should make sure that it doesn't let gross errors reach out as a result of internal failings`, () => {
    // ARRANGE
    const data = {};

    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        maybeNumberOrString: {
          isOptional: true,
          propertyName: 'TOTALLY  DIFFERENT NAME',
          typeDef: {
            variation: 'nonUnionNonIntersection',
            details: {
              isArray: false,
              jsType: 'string',
            },
          },
        },
      },
    };

    // ACT
    let error: MacroError | undefined;
    try {
      validate(data, schema, 'mockFileName.blah');
    } catch (err) {
      error = err;
    }

    // ASSERT
    expect(error?.message).toContain(
      `This is an internal error of a scenario that we'd hoped would never occur. The internally generated schema has a mismatch in that TOTALLY  DIFFERENT NAME is not equal to maybeNumberOrString for one of the items. It always should be. Please report this on the environment-enforcer github.`
    );
  });

  it(`should clarify what things are not supported yet`, () => {
    // ARRANGE
    const data = {
      myPropName: [1, 2],
    };
    const schema: SchemaForValidations = {
      interfaceName: 'IEnvVarsForThisTest',
      schemasPerProperty: {
        myPropName: {
          isOptional: false,
          propertyName: 'myPropName',
          typeDef: {
            variation: 'nonUnionNonIntersection',
            details: {
              isArray: true,
              jsType: {
                variation:
                  'some variation we have not had a need for yet' as 'nonUnionNonIntersection',
                details: {
                  isArray: false,
                  jsType: 'number',
                },
              },
            },
          },
        },
      },
    };

    // ACT
    let error: MacroError | undefined;
    try {
      validate(data, schema, 'mockFileName.blah');
    } catch (err) {
      error = err;
    }

    // ASSERT
    expect(error?.message).toMatch(
      /We do not currently support this.*some variation we have not had a need for yet/g
    );
  });
});
