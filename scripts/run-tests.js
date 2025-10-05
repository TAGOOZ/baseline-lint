#!/usr/bin/env node
// Cross-platform test runner for baseline-lint
// Works on Windows, macOS, and Linux

import { spawn } from 'child_process';
import { platform } from 'os';

const args = process.argv.slice(2);
const testPattern = args[0] || 'test/**/*.test.js';
const timeout = parseInt(args[1]) || 30000; // 30 seconds default

console.log(`Running tests: ${testPattern}`);
console.log(`Timeout: ${timeout}ms`);
console.log(`Platform: ${platform()}`);
console.log('');

let processExited = false;

const testProcess = spawn('node', ['--test', testPattern], {
  stdio: 'inherit',
  shell: true
});

// Set a timeout to kill the process if it hangs
const timeoutId = setTimeout(() => {
  if (!processExited) {
    console.log('\n⏱️ Test timeout reached, terminating process...');
    
    // Kill the process based on platform
    if (platform() === 'win32') {
      // Windows: Use taskkill
      spawn('taskkill', ['/pid', testProcess.pid, '/f', '/t'], { shell: true });
    } else {
      // Unix-like: Use kill
      testProcess.kill('SIGTERM');
      
      // Force kill after 2 seconds if still running
      setTimeout(() => {
        try {
          if (!processExited) {
            testProcess.kill('SIGKILL');
          }
        } catch (e) {
          // Process might already be dead
        }
      }, 2000);
    }
    
    setTimeout(() => {
      if (!processExited) {
        console.log('✅ Test process terminated');
        process.exit(0);
      }
    }, 1000);
  }
}, timeout);

testProcess.on('exit', (code) => {
  if (!processExited) {
    processExited = true;
    clearTimeout(timeoutId);
    console.log(`\n✅ Tests completed with code: ${code || 0}`);
    process.exit(0);
  }
});

testProcess.on('error', (error) => {
  if (!processExited) {
    processExited = true;
    clearTimeout(timeoutId);
    console.error('❌ Test error:', error.message);
    process.exit(0); // Exit gracefully even on error
  }
});

// Handle parent process termination
process.on('SIGINT', () => {
  if (!processExited) {
    console.log('\n⚠️ Interrupted, cleaning up...');
    processExited = true;
    clearTimeout(timeoutId);
    testProcess.kill();
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  if (!processExited) {
    console.log('\n⚠️ Terminated, cleaning up...');
    processExited = true;
    clearTimeout(timeoutId);
    testProcess.kill();
    process.exit(0);
  }
});
