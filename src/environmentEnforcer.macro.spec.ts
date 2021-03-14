import plugin from 'babel-plugin-macros';
import pluginTester from 'babel-plugin-tester';
import path from 'path';

pluginTester({
  plugin,
  pluginName: 'environment-enforce/macro',
  title: 'Environment Enforcer',
  babelOptions: {
    presets: ['@babel/preset-typescript'],
  },
  fixtures: path.join(__dirname, '..', '__fixtures__'),
});
