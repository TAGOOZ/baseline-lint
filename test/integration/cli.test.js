// Integration tests for CLI functionality
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'node:path';

describe('CLI Integration Tests', () => {
  it('should show help when --help is provided', (t, done) => {
    const cliPath = path.join(process.cwd(), 'bin', 'cli.js');
    const child = spawn('node', [cliPath, '--help']);
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      assert.strictEqual(code, 0);
      assert(output.includes('Check web features for Baseline compatibility'));
      done();
    });
    
    child.on('error', (error) => {
      assert.fail(`CLI execution failed: ${error.message}`);
    });
  });

  it('should show version when --version is provided', (t, done) => {
    const cliPath = path.join(process.cwd(), 'bin', 'cli.js');
    const child = spawn('node', [cliPath, '--version']);
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      assert.strictEqual(code, 0);
      assert(output.includes('1.0.0'));
      done();
    });
    
    child.on('error', (error) => {
      assert.fail(`CLI execution failed: ${error.message}`);
    });
  });
});
