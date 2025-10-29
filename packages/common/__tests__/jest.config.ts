module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['../src/**/*.ts'],
  coverageReporters: ['json', 'html'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'index.ts',
    'Types.ts',
    'types.ts',
    '/coverage/'
  ]
};
