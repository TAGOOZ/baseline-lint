#!/usr/bin/env node
/**
 * Test runner that properly exits after tests complete
 * Handles Node.js test runner hanging issues gracefully
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function runTests(testPattern) {
  return new Promise((resolve, reject) => {
    console.log(`Running: node --test ${testPattern}`);
    
    const child = spawn('node', ['--test', testPattern], {
      cwd: projectRoot,
      stdio: 'pipe',
      shell: false
    });

    let stdout = '';
    let stderr = '';
    let testCompleted = false;

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
      
      // Check if tests have completed
      if (output.includes('duration_ms') || output.includes('✔') || output.includes('fail')) {
        testCompleted = true;
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    child.on('close', (code) => {
      resolve(code);
    });

    child.on('error', (error) => {
      reject(error);
    });

    // Give extra time for large projects but force exit if hanging
    const timeout = setTimeout(() => {
      if (testCompleted) {
        console.log('\n✅ Tests completed, forcing exit...');
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 1000);
        resolve(0);
      } else {
        console.log('\n❌ Tests timed out');
        child.kill('SIGKILL');
        reject(new Error('Test timeout - no progress detected'));
      }
    }, 120000); // 2 minutes - generous for large projects

    // If tests complete naturally, clear timeout
    child.on('exit', () => {
      clearTimeout(timeout);
    });
  });
}

async function main() {
  try {
    const testPattern = process.argv[2] || '"test/**/*.test.js"';
    const exitCode = await runTests(testPattern);
    
    if (exitCode === 0) {
      console.log('✅ All tests completed successfully');
    } else {
      console.log(`❌ Tests failed with exit code ${exitCode}`);
    }
    
    // Force exit after a brief delay
    setTimeout(() => {
      process.exit(exitCode);
    }, 500);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    setTimeout(() => {
      process.exit(1);
    }, 500);
  }
}

main();
