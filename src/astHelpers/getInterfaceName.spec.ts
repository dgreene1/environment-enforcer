import { getInterfaceName } from './getInterfaceName';

describe('getInterfaceName', () => {
  it('should handle the Identifier type', () => {
    // Arrange
    const input: Parameters<typeof getInterfaceName>[0] = {
      type: 'TSTypeReference',
      typeName: {
        type: 'Identifier',
        name: 'expected name',
        leadingComments: null,
        innerComments: null,
        trailingComments: null,
        start: null,
        end: null,
        loc: null,
      },
    };

    // Act
    const result = getInterfaceName(input);

    // Assert
    expect(result).toEqual('expected name');
  });

  it('should handle the TSQualifiedName type', () => {
    // Arrange
    const input: Parameters<typeof getInterfaceName>[0] = {
      type: 'TSTypeReference',
      typeName: {
        type: 'TSQualifiedName',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        left: `I haven't seen this come through in the AST Explorer stuff I've done yet, so we'll ignore it for more` as any,
        right: {
          type: 'Identifier',
          name: 'expected name',
          leadingComments: null,
          innerComments: null,
          trailingComments: null,
          start: null,
          end: null,
          loc: null,
        },
        leadingComments: null,
        innerComments: null,
        trailingComments: null,
        start: null,
        end: null,
        loc: null,
      },
    };

    // Act
    const result = getInterfaceName(input);

    // Assert
    expect(result).toEqual('expected name');
  });
});
