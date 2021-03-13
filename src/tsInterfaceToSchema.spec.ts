import { PropertyNameAndTypeDef } from './ourSchemaLanguage';
import { convertInterfaceToSchema } from './tsInterfaceToSchema';

describe('.convertInterfaceToSchema', () => {
  beforeEach(() => {});
  /**
   * We add various formatting cases so we ensure that each reformatted case gets interpreted as the same output
   */
  const casesForOnlyStringMember = [
    `
      interface IHaveAString {
        aStr: string
      }
    `,
    `
      interface IHaveAString {
        aStr: string;
      }
    `,
    `
      interface IHaveAString {
        aStr: string,
      }
    `,
    `interface IHaveAString { aStr: string } ]`,
  ];
  test.each(casesForOnlyStringMember)(
    'should produce the correct schema for an interface with one string property, given the following as input: %j',
    input => {
      // ARRANGE
      const expectedOutput: PropertyNameAndTypeDef[] = [
        {
          isOptional: false,
          propertyName: 'aStr',
          typeDef: {
            details: { isArray: false, jsType: 'string' },
            variation: 'nonUnionNonIntersection',
          },
        },
      ];

      // ACT
      const output = convertInterfaceToSchema(input);

      // ASSERT
      expect(output).toEqual(expectedOutput);
    }
  );

  /**
   * We add various formatting cases so we ensure that each reformatted case gets interpreted as the same output
   */
  const caseForAllScenariosInOneFlatInterface = [
    `interface ITestInterface {
      a: string,
      b: string | number;
      c: string[]
    } 
    `,
    `interface ITestInterface {a: string,b: string | number;c: string[];} 
    `,
    `interface ITestInterface {a: string,b: string | number;c: string[],}`,
    `interface ITestInterface {
      a: string,b: string | number;c: string[]
    } 
    `,
    `interface ITestInterface {
      a: string; b: string | number,
      c: string[]
    } 
    `,
  ];
  test.each(caseForAllScenariosInOneFlatInterface)(
    'should produce the correct schema output for a complex FLAT interface, given the following as input: %j',
    input => {
      // ARRANGE
      const expectedOutput: PropertyNameAndTypeDef[] = [
        {
          isOptional: false,
          propertyName: 'a',
          typeDef: {
            details: { isArray: false, jsType: 'string' },
            variation: 'nonUnionNonIntersection',
          },
        },
        {
          isOptional: false,
          propertyName: 'b',
          typeDef: {
            details: [
              {
                details: { isArray: false, jsType: 'string' },
                variation: 'nonUnionNonIntersection',
              },
              {
                details: { isArray: false, jsType: 'number' },
                variation: 'nonUnionNonIntersection',
              },
            ],
            variation: 'union',
          },
        },
        {
          isOptional: false,
          propertyName: 'c',
          typeDef: {
            details: {
              isArray: true,
              jsType: {
                details: { isArray: false, jsType: 'string' },
                variation: 'nonUnionNonIntersection',
              },
            },
            variation: 'nonUnionNonIntersection',
          },
        },
      ];

      // ACT
      const output = convertInterfaceToSchema(input);

      // ASSERT
      expect(output).toEqual(expectedOutput);
    }
  );

  it('does not currently support interfaces that explicitly allow excess properties', () => {
    // ACT
    const fnToTest = () =>
      convertInterfaceToSchema(`interface ITestInterface {
      [key: string]: string
    }
    `);

    // ASSERT
    expect(fnToTest).toThrow(
      'We currently do not support iteratable objects or interfaces with excess properties. PR contributions are welcome. This error was due to finding the character [ in the following line of the interface: [key: string]: string'
    );
  });

  it('does not currently support NESTED interfaces that explicitly allow excess properties', () => {
    // ACT
    const fnToTest = () =>
      convertInterfaceToSchema(`interface ITestInterface {
      aRecord: {
        [key: string]: number
      }
    }
    `);

    // ASSERT
    expect(fnToTest).toThrow(
      'We currently do not support iteratable objects or interfaces with excess properties. PR contributions are welcome. This error was due to finding the character [ in the following line of the interface: [key: string]: number'
    );
  });
});
