import EnvironmentEnforcer from '../../../dist/index.macro';

interface IExample {
  singleStr: string;
}

export const envVars = EnvironmentEnforcer.parse<IExample>();
