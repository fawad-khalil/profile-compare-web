const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|js)$': ['jest-preset-angular', {
      tsconfig: 'tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }]
  },
  collectCoverageFrom: [
    'projects/profile-compare-lib/src/lib/**/*.ts',
    '!projects/profile-compare-lib/src/lib/**/*.spec.ts',
    '!projects/profile-compare-lib/src/lib/**/*.d.ts',
    '!projects/profile-compare-lib/src/lib/**/index.ts',
    '!projects/profile-compare-lib/src/lib/**/*.module.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    'profile-compare-lib': '<rootDir>/projects/profile-compare-lib/src/public-api.ts'
  },
  testMatch: [
    '<rootDir>/projects/profile-compare-lib/src/**/*.spec.ts'
  ],
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|swiper|ssr-window|dom7))'
  ]
};
