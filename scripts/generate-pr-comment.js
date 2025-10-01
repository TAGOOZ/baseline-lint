#!/usr/bin/env node

/**
 * Generate detailed PR comments for baseline-lint results
 * This script parses the baseline-lint JSON output and creates
 * actionable, detailed comments with file locations and fixes
 */

import { readFileSync } from 'fs';

/**
 * Generate a fix suggestion based on the issue
 */
function generateFixSuggestion(issue, type) {
  const suggestions = {
    // CSS fix suggestions
    'word-break': {
      'auto-phrase': 'Use `word-break: break-word` for wider support',
    },
    'container-type': {
      'inline-size': 'Add fallback: `width: 100%; container-type: inline-size;`',
    },
    'container-query-length': {
      '*': 'Use media queries as fallback for older browsers',
    },
    'backdrop-filter': {
      '*': 'Add `-webkit-backdrop-filter` prefix for Safari support',
    },
    'aspect-ratio': {
      '*': 'Use padding-bottom hack: `padding-bottom: 56.25%; /* 16:9 */`',
    },
    
    // JavaScript fix suggestions  
    'Array.prototype.at': 'Use `arr[arr.length - 1]` instead of `arr.at(-1)`',
    'Array.prototype.findLast': 'Use `[...arr].reverse().find()` for older browsers',
    'Object.hasOwn': 'Use `Object.prototype.hasOwnProperty.call(obj, prop)`',
    'String.prototype.replaceAll': 'Use `str.replace(/pattern/g, replacement)`',
    'Promise.allSettled': 'Use Promise.all with .catch() for each promise',
    'structuredClone': 'Use `JSON.parse(JSON.stringify())` or a deep clone library',
    'AbortController': 'Add polyfill or use setTimeout/clearTimeout pattern',
    'ResizeObserver': 'Add polyfill or use window resize events',
    'IntersectionObserver': 'Add polyfill or use scroll event listeners',
  };

  if (type === 'css') {
    const propertyKey = issue.property;
    const valueKey = issue.value;
    
    if (suggestions[propertyKey]?.[valueKey]) {
      return suggestions[propertyKey][valueKey];
    }
    if (suggestions[propertyKey]?.['*']) {
      return suggestions[propertyKey]['*'];
    }
  } else if (type === 'js') {
    const apiKey = issue.api;
    if (suggestions[apiKey]) {
      return suggestions[apiKey];
    }
  }

  // Generic suggestions based on baseline status
  if (issue.baseline === false) {
    return type === 'css' 
      ? 'Consider using widely supported alternatives'
      : 'Add polyfill or use alternative implementation';
  } else if (issue.baseline === 'low') {
    return 'Consider adding fallback for older browsers';
  }

  return 'Review browser support requirements';
}

/**
 * Get browser support summary
 */
function getBrowserSupport(issue) {
  if (!issue.support) return null;
  
  const browserNames = {
    chrome: 'Chrome',
    firefox: 'Firefox', 
    safari: 'Safari',
    edge: 'Edge'
  };
  
  const supported = [];
  const unsupported = [];
  
  Object.entries(issue.support).forEach(([browser, version]) => {
    const name = browserNames[browser] || browser;
    if (version && version !== false) {
      supported.push(`${name} ${version}+`);
    } else {
      unsupported.push(name);
    }
  });
  
  if (unsupported.length > 0) {
    return `❌ Missing: ${unsupported.join(', ')}`;
  } else if (supported.length > 0) {
    return `✅ ${supported.join(', ')}`;
  }
  
  return null;
}

/**
 * Get priority icon and level
 */
function getPriority(issue) {
  if (issue.severity === 'error' || issue.baseline === false) {
    return { icon: '🔴', level: 'Critical', description: 'Blocks major browsers' };
  } else if (issue.severity === 'warning' || issue.baseline === 'low') {
    return { icon: '🟡', level: 'Warning', description: 'Newly available feature' };
  } else {
    return { icon: '🔵', level: 'Info', description: 'Consider for optimization' };
  }
}

/**
 * Format a single issue for display
 */
function formatIssue(issue, file, type) {
  const priority = getPriority(issue);
  const feature = type === 'css' 
    ? (issue.value ? `${issue.property}: ${issue.value}` : issue.property)
    : issue.api;
  
  const location = `**${file}:${issue.line || '?'}${issue.column ? `:${issue.column}` : ''}**`;
  const fixSuggestion = generateFixSuggestion(issue, type);
  const browserSupport = getBrowserSupport(issue);
  
  let output = `${priority.icon} ${location}\n`;
  output += `- \`${feature}\`\n`;
  output += `- ${issue.message}\n`;
  
  if (browserSupport) {
    output += `- ${browserSupport}\n`;
  }
  
  output += `- **Fix:** ${fixSuggestion}\n`;
  
  return output;
}

