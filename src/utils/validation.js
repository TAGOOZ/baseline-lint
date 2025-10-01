// src/utils/validation.js
// Input validation and sanitization utilities

import { ValidationError } from './error-handler.js';
import path from 'path';

/**
 * Validation rules and patterns
 */
export const VALIDATION_RULES = {
  // File extensions
  CSS_EXTENSIONS: ['.css'],
  JS_EXTENSIONS: ['.js', '.jsx', '.ts', '.tsx'],
  
  // Baseline levels
  BASELINE_LEVELS: ['low', 'high'],
  
  // Output formats
  OUTPUT_FORMATS: ['text', 'json'],
  
  // File path patterns
  SAFE_PATH_PATTERN: /^[a-zA-Z0-9._/-]+$/,
  
  // Maximum file size (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Maximum content length (50MB)
  MAX_CONTENT_LENGTH: 50 * 1024 * 1024
};

/**
 * Validate file path for security
 */
export function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw new ValidationError('File path must be a non-empty string', 'filePath', filePath);
  }
  
  // Check for path traversal attempts
  if (filePath.includes('..') || filePath.includes('~')) {
    throw new ValidationError('File path contains invalid characters', 'filePath', filePath);
  }
  
  // Check for absolute paths in certain contexts
  if (path.isAbsolute(filePath) && !filePath.startsWith(process.cwd())) {
    throw new ValidationError('File path must be relative to current directory', 'filePath', filePath);
  }
  
  // Check for safe characters only
  if (!VALIDATION_RULES.SAFE_PATH_PATTERN.test(filePath)) {
    throw new ValidationError('File path contains unsafe characters', 'filePath', filePath);
  }
  
  return true;
}

/**
 * Validate file extension
 */
export function validateFileExtension(filePath, allowedExtensions) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    throw new ValidationError(
      `File extension '${ext}' not allowed. Allowed: ${allowedExtensions.join(', ')}`,
      'extension',
      ext
    );
  }
  
  return true;
}

/**
 * Validate baseline level
 */
export function validateBaselineLevel(level) {
  const validLevels = [...VALIDATION_RULES.BASELINE_LEVELS, 'widely', 'newly'];
  if (!validLevels.includes(level)) {
    throw new ValidationError(
      `Invalid baseline level '${level}'. Must be one of: ${validLevels.join(', ')}`,
      'baselineLevel',
      level
    );
  }
  
  return true;
}

/**
 * Validate output format
 */
export function validateOutputFormat(format) {
  if (!VALIDATION_RULES.OUTPUT_FORMATS.includes(format)) {
    throw new ValidationError(
      `Invalid output format '${format}'. Must be one of: ${VALIDATION_RULES.OUTPUT_FORMATS.join(', ')}`,
      'outputFormat',
      format
    );
  }
  
  return true;
}

/**
 * Validate content length
 */
export function validateContentLength(content, maxLength = VALIDATION_RULES.MAX_CONTENT_LENGTH) {
  if (typeof content !== 'string') {
    throw new ValidationError('Content must be a string', 'content', typeof content);
  }
  
  if (content.length > maxLength) {
    throw new ValidationError(
      `Content too large: ${content.length} characters. Maximum: ${maxLength}`,
      'contentLength',
      content.length
    );
  }
  
  return true;
}

/**
 * Sanitize file path
 */
export function sanitizeFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }
  
  // Remove any path traversal attempts
  let sanitized = filePath.replace(/\.\./g, '').replace(/~/g, '');
  
  // Normalize path separators
  sanitized = sanitized.replace(/\\/g, '/');
  
  // Remove leading slashes for relative paths
  sanitized = sanitized.replace(/^\/+/, '');
  
  // Remove any null bytes or control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');
  
  return sanitized;
}

/**
 * Sanitize content
 */
