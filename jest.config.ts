const config = {
  coveragePathIgnorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    'index.ts',
    'Types.ts',
    'types.ts',
    '**/coverage/**'
  ],
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: ['__tests__\\/(?:.*\\/)+(.*).test.ts']
};
module.exports = config;
