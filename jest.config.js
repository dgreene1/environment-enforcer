module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['node_modules', 'dist'],
  coverageThreshold: {
    global: {
      branches: 79.03,
      functions: 82.42,
      lines: 84.22,
      statements: 84.38,
    },
  },
};
