#!/usr/bin/env node

// Test script to verify our fixes are working
import { analyzeCSSFile } from './src/parsers/css-parser.js';
import { analyzeJSFile } from './src/parsers/js-parser.js';
import { clearCache } from './src/core/checker.js';

console.log('🧪 Testing baseline-lint fixes...\n');

// Clear cache
clearCache();

// Test CSS file
console.log('📄 Testing CSS file...');
try {
  const cssResult = await analyzeCSSFile('test-pr-files/test-component.css');
  console.log(`✅ CSS Analysis: ${cssResult.issues.length} issues found`);
  
  const cssWarnings = cssResult.issues.filter(i => i.severity === 'warning');
  const cssInfos = cssResult.issues.filter(i => i.severity === 'info');
  
  console.log(`   - Warnings: ${cssWarnings.length}`);
  console.log(`   - Info (compatible): ${cssInfos.length}`);
  
  if (cssWarnings.length > 0) {
    console.log('   - Warning details:');
    cssWarnings.forEach(w => {
      console.log(`     • ${w.property}:${w.value || 'null'} - ${w.message}`);
    });
  }
  
} catch (error) {
  console.error('❌ CSS test failed:', error.message);
}

console.log('');

// Test JS file
console.log('📄 Testing JS file...');
try {
  const jsResult = await analyzeJSFile('test-pr-files/test-component.js');
  console.log(`✅ JS Analysis: ${jsResult.issues.length} issues found`);
  
  const jsWarnings = jsResult.issues.filter(i => i.severity === 'warning');
  const jsInfos = jsResult.issues.filter(i => i.severity === 'info');
  
  console.log(`   - Warnings: ${jsWarnings.length}`);
  console.log(`   - Info (compatible): ${jsInfos.length}`);
  
  if (jsWarnings.length > 0) {
    console.log('   - Warning details:');
    jsWarnings.forEach(w => {
      console.log(`     • ${w.api} - ${w.message}`);
    });
  }
  
} catch (error) {
  console.error('❌ JS test failed:', error.message);
}

console.log('\n🎯 Test completed!');