/**
 * Generate the complete PR comment
 */
function generateComment(results, score, options = {}) {
  const { previousScore = null, repoOwner = '', repoName = '' } = options;
  
  // Calculate score change
  let scoreChange = '';
  if (previousScore !== null) {
    const diff = score - previousScore;
    if (diff > 0) scoreChange = ` (+${diff} from last PR)`;
    else if (diff < 0) scoreChange = ` (${diff} from last PR)`;
  }
  
  // Count issues by severity
  let totalIssues = 0;
  let criticalIssues = 0;
  let warningIssues = 0;
  
  results.forEach(result => {
    if (result.issues) {
      result.issues.forEach(issue => {
        totalIssues++;
        const priority = getPriority(issue);
        if (priority.level === 'Critical') criticalIssues++;
        else if (priority.level === 'Warning') warningIssues++;
      });
    }
  });
  
  // Generate header
  let comment = `## 🎯 Baseline Compatibility Report\n\n`;
  comment += `**Score:** ${score}/100${scoreChange}\n\n`;
  
  if (totalIssues === 0) {
    comment += `🎉 **Perfect! No baseline compatibility issues found.**\n\n`;
    comment += `All CSS and JavaScript features are widely supported across browsers.\n\n`;
    return comment + generateFooter(repoOwner, repoName);
  }
  
  // Issue summary
  comment += `### Issues Found (${totalIssues}):\n\n`;
  
  // Group issues by file
  const fileIssues = {};
  results.forEach(result => {
    if (result.issues && result.issues.length > 0) {
      fileIssues[result.file] = {
        issues: result.issues,
        type: result.type
      };
    }
  });
  
  // Format each file's issues
  Object.entries(fileIssues).forEach(([file, data]) => {
    data.issues.forEach(issue => {
      comment += formatIssue(issue, file, data.type) + '\n';
    });
  });
  
  // Summary section
  comment += `### Summary\n\n`;
  if (criticalIssues > 0) {
    comment += `- 🔴 **${criticalIssues} critical issue${criticalIssues !== 1 ? 's' : ''}** (limited browser support)\n`;
  }
  if (warningIssues > 0) {
    comment += `- 🟡 **${warningIssues} warning${warningIssues !== 1 ? 's' : ''}** (newly available features)\n`;
  }
  
  // Recommendations
  if (criticalIssues > 0) {
    comment += `- **Recommendation:** Fix critical issues before merge\n`;
  } else if (warningIssues > 0) {
    comment += `- **Recommendation:** Consider fixes if targeting older browsers\n`;
  }
  
  comment += `\n`;
  return comment + generateFooter(repoOwner, repoName);
}

/**
 * Generate footer with useful links
 */
function generateFooter(repoOwner, repoName) {
  let footer = `### Quick Actions\n\n`;
  footer += `- 📊 [View detailed baseline guide](https://web.dev/baseline/)\n`;
  footer += `- 🔧 Fix locally: \`npx baseline-lint check ./src --score\`\n`;
  footer += `- 📚 [Learn about Baseline](https://github.com/web-platform-dx/web-features)\n`;
  
  if (repoOwner && repoName) {
    footer += `- 📋 [Workflow logs](https://github.com/${repoOwner}/${repoName}/actions)\n`;
  }
  
  footer += `\n---\n`;
  footer += `*🤖 Generated by [baseline-lint](https://www.npmjs.com/package/baseline-lint)*`;
  
  return footer;
}

/**
 * Main function to process CLI arguments and generate comment
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: generate-pr-comment.js <results-json-file> [options]');
    console.error('Options:');
    console.error('  --previous-score <score>  Previous PR score for comparison');
    console.error('  --repo-owner <owner>      GitHub repository owner');
    console.error('  --repo-name <name>        GitHub repository name');
    process.exit(1);
  }
  
  const resultsFile = args[0];
  const options = {};
  
  // Parse options
  for (let i = 1; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    
    switch (flag) {
      case '--previous-score':
        options.previousScore = parseInt(value);
        break;
      case '--repo-owner':
        options.repoOwner = value;
        break;
      case '--repo-name':
        options.repoName = value;
        break;
    }
  }
  
  try {
    // Read and parse results
    const resultsContent = readFileSync(resultsFile, 'utf-8');
    const data = JSON.parse(resultsContent);
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid results format: missing results array');
    }
    
    const score = data.score || 100;
    const comment = generateComment(data.results, score, options);
    
    console.log(comment);
  } catch (error) {
    console.error('Error generating PR comment:', error.message);
    process.exit(1);
  }
}

// Export functions for testing
export { generateComment, formatIssue, generateFixSuggestion, getBrowserSupport, getPriority };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
