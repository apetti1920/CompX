const BaseConfig = require('../../../jest.config');
const path = require('path');

module.exports = {
  ...BaseConfig,
  rootDir: './',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [path.join(__dirname, 'setupTests.ts')],
  collectCoverageFrom: ['../src/**/*.{ts,tsx}', '!../src/**/*.d.ts'],
  coverageReporters: ['json', 'html', 'text'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@compx/common$': '<rootDir>/../../common/src',
    '^@compx/common/(.*)$': '<rootDir>/../../common/src/$1',
    '^uuid$': require.resolve('uuid')
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: false,
        isolatedModules: true,
        jsx: 'react',
        moduleResolution: 'node',
        resolveJsonModule: true,
        target: 'es5',
        module: 'commonjs',
        lib: ['dom', 'dom.iterable', 'esnext']
      },
      isolatedModules: true
    }],
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ]
};
