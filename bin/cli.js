#!/usr/bin/env node
// bin/cli.js
// Enhanced CLI with JavaScript support and better reporting

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';
import { analyzeCSSFile, formatIssues } from '../src/parsers/css-parser.js';
import { analyzeJSFile, formatJSIssues } from '../src/parsers/js-parser.js';
import { 
  getFeaturesByStatus, 
  searchFeatures, 
  getFeatureStatus,
  calculateScore 
} from '../src/core/checker.js';
import { 
  validateCLIInput, 
  validateFilePath, 
  validateFileExtension,
  validateBaselineLevel,
  validateOutputFormat,
  sanitizeFilePath,
  VALIDATION_RULES 
} from '../src/utils/validation.js';
import { formatError } from '../src/utils/error-handler.js';
import { loadConfig, getCommandConfig } from '../src/config/config.js';
import { cleanupAllFileHandles } from '../src/utils/file-handler.js';
import { performanceMonitor, fileAnalysisTracker, memoryMonitor } from '../src/utils/performance.js';
import { logger } from '../src/utils/logger.js';

/**
 * Clean up resources and exit
 */
async function cleanupAndExit(code = 0) {
  try {
    await logger.close();
    performanceMonitor.stop();
    memoryMonitor.stop();
  } catch (cleanupError) {
    // Ignore cleanup errors during exit
  }
  process.exit(code);
}

const program = new Command();

program
  .name('baseline-lint')
  .description('Check web features for Baseline compatibility')
  .version('1.0.1');

/**
 * Main check command
 */
