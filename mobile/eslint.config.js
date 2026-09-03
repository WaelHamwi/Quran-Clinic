// Flat ESLint config — Expo's official ruleset.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      '.expo/**',
      'dist/**',
      'coverage/**',
      'babel.config.js',
      'jest.config.js',
      'eslint.config.js',
    ],
  },
  {
    // eslint-plugin-react-hooks v6 (pulled in by eslint-config-expo) ships the
    // experimental React Compiler rules as errors. They flag many correct,
    // intentional patterns and adopting them means a React Compiler migration.
    // Keep them visible as warnings (ratchet later) rather than failing CI on
    // pre-existing app code. Standard hook rules (exhaustive-deps, etc.) stay.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
];
