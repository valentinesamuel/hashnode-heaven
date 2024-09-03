import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(e2e|test).ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/?(*.)+(test).ts'],
      preset: 'ts-jest',
    },
    {
      displayName: 'e2e',
      testMatch: ['**/?(*.)+(e2e).ts'],
      preset: 'ts-jest',
    },
  ],
};

export default config;