program
  .command('check [paths...]')
  .description('Check CSS/JS files for Baseline compatibility')
  .option('-l, --level <level>', 'Baseline level: widely|newly', 'newly')
  .option('-f, --format <format>', 'Output format: text|json', 'text')
  .option('--no-warnings', 'Hide warnings, show only errors')
  .option('--fail-on-error', 'Exit with error code if issues found')
  .option('--css-only', 'Check only CSS files')
  .option('--js-only', 'Check only JavaScript files')
  .option('--score', 'Calculate and show Baseline score')
  .option('--batch-size <size>', 'Batch size for processing files (default: 25)', '25')
  .option('-c, --config <path>', 'Path to configuration file')
  .action(async (paths, options) => {
    let operationId = null; // Declare outside try block
    
    try {
      // Start performance monitoring
      operationId = performanceMonitor.startOperation('cli_check', {
        paths_count: paths?.length || 0,
        level: options.level,
        format: options.format
      });
      
      // Start memory monitoring
      memoryMonitor.start();
      
      // Load configuration
      const config = await loadConfig(options.config);
      const commandConfig = getCommandConfig('check', options);
      
      // Merge config with command options
      const finalConfig = { ...config, ...commandConfig };
      
      // Validate input
      validateCLIInput('check', paths, finalConfig);
      
      const spinner = ora('Scanning files...').start();
      
      if (!paths || paths.length === 0) {
        paths = ['./src', './styles', './*.css', './*.js'];
      }
      
      // Sanitize paths
      const sanitizedPaths = paths.map(p => sanitizeFilePath(p));
      
      // Find CSS files
      let cssFiles = [];
      if (!options.jsOnly) {
        for (const p of sanitizedPaths) {
          // Check if it's a specific CSS file
          if (p.endsWith('.css')) {
            cssFiles.push(p);
          } else {
            // Handle directory patterns and glob patterns
            const pattern = p.includes('*') ? p : `${p}/**/*.css`;
            const files = await glob(pattern, { 
              ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
              windowsPathsNoEscape: true
            });
            cssFiles.push(...files);
          }
        }
      }
      
      // Find JS files
      let jsFiles = [];
      if (!options.cssOnly) {
        for (const p of sanitizedPaths) {
          // Check if it's a specific JS file
          if (p.match(/\.(js|jsx|ts|tsx)$/)) {
            jsFiles.push(p);
          } else {
            // Handle directory patterns and glob patterns
            const pattern = p.includes('*') ? p : `${p}/**/*.{js,jsx,ts,tsx}`;
            const files = await glob(pattern, { 
              ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
              windowsPathsNoEscape: true
            });
            jsFiles.push(...files);
          }
        }
      }
      
      const totalFiles = cssFiles.length + jsFiles.length;
      spinner.text = `Analyzing ${totalFiles} files (${cssFiles.length} CSS, ${jsFiles.length} JS)...`;
      
      const results = [];
      const requiredLevel = options.level === 'widely' ? 'high' : 'low';
      
      // Process files in batches for better performance
      const BATCH_SIZE = parseInt(options.batchSize) || 25; // Configurable batch size
      
      // Analyze CSS files in batches
      for (let i = 0; i < cssFiles.length; i += BATCH_SIZE) {
        const batch = cssFiles.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (file) => {
          try {
            const fileOpId = fileAnalysisTracker.startFileAnalysis(file, 'css');
            const result = await analyzeCSSFile(file, { requiredLevel });
            fileAnalysisTracker.endFileAnalysis(fileOpId, result.issues || []);
            
            // Store original issues for scoring
            result.originalIssues = result.issues || [];
            
            if (options.noWarnings) {
              result.issues = result.issues?.filter(i => i.severity === 'error') || [];
            }
            result.type = 'css';
            return result;
          } catch (error) {
            console.error(chalk.red(`Error analyzing CSS file ${file}:`));
            console.error(chalk.gray(formatError(error)));
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(result => {
          if (result) results.push(result);
        });
        
        // Update progress
        const processed = Math.min(i + BATCH_SIZE, cssFiles.length);
        spinner.text = `Analyzing CSS files... ${processed}/${cssFiles.length}`;
      }
      
      // Analyze JS files in batches
      for (let i = 0; i < jsFiles.length; i += BATCH_SIZE) {
        const batch = jsFiles.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (file) => {
          try {
            const fileOpId = fileAnalysisTracker.startFileAnalysis(file, 'js');
            const result = await analyzeJSFile(file, { requiredLevel });
            fileAnalysisTracker.endFileAnalysis(fileOpId, result.issues || []);
            
            // Store original issues for scoring
            result.originalIssues = result.issues || [];
            
            if (options.noWarnings) {
              result.issues = result.issues?.filter(i => i.severity === 'error') || [];
            }
            result.type = 'js';
            return result;
          } catch (error) {
            console.error(chalk.red(`Error analyzing JS file ${file}:`));
            console.error(chalk.gray(formatError(error)));
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(result => {
          if (result) results.push(result);
        });
        
        // Update progress
        const processed = Math.min(i + BATCH_SIZE, jsFiles.length);
        spinner.text = `Analyzing JS files... ${processed}/${jsFiles.length}`;
      }
      
      spinner.stop();
      
      // Calculate score if requested
      let score = null;
      if (options.score) {
        const allChecks = results.flatMap(r => r.originalIssues || r.issues || []);
        score = calculateScore(allChecks);
      }
      
      // Output results
      if (options.format === 'json') {
        console.log(JSON.stringify({ results, score }, null, 2));
      } else {
        printTextResults(results, options, score);
      }
      
      if (options.failOnError && results.length > 0) {
        performanceMonitor.endOperation(operationId, false);
        await cleanupAndExit(1);
      }
      
      // End performance monitoring
      performanceMonitor.endOperation(operationId, true);
      
      // Clean up all resources and exit
      await cleanupAndExit(0);
      
    } catch (error) {
      if (operationId) {
        performanceMonitor.endOperation(operationId, false, error);
      }
      console.error(chalk.red('Error during check:'));
      console.error(chalk.gray(formatError(error)));
      await cleanupAndExit(1);
    }
  });

/**
 * List features command
 */
program
  .command('list <status>')
  .description('List features by Baseline status: widely|newly|limited')
  .option('-g, --group <group>', 'Filter by group (css, javascript, etc.)')
  .option('-c, --count', 'Show count only')
  .action((status, options) => {
    const statusMap = {
      'widely': 'high',
      'newly': 'low',
      'limited': false
    };
    
    const baselineStatus = statusMap[status];
    if (baselineStatus === undefined) {
      console.error(chalk.red('Invalid status. Use: widely, newly, or limited'));
      process.exit(1);
    }
    
    let features = getFeaturesByStatus(baselineStatus);
    
    if (options.group) {
      features = features.filter(f => f.group === options.group);
    }
    
    if (options.count) {
      console.log(features.length);
      return;
    }
    
    console.log(chalk.bold(`\n${status.toUpperCase()} Available Features (${features.length}):\n`));
    
    features.slice(0, 50).forEach(feature => {
      const date = feature.status.baseline_low_date || feature.status.baseline_high_date;
      console.log(chalk.cyan(`  • ${feature.name}`));
      console.log(chalk.gray(`    ${feature.id}${date ? ` - since ${date}` : ''}`));
      if (feature.description) {
        console.log(chalk.gray(`    ${feature.description.slice(0, 80)}...`));
      }
      console.log();
    });
    
    if (features.length > 50) {
      console.log(chalk.gray(`  ... and ${features.length - 50} more\n`));
    }
  });

/**
 * Search features command
 */
program
  .command('search <query>')
  .description('Search for web features')
  .action((query) => {
    const results = searchFeatures(query);
    
    if (results.length === 0) {
      console.log(chalk.yellow(`\nNo features found matching "${query}"\n`));
      return;
    }
    
    console.log(chalk.bold(`\nFound ${results.length} features:\n`));
    
    results.slice(0, 20).forEach(feature => {
      const statusIcon = getStatusIcon(feature.baseline);
      console.log(`${statusIcon} ${chalk.cyan(feature.name)} ${chalk.gray(`(${feature.id})`)}`);
      if (feature.description) {
        console.log(chalk.gray(`  ${feature.description.slice(0, 100)}...`));
      }
      console.log();
    });
    
    if (results.length > 20) {
      console.log(chalk.gray(`... and ${results.length - 20} more results\n`));
    }
  });

/**
 * Info command
 */
program
  .command('info <featureId>')
  .description('Get detailed information about a feature')
  .action((featureId) => {
    const feature = getFeatureStatus(featureId);
    
    if (!feature) {
      console.error(chalk.red(`Feature "${featureId}" not found`));
      process.exit(1);
    }
    
    const statusIcon = getStatusIcon(feature.baseline);
    
    console.log();
    console.log(chalk.bold.cyan(feature.name));
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
    console.log(`${chalk.bold('Status:')} ${statusIcon} ${getStatusText(feature.baseline)}`);
    console.log(`${chalk.bold('Group:')} ${feature.group}`);
    
    if (feature.baseline_low_date) {
      console.log(`${chalk.bold('Newly Available Since:')} ${feature.baseline_low_date}`);
    }
    if (feature.baseline_high_date) {
      console.log(`${chalk.bold('Widely Available Since:')} ${feature.baseline_high_date}`);
    }
    
    console.log();
    console.log(chalk.bold('Browser Support:'));
    Object.entries(feature.support).forEach(([browser, version]) => {
      console.log(`  ${browser.padEnd(18)} ${version}`);
    });
    
    if (feature.description) {
      console.log();
      console.log(chalk.bold('Description:'));
      console.log(`  ${feature.description}`);
    }
    console.log();
  });

/**
 * Configuration command
 */
program
  .command('config')
  .description('Configuration management')
  .option('--init', 'Create a sample configuration file')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    try {
      if (options.init) {
        const { createSampleConfig } = await import('../src/config/config.js');
        const configPath = await createSampleConfig();
        console.log(chalk.green(`✓ Created sample configuration file: ${configPath}`));
        console.log(chalk.gray('Edit this file to customize your baseline-lint settings.'));
      } else if (options.show) {
        const config = await loadConfig();
        console.log(chalk.bold('\n📋 Current Configuration:\n'));
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log(chalk.yellow('Use --init to create a sample config or --show to display current config.'));
      }
    } catch (error) {
      console.error(chalk.red('Configuration error:'));
      console.error(chalk.gray(formatError(error)));
      process.exit(1);
    }
  });

/**
 * Performance command
 */
program
  .command('performance')
  .description('Show performance metrics and statistics')
  .option('--export <path>', 'Export metrics to file (json or csv)')
  .option('--clear', 'Clear all performance metrics')
  .action(async (options) => {
    try {
      if (options.clear) {
        performanceMonitor.metrics.clear();
        console.log(chalk.green('✓ Performance metrics cleared'));
        return;
      }

      const summary = performanceMonitor.getSummary();
      
      console.log(chalk.bold('\n📊 Performance Metrics\n'));
      console.log(chalk.gray('─'.repeat(50)));
      
      // Uptime
      console.log(`${chalk.bold('Uptime:')} ${(summary.uptime / 1000).toFixed(2)}s`);
      console.log(`${chalk.bold('Active Operations:')} ${summary.activeOperations}`);
      console.log();
      
      // File analysis metrics
      if (summary.counters && Object.keys(summary.counters).length > 0) {
        console.log(chalk.bold('File Analysis:'));
        Object.entries(summary.counters).forEach(([key, counter]) => {
          if (key.includes('files_analyzed')) {
            console.log(`  ${chalk.cyan(key)}: ${counter.value}`);
          }
        });
        console.log();
      }
      
      // Issue metrics
      if (summary.counters && Object.keys(summary.counters).length > 0) {
        console.log(chalk.bold('Issues Found:'));
        Object.entries(summary.counters).forEach(([key, counter]) => {
          if (key.includes('issues_found')) {
            const labels = Object.entries(counter.labels)
              .map(([k, v]) => `${k}=${v}`)
              .join(', ');
            console.log(`  ${chalk.cyan(key)}: ${counter.value} (${labels})`);
          }
        });
        console.log();
      }
      
      // Timing metrics
      if (summary.timers && Object.keys(summary.timers).length > 0) {
        console.log(chalk.bold('Timing Statistics:'));
        Object.entries(summary.timers).forEach(([key, timer]) => {
          console.log(`  ${chalk.cyan(key)}:`);
          console.log(`    Count: ${timer.count}`);
          console.log(`    Avg: ${timer.avg?.toFixed(2)}ms`);
          console.log(`    Min: ${timer.min?.toFixed(2)}ms`);
          console.log(`    Max: ${timer.max?.toFixed(2)}ms`);
          console.log(`    Total: ${timer.sum?.toFixed(2)}ms`);
        });
        console.log();
      }
      
      // Export if requested
      if (options.export) {
        const format = path.extname(options.export).slice(1) || 'json';
        await performanceMonitor.metrics.exportToFile(options.export, format);
        console.log(chalk.green(`✓ Metrics exported to: ${options.export}`));
      }
      
    } catch (error) {
      console.error(chalk.red('Performance error:'));
      console.error(chalk.gray(formatError(error)));
      process.exit(1);
    }
  });

/**
 * Cleanup command
 */
program
  .command('cleanup')
  .description('Cleanup file handles and temporary files')
  .action(async () => {
    try {
      const spinner = ora('Cleaning up...').start();
      
      await cleanupAllFileHandles();
      
      spinner.stop();
      console.log(chalk.green('✓ Cleanup completed successfully'));
    } catch (error) {
      console.error(chalk.red('Cleanup error:'));
      console.error(chalk.gray(formatError(error)));
      process.exit(1);
    }
  });
program
  .command('score [paths...]')
  .description('Calculate Baseline compatibility score (0-100)')
  .option('-l, --level <level>', 'Baseline level: widely|newly', 'newly')
  .option('--batch-size <size>', 'Batch size for processing files (default: 50)', '50')
  .action(async (paths, options) => {
    if (!paths || paths.length === 0) {
      paths = ['./src'];
    }
    
    const spinner = ora('Calculating score...').start();
    
    // Find all files
    const cssFiles = [];
    const jsFiles = [];
    
    for (const p of paths) {
      // Handle both directory patterns and direct file patterns
      const cssPattern = p.includes('*') ? p : `${p}/**/*.css`;
      const jsPattern = p.includes('*') ? p : `${p}/**/*.{js,jsx,ts,tsx}`;
      
      const css = await glob(cssPattern, { 
        ignore: ['**/node_modules/**', '**/dist/**'],
        windowsPathsNoEscape: true
      });
      const js = await glob(jsPattern, { 
        ignore: ['**/node_modules/**', '**/dist/**'],
        windowsPathsNoEscape: true
      });
      cssFiles.push(...css);
      jsFiles.push(...js);
    }
    
    const totalFiles = cssFiles.length + jsFiles.length;
    const requiredLevel = options.level === 'widely' ? 'high' : 'low';
    const allChecks = [];
    
    // Process files in batches for better performance
    const BATCH_SIZE = parseInt(options.batchSize) || 50; // Configurable batch size
    
    // Process CSS files in batches
    for (let i = 0; i < cssFiles.length; i += BATCH_SIZE) {
      const batch = cssFiles.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (file) => {
        try {
          const result = await analyzeCSSFile(file, { requiredLevel });
          return result.issues || [];
        } catch (error) {
          console.error(chalk.gray(`Warning: Could not analyze ${file}: ${error.message}`));
          return [];
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(issues => allChecks.push(...issues));
      
      // Update progress
      const processed = Math.min(i + BATCH_SIZE, cssFiles.length);
      spinner.text = `Processing CSS files... ${processed}/${cssFiles.length}`;
    }
    
    // Process JS files in batches
    for (let i = 0; i < jsFiles.length; i += BATCH_SIZE) {
      const batch = jsFiles.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (file) => {
        try {
          const result = await analyzeJSFile(file, { requiredLevel });
          return result.issues || [];
        } catch (error) {
          console.error(chalk.gray(`Warning: Could not analyze ${file}: ${error.message}`));
          return [];
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(issues => allChecks.push(...issues));
      
      // Update progress
      const processed = Math.min(i + BATCH_SIZE, jsFiles.length);
      spinner.text = `Processing JS files... ${processed}/${jsFiles.length}`;
    }
    
    const score = calculateScore(allChecks);
    
    spinner.stop();
    
    console.log();
    console.log(chalk.bold('📊 Baseline Compatibility Score'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
    
    const scoreColor = score >= 90 ? chalk.green : score >= 70 ? chalk.yellow : chalk.red;
    console.log(`  ${scoreColor.bold(`${score}/100`)}`);
    console.log();
    
    console.log(chalk.bold('Details:'));
    console.log(`  Total files analyzed: ${totalFiles}`);
    console.log(`  Total checks: ${allChecks.length}`);
    console.log(`  Errors: ${allChecks.filter(c => c.severity === 'error').length}`);
    console.log(`  Warnings: ${allChecks.filter(c => c.severity === 'warning').length}`);
    console.log();
  });

/**
 * Helper: Print text results
 */
function printTextResults(results, options, score) {
  // Filter out files with only info-level issues for display
  const displayResults = results.filter(result => {
    const hasDisplayIssues = result.issues?.some(issue => 
      issue.severity === 'error' || issue.severity === 'warning'
    );
    return hasDisplayIssues;
  });

  if (displayResults.length === 0) {
    console.log(chalk.green('\n✓ No Baseline issues found!\n'));
    if (score !== null) {
      console.log(chalk.bold(`📊 Score: ${chalk.green(`${score}/100`)}\n`));
    }
    return;
  }
  
  console.log(chalk.bold('\n📊 Baseline Compatibility Report\n'));
  
  if (score !== null) {
    const scoreColor = score >= 90 ? chalk.green : score >= 70 ? chalk.yellow : chalk.red;
    console.log(scoreColor.bold(`Score: ${score}/100\n`));
  }
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  displayResults.forEach(result => {
    const { file, issues, summary, type } = result;
    
    if (!issues || issues.length === 0) return;
    
    // Filter issues for display (show errors, warnings, and info for incompatible features)
    const displayIssues = issues.filter(issue => 
      issue.severity === 'error' || 
      issue.severity === 'warning' || 
      (issue.severity === 'info' && !issue.compatible)
    );
    
    if (displayIssues.length === 0) return;
    
    totalErrors += displayIssues.filter(i => i.severity === 'error').length;
    totalWarnings += displayIssues.filter(i => i.severity === 'warning').length;
    
    const fileIcon = type === 'css' ? '🎨' : '⚡';
    console.log(`${fileIcon} ${chalk.bold(file)}`);
    console.log(chalk.gray('─'.repeat(Math.min(file.length, 60))));
    
    if (type === 'css') {
      console.log(formatIssues(displayIssues));
    } else {
      console.log(formatJSIssues(displayIssues));
    }
    console.log();
  });
  
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.bold('Summary:'));
  console.log(`  Files with issues: ${displayResults.length}`);
  console.log(`  ${chalk.red('Errors:')} ${totalErrors}`);
  console.log(`  ${chalk.yellow('Warnings:')} ${totalWarnings}`);
  console.log();
}

/**
 * Helper: Get status icon
 */
function getStatusIcon(baseline) {
  if (baseline === 'high') return '✅';
  if (baseline === 'low') return '⚠️';
  return '❌';
}

/**
 * Helper: Get status text
 */
function getStatusText(baseline) {
  if (baseline === 'high') return chalk.green('Widely Available');
  if (baseline === 'low') return chalk.yellow('Newly Available');
  return chalk.red('Limited Availability');
}

program.parse();