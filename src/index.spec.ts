import { parseEither } from '.';

describe('index tests', () => {
  it('should fail a property is missing', () => {
    // ARRANGE
    process.env.NODE_ENV = 'production';

    // production.json
    {
      /**
       * @waiver
       */
      thingIDontHaveYet: undefined,
      APIThatWasBuild: 'prod.vertexcloud.com/api'
    }

    // ACT
    const either = parseEither({
      interfaceFilePath: '../testFixtures/IObjectWithOnStringProps.ts',
      interfaceName: 'IObjectWithOnStringProps',
      environmentFilesFolder: '../testFixtures',
      nodeEnvToConfigFileRecord: {}
    });

    // ASSERT
  });
});
