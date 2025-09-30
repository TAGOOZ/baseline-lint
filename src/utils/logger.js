// src/utils/logger.js
// Comprehensive logging system with different levels and structured output

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Log levels in order of severity
 */
export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

/**
 * Log level names
 */
export const LogLevelNames = {
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.TRACE]: 'TRACE'
};

/**
 * Log output formats
 */
export const LogFormat = {
  TEXT: 'text',
  JSON: 'json',
  COMPACT: 'compact'
};

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG = {
  level: LogLevel.INFO,
  format: LogFormat.TEXT,
  output: 'console', // 'console', 'file', 'both'
  filePath: null,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  enableColors: true,
  enableTimestamps: true,
  enableCallerInfo: false,
  bufferSize: 1000,
  flushInterval: 5000 // 5 seconds
};

/**
 * ANSI color codes for console output
 */
const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  TRACE: '\x1b[90m', // Gray
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m'
};

/**
 * Main Logger class
 */
export class Logger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.buffer = [];
    this.flushTimer = null;
    this.fileHandle = null;
    this.isInitialized = false;
    
    this.initialize();
  }

  /**
   * Initialize the logger
   */
  async initialize() {
    if (this.isInitialized) return;

    // Setup file output if needed
    if (this.config.output === 'file' || this.config.output === 'both') {
      await this.setupFileOutput();
    }

    // Setup flush timer for buffered output
    if (this.config.bufferSize > 0) {
      this.setupFlushTimer();
    }

    this.isInitialized = true;
  }

  /**
   * Setup file output
   */
  async setupFileOutput() {
    if (!this.config.filePath) {
      // Default log file path
      const logDir = path.join(process.cwd(), 'logs');
      await fs.mkdir(logDir, { recursive: true });
      this.config.filePath = path.join(logDir, 'baseline-lint.log');
    }

    try {
      this.fileHandle = await fs.open(this.config.filePath, 'a');
    } catch (error) {
      console.error('Failed to open log file:', error.message);
      this.config.output = 'console';
    }
  }

  /**
   * Setup flush timer for buffered output
   */
  setupFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Log a message
   */
  log(level, message, meta = {}) {
    if (level > this.config.level) return;

    const logEntry = this.createLogEntry(level, message, meta);
    
    if (this.config.bufferSize > 0) {
      this.buffer.push(logEntry);
      
      if (this.buffer.length >= this.config.bufferSize) {
        this.flush();
      }
    } else {
      this.outputLogEntry(logEntry);
    }
  }

  /**
   * Create a log entry
   */
  createLogEntry(level, message, meta) {
    const timestamp = this.config.enableTimestamps ? new Date().toISOString() : null;
    const callerInfo = this.config.enableCallerInfo ? this.getCallerInfo() : null;

    return {
      timestamp,
      level: LogLevelNames[level],
      levelNum: level,
      message,
      meta,
      caller: callerInfo,
      pid: process.pid
    };
  }

  /**
   * Get caller information
   */
  getCallerInfo() {
    const stack = new Error().stack;
    const lines = stack.split('\n');
    
    // Skip the first few lines (Error, getCallerInfo, createLogEntry, log)
    const callerLine = lines[4];
    if (!callerLine) return null;

    // Extract file and line number
    const match = callerLine.match(/at.*\(([^:]+):(\d+):(\d+)\)/);
    if (match) {
      return {
        file: path.basename(match[1]),
        line: parseInt(match[2]),
        column: parseInt(match[3])
      };
    }

    return null;
  }

  /**
   * Output a log entry
   */
  outputLogEntry(entry) {
    const formatted = this.formatLogEntry(entry);
    
    if (this.config.output === 'console' || this.config.output === 'both') {
      this.outputToConsole(formatted, entry);
    }
    
    if ((this.config.output === 'file' || this.config.output === 'both') && this.fileHandle) {
      this.outputToFile(formatted);
    }
  }

  /**
   * Format a log entry
   */
  formatLogEntry(entry) {
    switch (this.config.format) {
      case LogFormat.JSON:
        return JSON.stringify(entry);
      case LogFormat.COMPACT:
        return this.formatCompact(entry);
      case LogFormat.TEXT:
      default:
        return this.formatText(entry);
    }
  }

  /**
   * Format text output
   */
  formatText(entry) {
    let output = '';
    
    if (entry.timestamp) {
      output += `[${entry.timestamp}] `;
    }
    
    output += `[${entry.level}] `;
    
    if (entry.caller) {
      output += `[${entry.caller.file}:${entry.caller.line}] `;
    }
    
    output += entry.message;
    
    if (Object.keys(entry.meta).length > 0) {
      output += ` ${JSON.stringify(entry.meta)}`;
    }
    
    return output;
  }

  /**
   * Format compact output
   */
  formatCompact(entry) {
    const time = entry.timestamp ? entry.timestamp.split('T')[1].split('.')[0] : '';
    const caller = entry.caller ? `${entry.caller.file}:${entry.caller.line}` : '';
    
    return `${time} ${entry.level} ${caller} ${entry.message}`;
  }

  /**
   * Output to console with colors
   */
  outputToConsole(formatted, entry) {
    if (this.config.enableColors) {
      const color = this.getColorForLevel(entry.levelNum);
      console.log(`${color}${formatted}${COLORS.RESET}`);
    } else {
      console.log(formatted);
    }
  }

  /**
   * Output to file
   */
  async outputToFile(formatted) {
    if (!this.fileHandle) return;

    try {
      await this.fileHandle.write(formatted + '\n');
      
      // Check file size and rotate if needed
      const stats = await this.fileHandle.stat();
      if (stats.size > this.config.maxFileSize) {
        await this.rotateLogFile();
      }
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Get color for log level
   */
  getColorForLevel(level) {
    switch (level) {
      case LogLevel.ERROR: return COLORS.ERROR;
      case LogLevel.WARN: return COLORS.WARN;
      case LogLevel.INFO: return COLORS.INFO;
      case LogLevel.DEBUG: return COLORS.DEBUG;
      case LogLevel.TRACE: return COLORS.TRACE;
      default: return COLORS.RESET;
    }
  }

  /**
   * Rotate log file
   */
  async rotateLogFile() {
    if (!this.fileHandle) return;

    try {
      await this.fileHandle.close();
      
      // Rotate existing log files
      for (let i = this.config.maxFiles - 1; i > 0; i--) {
        const oldFile = `${this.config.filePath}.${i}`;
        const newFile = `${this.config.filePath}.${i + 1}`;
        
        try {
          await fs.rename(oldFile, newFile);
        } catch (error) {
          // File might not exist, continue
        }
      }
      
      // Move current log to .1
      await fs.rename(this.config.filePath, `${this.config.filePath}.1`);
      
      // Create new log file
      this.fileHandle = await fs.open(this.config.filePath, 'w');
    } catch (error) {
      console.error('Failed to rotate log file:', error.message);
    }
  }

  /**
   * Flush buffered logs
   */
  flush() {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    entries.forEach(entry => {
      this.outputLogEntry(entry);
    });
  }

  /**
   * Convenience methods for different log levels
   */
  error(message, meta = {}) {
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.log(LogLevel.DEBUG, message, meta);
  }

  trace(message, meta = {}) {
    this.log(LogLevel.TRACE, message, meta);
  }

  /**
   * Create a child logger with additional context
   */
  child(context = {}) {
    const childLogger = new Logger(this.config);
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level, message, meta = {}) => {
      const mergedMeta = { ...context, ...meta };
      originalLog(level, message, mergedMeta);
    };
    
    return childLogger;
  }

  /**
   * Measure execution time
   */
  time(label) {
    const start = process.hrtime.bigint();
    
    return {
      end: (message = '') => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        
        this.debug(`${label} completed in ${duration.toFixed(2)}ms`, {
          duration,
          message
        });
        
        return duration;
      }
    };
  }

  /**
   * Cleanup resources
   */
  async close() {
    // Flush remaining logs
    this.flush();
    
    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Close file handle
    if (this.fileHandle) {
      await this.fileHandle.close();
      this.fileHandle = null;
    }
    
    this.isInitialized = false;
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create a logger with specific configuration
 */
export function createLogger(config = {}) {
  return new Logger(config);
}

/**
 * Create a logger for a specific module/component
 */
export function createModuleLogger(moduleName, config = {}) {
  return new Logger({
    ...config,
    enableCallerInfo: true
  }).child({ module: moduleName });
}

/**
 * Performance logger for timing operations
 */
export class PerformanceLogger {
  constructor(logger) {
    this.logger = logger;
    this.metrics = new Map();
  }

  start(label) {
    const start = process.hrtime.bigint();
    this.metrics.set(label, start);
    this.logger.debug(`Performance: Started ${label}`);
  }

  end(label, message = '') {
    const start = this.metrics.get(label);
    if (!start) {
      this.logger.warn(`Performance: No start time found for ${label}`);
      return null;
    }

    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    this.metrics.delete(label);
    
    this.logger.info(`Performance: ${label} completed in ${duration.toFixed(2)}ms`, {
      label,
      duration,
      message
    });
    
    return duration;
  }

  measure(label, fn) {
    return async (...args) => {
      this.start(label);
      try {
        const result = await fn(...args);
        this.end(label, 'success');
        return result;
      } catch (error) {
        this.end(label, `error: ${error.message}`);
        throw error;
      }
    };
  }
}

/**
 * Default performance logger
 */
export const performanceLogger = new PerformanceLogger(logger);

/**
 * Structured logging helpers
 */
export const logHelpers = {
  /**
   * Log file operation
   */
  fileOperation: (operation, filePath, meta = {}) => {
    logger.info(`File ${operation}: ${filePath}`, {
      operation,
      filePath,
      ...meta
    });
  },

  /**
   * Log parsing operation
   */
  parsing: (fileType, filePath, issues, meta = {}) => {
    logger.info(`Parsed ${fileType} file: ${filePath}`, {
      fileType,
      filePath,
      issuesCount: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      ...meta
    });
  },

  /**
   * Log baseline check
   */
  baselineCheck: (feature, status, meta = {}) => {
    logger.debug(`Baseline check: ${feature}`, {
      feature,
      status,
      ...meta
    });
  },

  /**
   * Log cache operation
   */
  cacheOperation: (operation, key, hit = null, meta = {}) => {
    logger.debug(`Cache ${operation}: ${key}`, {
      operation,
      key,
      hit,
      ...meta
    });
  }
};

/**
 * Export default logger for convenience
 */
export default logger;
