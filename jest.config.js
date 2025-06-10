const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: [
    '<rootDir>/.next/', 
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Resolver problemas com dependências deprecated
  resolver: undefined,
  // Melhorar performance dos testes
  maxWorkers: process.env.CI ? 1 : '50%',
  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  // Transform configuration para resolver warnings
  transformIgnorePatterns: [
    'node_modules/(?!((@testing-library/.*)|(@jest/.*)))',
  ],
  // Global configuration
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  // Silent deprecated warnings
  silent: process.env.CI === 'true',
  verbose: !process.env.CI,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 