import EnvironmentEnforcer from '../../dist/environmentEnforcer.macro';

interface IExample {
  hello: string;
}

export const envVars = EnvironmentEnforcer.parse<IExample>();
