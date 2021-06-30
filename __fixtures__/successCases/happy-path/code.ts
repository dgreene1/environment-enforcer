import EnvironmentEnforcer from '../../../dist/environmentEnforcer.macro';

interface IExample {
  singleStr: string;
}

export const envVars = EnvironmentEnforcer.parse<IExample>();
