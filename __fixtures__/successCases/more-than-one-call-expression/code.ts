import EnvironmentEnforcer from '../../../dist/index.macro';

interface IEnvs {
  foobar: string;
}

const iAmAnotherFunction = () => {
  return 'hello';
};

// The babel macro should be smart enough to know that this next line is not Environment Enforcer so it should skip it
iAmAnotherFunction();

export const envVars = EnvironmentEnforcer.parse<IEnvs>();
