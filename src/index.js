// src/index.js
// Main entry point for baseline-lint package

import { analyzeCSSContent, analyzeCSSFile, formatIssues } from './parsers/css-parser.js';
import { analyzeJSContent, analyzeJSFile, formatJSIssues } from './parsers/js-parser.js';
import { 
  getFeatureStatus,
  getFeaturesByStatus,
  getFeaturesByGroup,
  searchFeatures,
  checkCSSPropertyValue,
  checkJavaScriptAPI,
  generateReport,
  calculateScore,
  meetsBaselineLevel,
  BaselineLevel,
  clearCache,
  getCacheStats
} from './core/checker.js';

// Import utilities
import { 
  BaselineLintError,
  ParseError,
  ValidationError,
  FileError,
  handleError,
  formatError
} from './utils/error-handler.js';

import {
  validateFilePath,
  validateFileExtension,
  validateBaselineLevel,
  validateOutputFormat,
  validateContentLength,
  validateOptions,
  validatePaths,
  sanitizeFilePath,
  sanitizeContent,
  VALIDATION_RULES
} from './utils/validation.js';

// Import LRU cache utilities
import {
  LRUCache,
  createLRUCache,
  bcdCache,
  featureCache,
  clearAllCaches,
  getAllCacheStats
} from './utils/lru-cache.js';

// Import configuration utilities
import { 
  loadConfig, 
  createSampleConfig, 
  getCommandConfig, 
  DEFAULT_CONFIG,
  CONFIG_FILES 
} from './config/config.js';

// Import file handling utilities
import {
  readFileWithCleanup,
  writeFileWithCleanup,
  createReadStreamWithCleanup,
  createWriteStreamWithCleanup,
  copyFileWithCleanup,
  moveFileWithCleanup,
  deleteFileWithCleanup,
  ensureDirWithCleanup,
  getFileStatsWithCleanup,
  cleanupAllFileHandles,
  getActiveFileHandleCount,
  processFilesWithCleanup,
  createTempFile,
  cleanupTempFiles,
  getTempFileCount,
  FileHandleManager,
  TemporaryFileManager
} from './utils/file-handler.js';

/**
 * Main API exports for baseline-lint
 */
export {
  // CSS Analysis
  analyzeCSSContent,
  analyzeCSSFile,
  formatIssues,
  
  // JavaScript Analysis
  analyzeJSContent,
  analyzeJSFile,
  formatJSIssues,
  
  // Core checking functions
  getFeatureStatus,
  getFeaturesByStatus,
  getFeaturesByGroup,
  searchFeatures,
  checkCSSPropertyValue,
  checkJavaScriptAPI,
  generateReport,
  calculateScore,
  meetsBaselineLevel,
  BaselineLevel,
  clearCache,
  getCacheStats,
  
  // Error handling utilities
  BaselineLintError,
  ParseError,
  ValidationError,
  FileError,
  handleError,
  formatError,
  
  // Validation utilities
  validateFilePath,
  validateFileExtension,
  validateBaselineLevel,
  validateOutputFormat,
  validateContentLength,
  validateOptions,
  validatePaths,
  sanitizeFilePath,
  sanitizeContent,
  VALIDATION_RULES,
  
  // LRU Cache utilities
  LRUCache,
  createLRUCache,
  bcdCache,
  featureCache,
  clearAllCaches,
  getAllCacheStats,
  
  // Configuration utilities
  loadConfig,
  createSampleConfig,
  getCommandConfig,
  DEFAULT_CONFIG,
  CONFIG_FILES,
  
  // File handling utilities
  readFileWithCleanup,
  writeFileWithCleanup,
  createReadStreamWithCleanup,
  createWriteStreamWithCleanup,
  copyFileWithCleanup,
  moveFileWithCleanup,
  deleteFileWithCleanup,
  ensureDirWithCleanup,
  getFileStatsWithCleanup,
  cleanupAllFileHandles,
  getActiveFileHandleCount,
  processFilesWithCleanup,
  createTempFile,
  cleanupTempFiles,
  getTempFileCount,
  FileHandleManager,
  TemporaryFileManager
};

/**
 * Convenience function to analyze mixed content
 * @param {string} content - CSS or JavaScript content
 * @param {string} type - 'css' or 'js'
 * @param {Object} options - Analysis options
 * @returns {Object} Analysis results
 */
export async function analyzeContent(content, type, options = {}) {
  if (type === 'css') {
    return analyzeCSSContent(content, options);
  } else if (type === 'js') {
    return analyzeJSContent(content, options);
  } else {
    throw new Error(`Unsupported content type: ${type}. Use 'css' or 'js'`);
  }
}

/**
 * Convenience function to analyze a file by extension
 * @param {string} filePath - Path to the file
 * @param {Object} options - Analysis options
 * @returns {Object} Analysis results
 */
export async function analyzeFile(filePath, options = {}) {
  const ext = filePath.toLowerCase().split('.').pop();
  
  if (['css'].includes(ext)) {
    return analyzeCSSFile(filePath, options);
  } else if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
    return analyzeJSFile(filePath, options);
  } else {
    throw new Error(`Unsupported file extension: ${ext}. Supported: css, js, jsx, ts, tsx`);
  }
}

/**
 * Get package version
 */
export const version = '1.0.2';

/**
 * Default configuration
 */
export const defaultConfig = {
  requiredLevel: 'low',
  format: 'text',
  noWarnings: false,
  failOnError: false
};
