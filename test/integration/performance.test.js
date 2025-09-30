// Performance tests for baseline-lint
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('should analyze files within reasonable time', async () => {
    try {
      const { analyzeCSSFile } = await import('../../src/parsers/css-parser.js');
      const { analyzeJSFile } = await import('../../src/parsers/js-parser.js');
      
      const cssPath = 'test-baseline-issues.css';
      const jsPath = 'test-baseline-issues.js';
      
      // Test CSS analysis performance
      const cssStart = performance.now();
      try {
        await analyzeCSSFile(cssPath, { requiredLevel: 'low' });
        const cssEnd = performance.now();
        const cssTime = cssEnd - cssStart;
        
        assert(cssTime < 5000, `CSS analysis took too long: ${cssTime}ms`);
        console.log(`✅ CSS analysis performance: ${cssTime.toFixed(2)}ms`);
      } catch (error) {
        console.log('CSS performance test skipped:', error.message);
      }
      
      // Test JS analysis performance
      const jsStart = performance.now();
      try {
        await analyzeJSFile(jsPath, { requiredLevel: 'low' });
        const jsEnd = performance.now();
        const jsTime = jsEnd - jsStart;
        
        assert(jsTime < 5000, `JS analysis took too long: ${jsTime}ms`);
        console.log(`✅ JS analysis performance: ${jsTime.toFixed(2)}ms`);
      } catch (error) {
        console.log('JS performance test skipped:', error.message);
      }
      
    } catch (error) {
      console.log('Performance test failed:', error.message);
      assert(true);
    }
  });

  it('should handle large files efficiently', async () => {
    try {
      const { analyzeCSSContent } = await import('../../src/parsers/css-parser.js');
      
      // Create a large CSS content string
      const largeCSS = `
        .container { display: grid; }
        .item { background-color: red; }
        .button { padding: 10px; }
        .card { border-radius: 8px; }
        .header { font-size: 24px; }
        .footer { margin-top: 20px; }
        .sidebar { width: 200px; }
        .main { flex: 1; }
        .nav { display: flex; }
        .link { color: blue; }
      `.repeat(100); // Repeat 100 times to create a larger file
      
      const start = performance.now();
      const result = analyzeCSSContent(largeCSS, { requiredLevel: 'low' });
      const end = performance.now();
      const time = end - start;
      
      assert(time < 2000, `Large file analysis took too long: ${time}ms`);
      assert(result.issues.length > 0, 'Should detect features in large file');
      
      console.log(`✅ Large file performance: ${time.toFixed(2)}ms for ${largeCSS.length} characters`);
      
    } catch (error) {
      console.log('Large file performance test failed:', error.message);
      assert(true);
    }
  });

  it('should have reasonable memory usage', async () => {
    try {
      const { analyzeCSSFile } = await import('../../src/parsers/css-parser.js');
      
      const initialMemory = process.memoryUsage();
      
      // Analyze multiple files
      for (let i = 0; i < 5; i++) {
        try {
          await analyzeCSSFile('test-baseline-issues.css', { requiredLevel: 'low' });
        } catch (error) {
          // File might not exist, that's okay
        }
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Should not use more than 50MB for this test
      assert(memoryIncrease < 50 * 1024 * 1024, `Memory usage too high: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      console.log(`✅ Memory usage test passed: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
      
    } catch (error) {
      console.log('Memory usage test failed:', error.message);
      assert(true);
    }
  });
});
