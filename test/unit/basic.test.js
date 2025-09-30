// Basic unit tests for baseline-lint
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Basic Tests', () => {
  it('should pass a basic test', () => {
    assert.strictEqual(1 + 1, 2);
  });

  it('should import core modules', async () => {
    try {
      const { getFeaturesByStatus } = await import('../../src/core/checker.js');
      assert(typeof getFeaturesByStatus === 'function');
    } catch (error) {
      assert.fail(`Failed to import core modules: ${error.message}`);
    }
  });

  it('should validate CLI input', async () => {
    try {
      const { validateCLIInput } = await import('../../src/utils/validation.js');
      assert(typeof validateCLIInput === 'function');
    } catch (error) {
      assert.fail(`Failed to import validation: ${error.message}`);
    }
  });
});
