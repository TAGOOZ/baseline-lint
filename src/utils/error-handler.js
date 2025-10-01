// src/utils/error-handler.js
// Enhanced error handling utilities

/**
 * Custom error classes for better error handling
 */
export class BaselineLintError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'BaselineLintError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaselineLintError);
    }
  }
}

export class ParseError extends BaselineLintError {
  constructor(message, file, line, column) {
    super(message, 'PARSE_ERROR', { file, line, column });
    this.name = 'ParseError';
  }
}

export class ValidationError extends BaselineLintError {
  constructor(message, field, value) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

export class FileError extends BaselineLintError {
  constructor(message, filePath, operation) {
    super(message, 'FILE_ERROR', { filePath, operation });
    this.name = 'FileError';
  }
}

/**
 * Enhanced error handler with stack trace preservation
 */
export function handleError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    name: error.name,
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
    context: {
      ...context,
      ...(error.context || {})
    }
  };

  // Preserve stack trace if available
  if (error.stack) {
    errorInfo.stack = error.stack;
  }

  // Add additional context based on error type
  if (error instanceof ParseError) {
    errorInfo.type = 'parse';
    errorInfo.location = {
      file: error.context.file,
      line: error.context.line,
      column: error.context.column
    };
  } else if (error instanceof ValidationError) {
    errorInfo.type = 'validation';
    errorInfo.field = error.context.field;
    errorInfo.value = error.context.value;
  } else if (error instanceof FileError) {
    errorInfo.type = 'file';
    errorInfo.filePath = error.context.filePath;
    errorInfo.operation = error.context.operation;
  }

  return errorInfo;
}

/**
 * Safe async wrapper that preserves stack traces
 */
export function safeAsync(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorInfo = handleError(error, context);
      throw new BaselineLintError(
        errorInfo.message,
        errorInfo.code,
        errorInfo.context
      );
    }
  };
}

/**
 * Safe sync wrapper that preserves stack traces
 */
export function safeSync(fn, context = {}) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      const errorInfo = handleError(error, context);
      throw new BaselineLintError(
        errorInfo.message,
        errorInfo.code,
        errorInfo.context
      );
    }
  };
}

/**
 * Format error for display
 */
export function formatError(error) {
  if (error instanceof BaselineLintError) {
    let output = `${error.name}: ${error.message}`;
    
    if (error.context.file) {
      output += `\n  File: ${error.context.file}`;
    }
    
    if (error.context.line) {
      output += `\n  Line: ${error.context.line}`;
      if (error.context.column) {
        output += `, Column: ${error.context.column}`;
      }
    }
    
    if (error.stack && process.env.NODE_ENV === 'development') {
      output += `\n\nStack trace:\n${error.stack}`;
    }
    
    return output;
  }
  
  return `${error.name}: ${error.message}`;
}
