// src/config/config.js
// Configuration management for baseline-lint

import fs from 'fs/promises';
import path from 'path';
import { ValidationError } from '../utils/error-handler.js';

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
  // Baseline level requirements
  requiredLevel: 'low', // 'low' (newly) or 'high' (widely)
  
  // Output formatting
  format: 'text', // 'text', 'json', 'markdown'
  
  // Filtering options
  noWarnings: false,
  failOnError: false,
  
  // File processing
  cssOnly: false,
  jsOnly: false,
  
  // Cache settings
  cache: {
    enabled: true,
    bcdCacheSize: 5000,
    featureCacheSize: 1000,
    ttl: 3600000 // 1 hour in milliseconds
  },
  
  // File patterns
  patterns: {
    css: ['**/*.css'],
    js: ['**/*.{js,jsx,ts,tsx}'],
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']
  },
  
  // Analysis options
  analysis: {
    includeComments: false,
    strictMode: false,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    timeout: 30000 // 30 seconds
  },
  
  // Dashboard settings
  dashboard: {
    port: 3000,
    host: 'localhost',
    cors: {
      enabled: true,
      origins: ['http://localhost:3000', 'http://127.0.0.1:3000']
    },
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000 // 1 minute
    }
  },
  
  // CI/CD settings
  ci: {
    commentOnPR: true,
    failOnError: true,
    reportFormat: 'markdown'
  }
};

/**
 * Configuration file names to look for
 */
const CONFIG_FILES = [
  'baseline-lint.json',
  'baseline-lint.config.js',
  '.baseline-lintrc',
  '.baseline-lintrc.json',
  'package.json'
];

/**
 * Load configuration from file
 */
export async function loadConfig(configPath = null) {
  let config = { ...DEFAULT_CONFIG };
  
  if (configPath) {
    // Load from specific path
    try {
      const fileConfig = await loadConfigFile(configPath);
      config = mergeConfigs(config, fileConfig);
    } catch (error) {
      throw new ValidationError(`Failed to load config from ${configPath}: ${error.message}`);
    }
  } else {
    // Auto-discover config file
    const discoveredConfig = await discoverConfig();
    if (discoveredConfig) {
      config = mergeConfigs(config, discoveredConfig);
    }
  }
  
  // Validate configuration
  validateConfig(config);
  
  return config;
}

/**
 * Load configuration from a specific file
 */
async function loadConfigFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.js') {
    // Dynamic import for .js config files
    const configModule = await import(path.resolve(filePath));
    return configModule.default || configModule;
  } else if (ext === '.json' || filePath.endsWith('.baseline-lintrc')) {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } else {
    throw new ValidationError(`Unsupported config file format: ${ext}`);
  }
}

/**
 * Auto-discover configuration file
 */
async function discoverConfig() {
  const cwd = process.cwd();
  
  for (const configFile of CONFIG_FILES) {
    const configPath = path.join(cwd, configFile);
    
    try {
      await fs.access(configPath);
      
      if (configFile === 'package.json') {
        // Extract baseline-lint config from package.json
        const pkg = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        return pkg['baseline-lint'] || null;
      } else {
        return await loadConfigFile(configPath);
      }
    } catch (error) {
      // File doesn't exist, continue
      continue;
    }
  }
  
  return null;
}

/**
 * Merge two configuration objects
 */
function mergeConfigs(base, override) {
  const merged = { ...base };
  
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      merged[key] = mergeConfigs(merged[key] || {}, value);
    } else {
      merged[key] = value;
    }
  }
  
  return merged;
}

/**
 * Validate configuration
 */
function validateConfig(config) {
  // Validate required level
  if (!['low', 'high'].includes(config.requiredLevel)) {
    throw new ValidationError('requiredLevel must be "low" or "high"');
  }
  
  // Validate format
  if (!['text', 'json', 'markdown'].includes(config.format)) {
    throw new ValidationError('format must be "text", "json", or "markdown"');
  }
  
  // Validate cache settings
  if (config.cache.enabled && typeof config.cache.bcdCacheSize !== 'number') {
    throw new ValidationError('cache.bcdCacheSize must be a number');
  }
  
  if (config.cache.enabled && typeof config.cache.featureCacheSize !== 'number') {
    throw new ValidationError('cache.featureCacheSize must be a number');
  }
  
  // Validate analysis settings
  if (config.analysis.maxFileSize <= 0) {
    throw new ValidationError('analysis.maxFileSize must be positive');
  }
  
  if (config.analysis.timeout <= 0) {
    throw new ValidationError('analysis.timeout must be positive');
  }
  
  // Validate dashboard settings
  if (config.dashboard.port < 1 || config.dashboard.port > 65535) {
    throw new ValidationError('dashboard.port must be between 1 and 65535');
  }
  
  if (config.dashboard.rateLimit.enabled && config.dashboard.rateLimit.maxRequests <= 0) {
    throw new ValidationError('dashboard.rateLimit.maxRequests must be positive');
  }
}

/**
 * Create a sample configuration file
 */
export async function createSampleConfig(filePath = 'baseline-lint.json') {
  const sampleConfig = {
    "$schema": "https://raw.githubusercontent.com/yourusername/baseline-lint/main/schema.json",
    "requiredLevel": "low",
    "format": "text",
    "noWarnings": false,
    "failOnError": false,
    "cssOnly": false,
    "jsOnly": false,
    "cache": {
      "enabled": true,
      "bcdCacheSize": 5000,
      "featureCacheSize": 1000
    },
    "patterns": {
      "css": ["**/*.css"],
      "js": ["**/*.{js,jsx,ts,tsx}"],
      "ignore": ["**/node_modules/**", "**/dist/**", "**/build/**"]
    },
    "analysis": {
      "includeComments": false,
      "strictMode": false,
      "maxFileSize": 52428800,
      "timeout": 30000
    },
    "dashboard": {
      "port": 3000,
      "host": "localhost",
      "cors": {
        "enabled": true,
        "origins": ["http://localhost:3000"]
      },
      "rateLimit": {
        "enabled": true,
        "maxRequests": 100,
        "windowMs": 60000
      }
    },
    "ci": {
      "commentOnPR": true,
      "failOnError": true,
      "reportFormat": "markdown"
    }
  };
  
  await fs.writeFile(filePath, JSON.stringify(sampleConfig, null, 2));
  return filePath;
}

/**
 * Get configuration for specific command
 */
export function getCommandConfig(command, options = {}) {
  const config = { ...DEFAULT_CONFIG };
  
  // Override with command-specific options
  if (options.level) {
    config.requiredLevel = options.level === 'widely' ? 'high' : 'low';
  }
  
  if (options.format) {
    config.format = options.format;
  }
  
  if (options.noWarnings) {
    config.noWarnings = true;
  }
  
  if (options.failOnError) {
    config.failOnError = true;
  }
  
  if (options.cssOnly) {
    config.cssOnly = true;
  }
  
  if (options.jsOnly) {
    config.jsOnly = true;
  }
  
  return config;
}

/**
 * Export configuration utilities
 */
export {
  CONFIG_FILES,
  DEFAULT_CONFIG as defaultConfig
};
