const BaseConfig = require('../../../jest.config');

module.exports = {
  ...BaseConfig,
  rootDir: './',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  collectCoverageFrom: ['../src/**/*.{ts,tsx}', '!../src/**/*.d.ts'],
  coverageReporters: ['json', 'html', 'text'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@compx/common/(.*)$': '<rootDir>/../../common/src/$1',
    '^uuid$': require.resolve('uuid')
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ]
};
