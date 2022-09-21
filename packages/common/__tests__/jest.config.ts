import BaseConfig = require('../../../jest.config');

module.exports = {
  ...BaseConfig,
  rootDir: './',
  collectCoverageFrom: ['../src/**/*.ts'],
  coverageReporters: ['json', 'html'],
  coverageDirectory: './coverage'
};
