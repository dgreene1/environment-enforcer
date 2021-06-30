module.exports = {
  root: true,
  ignorePatterns: [
    '.eslintrc.js',
    'dist/**/*',
    'jest.config.js',
    '__fixtures__/**/*.js',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "NewExpression[callee.name='Error']",
        message: "Use MacroError from 'babel-plugin-macros' instead",
      },
      {
        selector: "CallExpression[callee.name='xit']",
        message:
          "Just delete dead code since it's already in Github. It's problematic to have to fix compiler errors in tests that aren't run",
      },
      {
        selector: "CallExpression[callee.name='xdescribe']",
        message:
          "Just delete dead code since it's already in Github. It's problematic to have to fix compiler errors in tests that aren't run",
      },
    ],
    'no-console': 'warn',
  },
};
