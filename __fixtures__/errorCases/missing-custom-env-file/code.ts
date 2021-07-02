import EnvironmentEnforcer from '../../../dist/index.macro';

interface IEnvs {
  foobar: string;
}

export const envVars = EnvironmentEnforcer.parse<IEnvs>();
