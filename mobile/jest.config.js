/** @type {import('jest').Config} */
const expoPreset = require('jest-expo/jest-preset');

// jest-expo resolves packages via their "react-native" export condition, which makes
// Redux Toolkit & friends load their TS source from node_modules. Extend (don't replace)
// the preset's ignore pattern so those packages are transformed too.
const transformIgnorePatterns = (expoPreset.transformIgnorePatterns ?? []).map((pattern) =>
  typeof pattern === 'string'
    ? pattern.replace(
        'node_modules/(?!',
        'node_modules/(?!@reduxjs/toolkit|immer|reselect|redux|redux-persist|react-redux|',
      )
    : pattern,
);

module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns,
  setupFiles: ['<rootDir>/jest.setup.js'],
  clearMocks: true,
};
