import EnvironmentEnforcer from '../../../dist/environmentEnforcer.macro';

interface IEnvs {
  foobar: string;
}

export const envVars = EnvironmentEnforcer.parse<IEnvs>();
