// Integration tests for CLI functionality
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'node:path';

describe('CLI Integration Tests', () => {
  it('should show help when --help is provided', (t, done) => {
    const cliPath = path.join(process.cwd(), 'bin', 'cli.js');
    const child = spawn('node', [cliPath, '--help']);
    
    // Add timeout protection
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      assert.fail('Test timed out after 30 seconds');
      done();
    }, 30000);
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      assert.strictEqual(code, 0);
      assert(output.includes('Check web features for Baseline compatibility'));
      done();
    });
    
    child.on('error', (error) => {
      clearTimeout(timeout);
      assert.fail(`CLI execution failed: ${error.message}`);
    });
  });

  it('should show version when --version is provided', (t, done) => {
    const cliPath = path.join(process.cwd(), 'bin', 'cli.js');
    const child = spawn('node', [cliPath, '--version']);
    
    // Add timeout protection
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      assert.fail('Test timed out after 30 seconds');
      done();
    }, 30000);
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      assert.strictEqual(code, 0);
      assert(output.includes('1.0.6'));
      done();
    });
    
    child.on('error', (error) => {
      clearTimeout(timeout);
      assert.fail(`CLI execution failed: ${error.message}`);
    });
  });
});
