/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
module.exports = {
  fakeTimers: {
    enableGlobally: true,
  },
  modulePaths: ['<rootDir>', '<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
