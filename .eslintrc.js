module.exports = {
  root: true,
  ignorePatterns: ['dist/*.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "NewExpression[callee.name='Error']",
        message: "Use MacroError from 'babel-plugin-macros' instead",
      },
    ],
    'no-console': 'error',
  },
};
