// Jest type definitions for baseline-lint tests

import { AnalysisResult, Issue, BaselineFeature } from '../index';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBaselineIssue(expectedIssue: Partial<Issue>): R;
      toHaveBaselineScore(expectedScore: number, tolerance?: number): R;
      toBeBaselineCompatible(): R;
      toHaveValidConfig(): R;
      toHaveValidCache(): R;
    }
  }
}

// Custom test utilities
export interface TestUtils {
  createMockAnalysisResult(overrides?: Partial<AnalysisResult>): AnalysisResult;
  createMockIssue(overrides?: Partial<Issue>): Issue;
  createMockBaselineFeature(overrides?: Partial<BaselineFeature>): BaselineFeature;
  createTempTestFile(content: string, extension?: string): Promise<string>;
  cleanupTempTestFiles(): Promise<void>;
  waitForAsync(): Promise<void>;
}

// Test data fixtures
export interface TestFixtures {
  css: {
    valid: string;
    invalid: string;
    modern: string;
    legacy: string;
  };
  js: {
    valid: string;
    invalid: string;
    modern: string;
    legacy: string;
  };
  config: {
    valid: any;
    invalid: any;
    minimal: any;
    complete: any;
  };
}

// Mock implementations
export interface MockImplementations {
  fileSystem: {
    readFile: jest.MockedFunction<typeof import('fs').promises.readFile>;
    writeFile: jest.MockedFunction<typeof import('fs').promises.writeFile>;
    stat: jest.MockedFunction<typeof import('fs').promises.stat>;
    readdir: jest.MockedFunction<typeof import('fs').promises.readdir>;
  };
  network: {
    fetch: jest.MockedFunction<typeof fetch>;
  };
  cache: {
    get: jest.MockedFunction<any>;
    set: jest.MockedFunction<any>;
    clear: jest.MockedFunction<any>;
  };
}

// Test environment setup
export interface TestEnvironment {
  setup(): Promise<void>;
  teardown(): Promise<void>;
  reset(): Promise<void>;
}

// Export test utilities
export const testUtils: TestUtils;
export const fixtures: TestFixtures;
export const mocks: MockImplementations;
export const testEnv: TestEnvironment;
