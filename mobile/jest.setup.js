/* global jest */
// AsyncStorage is a native module (null under Jest); the package ships this
// official in-memory mock for tests — see its docs on Jest integration.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
