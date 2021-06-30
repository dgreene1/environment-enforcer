import { pluckInterfaceFromFile } from './pullInterfaceOut';

describe('pluckInterfaceFromFile', () => {
  it('should return only the interface name and definition and nothing around it', () => {
    // ARRANGE
    const fileAsStr = `import EnvironmentEnforcer from '../../dist/environmentEnforcer.macro';

    interface IExample {
      hello: string;
    }
    
    export const envVars = EnvironmentEnforcer.parse<IExample>();
    `;
    const tokenWeDontWantToSeeInOutput = 'EnvironmentEnforcer';

    // ACT
    const { interfaceBlock } = pluckInterfaceFromFile({
      fileAsStr,
      interfaceFilePath: __filename,
      interfaceName: 'IExample',
    });

    expect(interfaceBlock).toContain('interface IExample');
    expect(fileAsStr).toContain(tokenWeDontWantToSeeInOutput);
    expect(interfaceBlock).not.toContain(tokenWeDontWantToSeeInOutput);
  });
});
