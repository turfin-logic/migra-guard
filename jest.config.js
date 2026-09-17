/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/.test-dist'],
  testMatch: ['**/*.test.js'],
  transform: {},
};
