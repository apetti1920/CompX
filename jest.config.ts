const config = {
  projects: [
    {
      displayName: 'common',
      testMatch: ['<rootDir>/packages/common/__tests__/**/*.test.ts'],
      coveragePathIgnorePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        'index.ts',
        'Types.ts',
        'types.ts',
        '**/coverage/**'
      ],
      preset: 'ts-jest',
      testEnvironment: 'node'
    },
    {
      displayName: 'web_app',
      testMatch: [
        '<rootDir>/packages/web_app/__tests__/**/*.test.ts',
        '<rootDir>/packages/web_app/__tests__/**/*.test.tsx'
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/packages/web_app/__tests__/setupTests.ts'],
      collectCoverageFrom: [
        '<rootDir>/packages/web_app/src/**/*.{ts,tsx}',
        '!<rootDir>/packages/web_app/src/**/*.d.ts'
      ],
      coverageDirectory: '<rootDir>/packages/web_app/__tests__/coverage',
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@compx/common$': '<rootDir>/packages/common/src',
        '^@compx/common/(.*)$': '<rootDir>/packages/common/src/$1',
        '^uuid$': require.resolve('uuid')
      },
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: {
              skipLibCheck: true,
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
              strict: false,
              isolatedModules: true,
              jsx: 'react',
              jsxFactory: 'React.createElement',
              jsxFragmentFactory: 'React.Fragment',
              moduleResolution: 'node',
              resolveJsonModule: true,
              target: 'es5',
              module: 'commonjs',
              lib: ['dom', 'dom.iterable', 'esnext']
            },
            isolatedModules: true
          }
        ],
        '^.+\\.js$': 'babel-jest'
      },
      transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
      preset: 'ts-jest'
    }
  ]
};
module.exports = config;