export function sanitizeContent(content) {
  if (typeof content !== 'string') {
    return '';
  }
  
  // Remove null bytes
  let sanitized = content.replace(/\x00/g, '');
  
  // Limit length
  if (sanitized.length > VALIDATION_RULES.MAX_CONTENT_LENGTH) {
    sanitized = sanitized.substring(0, VALIDATION_RULES.MAX_CONTENT_LENGTH);
  }
  
  return sanitized;
}

/**
 * Validate options object
 */
export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new ValidationError('Options must be an object', 'options', typeof options);
  }
  
  const validatedOptions = {};
  
  // Validate requiredLevel or level
  if (options.requiredLevel !== undefined) {
    validateBaselineLevel(options.requiredLevel);
    validatedOptions.requiredLevel = options.requiredLevel;
  }
  
  if (options.level !== undefined) {
    validateBaselineLevel(options.level);
    validatedOptions.level = options.level;
  }
  
  // Validate format
  if (options.format !== undefined) {
    validateOutputFormat(options.format);
    validatedOptions.format = options.format;
  }
  
  // Validate boolean options
  if (options.noWarnings !== undefined) {
    if (typeof options.noWarnings !== 'boolean') {
      throw new ValidationError('noWarnings must be a boolean', 'noWarnings', typeof options.noWarnings);
    }
    validatedOptions.noWarnings = options.noWarnings;
  }
  
  if (options.failOnError !== undefined) {
    if (typeof options.failOnError !== 'boolean') {
      throw new ValidationError('failOnError must be a boolean', 'failOnError', typeof options.failOnError);
    }
    validatedOptions.failOnError = options.failOnError;
  }
  
  return validatedOptions;
}

/**
 * Validate paths array
 */
export function validatePaths(paths) {
  if (!Array.isArray(paths)) {
    throw new ValidationError('Paths must be an array', 'paths', typeof paths);
  }
  
  if (paths.length === 0) {
    throw new ValidationError('Paths array cannot be empty', 'paths', paths);
  }
  
  const validatedPaths = [];
  
  for (const path of paths) {
    if (typeof path !== 'string') {
      throw new ValidationError('Each path must be a string', 'path', typeof path);
    }
    
    const sanitizedPath = sanitizeFilePath(path);
    if (sanitizedPath) {
      validatedPaths.push(sanitizedPath);
    }
  }
  
  if (validatedPaths.length === 0) {
    throw new ValidationError('No valid paths provided', 'paths', paths);
  }
  
  return validatedPaths;
}

/**
 * Comprehensive validation for CLI commands
 */
export function validateCLIInput(command, args, options) {
  const validationErrors = [];
  
  try {
    // Validate command
    if (!command || typeof command !== 'string') {
      validationErrors.push('Command must be a non-empty string');
    }
    
    // Validate arguments based on command
    switch (command) {
      case 'check':
        if (args && args.length > 0) {
          validatePaths(args);
        }
        validateOptions(options);
        break;
        
      case 'list':
        if (!args || args.length !== 1) {
          validationErrors.push('List command requires exactly one status argument');
        } else if (!['widely', 'newly', 'limited'].includes(args[0])) {
          validationErrors.push('Status must be: widely, newly, or limited');
        }
        break;
        
      case 'search':
        if (!args || args.length !== 1 || typeof args[0] !== 'string') {
          validationErrors.push('Search command requires exactly one query string');
        }
        break;
        
      case 'info':
        if (!args || args.length !== 1 || typeof args[0] !== 'string') {
          validationErrors.push('Info command requires exactly one feature ID');
        }
        break;
        
      case 'score':
        if (args && args.length > 0) {
          validatePaths(args);
        }
        validateOptions(options);
        break;
    }
    
  } catch (error) {
    if (error instanceof ValidationError) {
      validationErrors.push(error.message);
    } else {
      validationErrors.push(`Validation error: ${error.message}`);
    }
  }
  
  if (validationErrors.length > 0) {
    throw new ValidationError(
      `CLI validation failed: ${validationErrors.join('; ')}`,
      'cliInput',
      { command, args, options }
    );
  }
  
  return true;
}
