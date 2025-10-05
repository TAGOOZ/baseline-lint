// baseline-lint/src/parsers/css-parser.js
// Parse CSS files and check Baseline compatibility

import { parse, walk } from 'css-tree';
import { checkCSSPropertyValue, generateReport } from '../core/checker.js';
import { ParseError, FileError, handleError, safeAsync } from '../utils/error-handler.js';
import { readFileWithCleanup } from '../utils/file-handler.js';
import { logger, logHelpers } from '../utils/logger.js';

/**
 * Check if a value is a CSS keyword worth checking for baseline compatibility
 */
function isCSSKeyword(value) {
  // Only check CSS keywords that might have compatibility issues
  // Exclude common values like 'auto', 'none', 'inherit', etc.
  const problematicKeywords = [
    'flex', 'grid',
    'auto-phrase', 'break-word', 'break-all',
    'sticky'
  ];
  
  return problematicKeywords.includes(value.toLowerCase());
}

// Common CSS properties that should be considered widely supported
const COMMON_CSS_PROPERTIES = new Set([
  'background', 'border-radius', 'padding', 'margin',
  'font', 'color', 'display', 'position', 'text-align',
  'width', 'height', 'overflow', 'border', 'float',
  'line-height', 'z-index', 'text-decoration', 'background-color',
  'font-size', 'font-weight', 'opacity', 'cursor', 'box-sizing',
  'box-shadow', 'transition', 'transform', 'vertical-align', 'letter-spacing'
]);

/**
 * Parse CSS content and find all Baseline issues
 */
export function analyzeCSSContent(cssContent, options = {}) {
  const { requiredLevel = 'low' } = options;
  const issues = [];
  
  logger.debug('Starting CSS content analysis', { requiredLevel, contentLength: cssContent.length });
  
  try {
    const ast = parse(cssContent, {
      positions: true,
      parseValue: true
    });
    
    walk(ast, {
      visit: 'Declaration',
      enter(node) {
        const property = node.property;
        let values = [];
        
        // Extract values from the declaration, but only check meaningful ones
        walk(node.value, {
          visit: 'Identifier',
          enter(valueNode) {
            const value = valueNode.name;
            // Only check values that are likely to be CSS keywords, not generic words
            if (isCSSKeyword(value)) {
              values.push(value);
            }
          }
        });
        
        // Check each property-value combination for meaningful values
        for (const value of values) {
          // Normal check for all properties/values
          const result = checkCSSPropertyValue(property, value);
          const report = generateReport(result, requiredLevel);
          
          // Include all features for baseline scoring (info, warning, error)
          issues.push({
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            property,
            value,
            severity: report.severity,
            message: report.message,
            baseline: report.baseline,
            support: report.support,
            bcdKey: report.bcdKey,
            compatible: report.compatible
          });
        }
        
        // Also check the property itself, but only if it's not in our common list
        if (!COMMON_CSS_PROPERTIES.has(property)) {
          const propertyResult = checkCSSPropertyValue(property, null);
          const propertyReport = generateReport(propertyResult, requiredLevel);
          
          // Include all features for baseline scoring (info, warning, error)
          // Only add if not already added via value check
          const alreadyAdded = issues.some(
            issue => issue.line === node.loc?.start.line && 
                    issue.property === property
          );
          
          if (!alreadyAdded) {
            issues.push({
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              property,
              value: null,
              severity: propertyReport.severity,
              message: propertyReport.message,
              baseline: propertyReport.baseline,
              support: propertyReport.support,
              bcdKey: propertyReport.bcdKey,
              compatible: propertyReport.compatible
            });
          }
        } else {
          // For common properties, add a positive entry
          // Only add if no value-specific check has been added yet
          const alreadyAdded = issues.some(
            issue => issue.line === node.loc?.start.line && 
                    issue.property === property
          );
          
          if (!alreadyAdded) {
            issues.push({
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              property,
              value: null,
              severity: 'info',
              message: 'Widely available (since 2012-01-01)',
              baseline: 'high',
              support: {
                chrome: '1',
                chrome_android: '18',
                edge: '12',
                firefox: '1',
                firefox_android: '4',
                safari: '1',
                safari_ios: '1'
              },
              compatible: true
            });
          }
        }
      }
    });
    
    // Check for at-rules
    walk(ast, {
      visit: 'Atrule',
      enter(node) {
        const atRuleName = node.name;
        const bcdKey = `css.at-rules.${atRuleName}`;
        
        // Check at-rule Baseline status
        const result = {
          type: 'at-rule',
          bcdKey,
          status: null // Would need to implement getBCDKeyStatus for at-rules
        };
        
        // For now, just log that we found an at-rule
        // You can extend this to check Baseline status
      }
    });
    
  } catch (error) {
    const errorInfo = handleError(error, { 
      type: 'css_parse',
      contentLength: cssContent?.length || 0 
    });
    
    throw new ParseError(
      `CSS parsing failed: ${error.message}`,
      null,
      null,
      null
    );
  }
  
  return {
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length
    }
  };
}

/**
 * Analyze a CSS file
 */
export const analyzeCSSFile = safeAsync(async (filePath, options = {}) => {
  try {
    const content = await readFileWithCleanup(filePath, { 
      encoding: 'utf-8',
      maxSize: options.maxFileSize || 50 * 1024 * 1024
    });
    const result = analyzeCSSContent(content, options);
    
    return {
      file: filePath,
      ...result
    };
  } catch (error) {
    // FileError is already properly formatted by readFileWithCleanup
    throw error;
  }
});

/**
 * Format issues for display
 */
export function formatIssues(issues) {
  return issues.map(issue => {
    const location = issue.line ? `${issue.line}:${issue.column}` : 'unknown';
    const propertyValue = issue.value 
      ? `${issue.property}: ${issue.value}` 
      : issue.property;
    
    let icon = '';
    if (issue.severity === 'error') icon = '❌';
    else if (issue.severity === 'warning') icon = '⚠️';
    else icon = 'ℹ️';
    
    let supportInfo = '';
    if (issue.support) {
      const browsers = Object.entries(issue.support)
        .map(([browser, version]) => `${browser} ${version}`)
        .join(', ');
      supportInfo = `\n    Support: ${browsers}`;
    }
    
    return `  ${icon} ${location} - ${propertyValue}
    ${issue.message}${supportInfo}`;
  }).join('\n\n');
}
