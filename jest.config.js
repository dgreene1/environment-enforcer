module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['node_modules', 'dist'],
  collectCoverage: false,
  coverageThreshold: {
    global: {
      branches: 79.03,
      functions: 82.42,
      lines: 84.22,
      statements: 84.38,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts,jsx,tsx}',
    '!**/node_modules/**',
    // You can't get code coverage environmentEnforcer.macro.ts since babel-plugin-tester doesn't do that and that's where we test this end-to-end. We get unit level coverage elsewhere though
    '!src/index.macro.ts',
    '!**/__fixtures__/**',
    '!**/dist/**',
  ],
};
