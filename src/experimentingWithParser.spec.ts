import { traverse } from '@babel/core';
import { parse } from '@babel/parser';
import { getInterfaceName } from './astHelpers/getInterfaceName';
xdescribe('seeing how @babel/parser works', () => {
  it('simple interface fun fun', () => {
    const parsedOutput = parse(
      `
    interface IHello {
      hi: string;
    }

    export const result = EnvironmentEnforcer.parse<IHello>();
  `,
      {
        // parse in strict mode and allow module declarations
        sourceType: 'module',

        plugins: [
          // enable jsx and flow syntax
          'typescript',
        ],
      }
    );

    traverse(parsedOutput, {
      CallExpression: (p) => {
        console.warn(p);

        p.node.typeParameters!.params.forEach((typeParam) => {
          console.warn(typeParam);
          console.warn(typeParam.type); //.typeName.name)
          console.warn(
            typeParam.type === 'TSTypeReference'
              ? getInterfaceName(typeParam)
              : 'not a TSTypeReference'
          );
          if (typeParam.type === 'TSTypeReference') {
            if (typeParam.typeName.type === 'Identifier') {
              typeParam = {} as any;
            }
          }
        });
      },
    });

    expect(parsedOutput).toEqual('bad');
  });
});
