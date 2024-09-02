import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(e2e|test).ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
};

export default config;
