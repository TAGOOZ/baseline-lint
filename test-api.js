#!/usr/bin/env node

// Test script to verify our baseline-lint API integration
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testBaselineLintIntegration() {
  console.log('🧪 Testing baseline-lint integration...\n');
  
  // Test the CLI command directly
  const cliPath = path.join(__dirname, 'bin', 'cli.js');
  const scanPath = path.join(__dirname, 'src');
  const command = `node "${cliPath}" check "${scanPath}" --format json`;
  
  console.log('📋 Running command:', command);
  console.log('');
  
  exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('⚠️  Stderr:', stderr);
    }
    
    try {
      const result = JSON.parse(stdout);
      console.log('✅ Successfully parsed JSON output!');
      console.log('');
      
      // Calculate dashboard metrics
      const results = result.results || [];
      const totalFiles = results.length;
      
      let cssFiles = 0;
      let jsFiles = 0;
      let criticalIssues = 0;
      let warnings = 0;
      let infoIssues = 0;
      let cleanFiles = 0;
      
      results.forEach(fileResult => {
        const ext = path.extname(fileResult.file).toLowerCase();
        if (ext === '.css' || ext === '.scss' || ext === '.sass') {
          cssFiles++;
        } else if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx') {
          jsFiles++;
        }
        
        if (fileResult.issues.length === 0) {
          cleanFiles++;
        } else {
          fileResult.issues.forEach(issue => {
            if (issue.severity === 'error') {
              criticalIssues++;
            } else if (issue.severity === 'warning') {
              warnings++;
            } else if (issue.severity === 'info') {
              infoIssues++;
            }
          });
        }
      });
      
      // Get overall score
      const overallScore = result.score || 0;
      
      console.log('📊 Dashboard Data Preview:');
      console.log('═'.repeat(50));
      console.log(`🎯 Overall Score: ${overallScore}/100`);
      console.log(`📁 Total Files: ${totalFiles}`);
      console.log(`🎨 CSS Files: ${cssFiles}`);
      console.log(`⚡ JS Files: ${jsFiles}`);
      console.log(`🚨 Critical Issues: ${criticalIssues}`);
      console.log(`⚠️  Warnings: ${warnings}`);
      console.log(`ℹ️  Info Issues: ${infoIssues}`);
      console.log(`✅ Clean Files: ${cleanFiles} (${Math.round((cleanFiles / totalFiles) * 100)}%)`);
      console.log('');
      
      console.log('🗂️  Recent Files:');
      results.slice(0, 5).forEach((fileResult, index) => {
        const fileName = path.relative(scanPath, fileResult.file);
        const status = fileResult.issues.length === 0 ? 'good' : 
                     fileResult.issues.some(i => i.severity === 'error') ? 'error' : 'warning';
        const statusIcon = status === 'good' ? '✅' : status === 'warning' ? '⚠️' : '❌';
        console.log(`  ${index + 1}. ${statusIcon} ${fileName} (${fileResult.issues.length} issues)`);
      });
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError.message);
      console.log('Raw output:', stdout.substring(0, 500) + '...');
    }
  });
}

testBaselineLintIntegration();
