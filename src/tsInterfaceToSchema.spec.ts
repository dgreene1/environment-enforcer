import { convertInterfaceToSchema, ISchema } from './tsInterfaceToSchema';

describe('.convertInterfaceToSchema', () => {
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
    (interfaceAsStr) => {
      // ARRANGE
      const expectedOutput: ISchema = {
        interfaceName: 'IHaveAString',
        interfaceRaw: expect.stringContaining('IHaveAString'),
        schemasPerProperty: {
          aStr: {
            isOptional: false,
            propertyName: 'aStr',
            typeDef: {
              details: { isArray: false, jsType: 'string' },
              variation: 'nonUnionNonIntersection',
            },
          },
        },
      };

      // ACT
      const output = convertInterfaceToSchema({ interfaceAsStr });

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
    (interfaceAsStr) => {
      // ARRANGE
      const expectedOutput: ISchema = {
        interfaceName: 'ITestInterface',
        interfaceRaw: expect.stringMatching('ITestInterface'),
        schemasPerProperty: {
          a: {
            isOptional: false,
            propertyName: 'a',
            typeDef: {
              details: { isArray: false, jsType: 'string' },
              variation: 'nonUnionNonIntersection',
            },
          },
          b: {
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
          c: {
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
        },
      };

      // ACT
      const output = convertInterfaceToSchema({ interfaceAsStr });

      // ASSERT
      expect(output).toEqual(expectedOutput);
    }
  );

  it('does not currently support interfaces that explicitly allow excess properties', () => {
    // ARRANGE
    const interfaceAsStr = `interface ITestInterface {
      [key: string]: string
    }
    `;

    // ACT
    const fnToTest = () => convertInterfaceToSchema({ interfaceAsStr });

    // ASSERT
    expect(fnToTest).toThrow(
      'We currently do not support iteratable objects or interfaces with excess properties. PR contributions are welcome. This error was due to finding the character [ in the following line of the "ITestInterface" interface: [key: string]: string'
    );
  });

  it('does not support aliases', () => {
    // ARRANGE
    const interfaceAsStr = `interface ITestInterface {
          aRecord: MyTypeAlias
        }
        type MyTypeAlias = string;
        `;

    // ACT
    const fnToTest = () => convertInterfaceToSchema({ interfaceAsStr });

    // ASSERT
    expect(fnToTest).toThrow(
      `We found a value that is an unsupported type. Please note that we do not support aliases (i.e. the 'type' keyword at this time), so please be sure to inline any of your types to the interface. This value was an unsupported type: "MyTypeAlias"`
    );
  });

  it('does not currently support NESTED objects', () => {
    // ARRANGE
    const interfaceAsStr = `interface ITestInterface {
      anObject: {
        foo: string;
      }
    }
    `;

    // ACT
    const fnToTest = () => convertInterfaceToSchema({ interfaceAsStr });

    // ASSERT
    expect(fnToTest).toThrow(
      'We currently do not support nested objects and one was present on interface "ITestInterface". PR contributions are welcome.'
    );
  });
});
