// src/utils/file-handler.js
// File handling utilities with proper cleanup

import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { FileError, handleError } from './error-handler.js';

/**
 * File handle manager for proper cleanup
 */
class FileHandleManager {
  constructor() {
    this.handles = new Set();
    this.streams = new Set();
  }

  /**
   * Register a file handle for cleanup
   */
  registerHandle(handle) {
    this.handles.add(handle);
    return handle;
  }

  /**
   * Register a stream for cleanup
   */
  registerStream(stream) {
    this.streams.add(stream);
    return stream;
  }

  /**
   * Close all registered handles and streams
   */
  async cleanup() {
    const cleanupPromises = [];

    // Close all file handles
    for (const handle of this.handles) {
      if (handle && typeof handle.close === 'function') {
        cleanupPromises.push(
          handle.close().catch(error => {
            console.warn('Warning: Failed to close file handle:', error.message);
          })
        );
      }
    }

    // Close all streams
    for (const stream of this.streams) {
      if (stream && typeof stream.close === 'function') {
        cleanupPromises.push(
          new Promise((resolve) => {
            stream.close((error) => {
              if (error) {
                console.warn('Warning: Failed to close stream:', error.message);
              }
              resolve();
            });
          })
        );
      } else if (stream && typeof stream.destroy === 'function') {
        stream.destroy();
      }
    }

    await Promise.allSettled(cleanupPromises);
    
    // Clear the sets
    this.handles.clear();
    this.streams.clear();
  }

  /**
   * Get the number of active handles and streams
   */
  getActiveCount() {
    return this.handles.size + this.streams.size;
  }
}

/**
 * Global file handle manager instance
 */
const globalFileManager = new FileHandleManager();

/**
 * Read file with proper handle management
 */
export async function readFileWithCleanup(filePath, options = {}) {
  const { encoding = 'utf-8', maxSize = 50 * 1024 * 1024 } = options;
  
  try {
    // Check file size first
    const stats = await fs.stat(filePath);
    if (stats.size > maxSize) {
      throw new FileError(
        `File too large: ${stats.size} bytes (max: ${maxSize} bytes)`,
        filePath,
        'read'
      );
    }

    // Open file handle
    const handle = await fs.open(filePath, 'r');
    globalFileManager.registerHandle(handle);

    try {
      // Read file content
      const content = await handle.readFile({ encoding });
      return content;
    } finally {
      // Always close the handle
      await handle.close();
      globalFileManager.handles.delete(handle);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new FileError(`File not found: ${filePath}`, filePath, 'read');
    } else if (error.code === 'EACCES') {
      throw new FileError(`Permission denied: ${filePath}`, filePath, 'read');
    } else if (error instanceof FileError) {
      throw error;
    } else {
      throw new FileError(`Failed to read file: ${error.message}`, filePath, 'read');
    }
  }
}

/**
 * Write file with proper handle management
 */
export async function writeFileWithCleanup(filePath, content, options = {}) {
  const { encoding = 'utf-8', mode = 0o644 } = options;
  
  try {
    // Open file handle
    const handle = await fs.open(filePath, 'w', mode);
    globalFileManager.registerHandle(handle);

    try {
      // Write file content
      await handle.writeFile(content, { encoding });
    } finally {
      // Always close the handle
      await handle.close();
      globalFileManager.handles.delete(handle);
    }
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new FileError(`Permission denied: ${filePath}`, filePath, 'write');
    } else if (error.code === 'ENOSPC') {
      throw new FileError(`No space left on device: ${filePath}`, filePath, 'write');
    } else {
      throw new FileError(`Failed to write file: ${error.message}`, filePath, 'write');
    }
  }
}

/**
 * Create read stream with proper cleanup
 */
export function createReadStreamWithCleanup(filePath, options = {}) {
  try {
    const stream = createReadStream(filePath, options);
    globalFileManager.registerStream(stream);
    
    // Handle stream errors
    stream.on('error', (error) => {
      console.warn(`Read stream error for ${filePath}:`, error.message);
    });
    
    return stream;
  } catch (error) {
    throw new FileError(`Failed to create read stream: ${error.message}`, filePath, 'read');
  }
}

/**
 * Create write stream with proper cleanup
 */
export function createWriteStreamWithCleanup(filePath, options = {}) {
  try {
    const stream = createWriteStream(filePath, options);
    globalFileManager.registerStream(stream);
    
    // Handle stream errors
    stream.on('error', (error) => {
      console.warn(`Write stream error for ${filePath}:`, error.message);
    });
    
    return stream;
  } catch (error) {
    throw new FileError(`Failed to create write stream: ${error.message}`, filePath, 'write');
  }
}

/**
 * Copy file with proper handle management
 */
export async function copyFileWithCleanup(srcPath, destPath, options = {}) {
  const { preserveTimestamps = true } = options;
  
  try {
    // Read source file
    const content = await readFileWithCleanup(srcPath);
    
    // Write destination file
    await writeFileWithCleanup(destPath, content);
    
    // Preserve timestamps if requested
    if (preserveTimestamps) {
      const stats = await fs.stat(srcPath);
      await fs.utimes(destPath, stats.atime, stats.mtime);
    }
  } catch (error) {
    throw new FileError(`Failed to copy file: ${error.message}`, srcPath, 'copy');
  }
}

/**
 * Move file with proper handle management
 */
export async function moveFileWithCleanup(srcPath, destPath, options = {}) {
  try {
    // Try atomic rename first
    try {
      await fs.rename(srcPath, destPath);
      return;
    } catch (error) {
      // If rename fails (e.g., cross-device), fall back to copy + delete
      if (error.code === 'EXDEV') {
        await copyFileWithCleanup(srcPath, destPath, options);
        await fs.unlink(srcPath);
      } else {
        throw error;
      }
    }
  } catch (error) {
    throw new FileError(`Failed to move file: ${error.message}`, srcPath, 'move');
  }
}

/**
 * Delete file with proper error handling
 */
export async function deleteFileWithCleanup(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, that's okay
      return;
    } else if (error.code === 'EACCES') {
      throw new FileError(`Permission denied: ${filePath}`, filePath, 'delete');
    } else {
      throw new FileError(`Failed to delete file: ${error.message}`, filePath, 'delete');
    }
  }
}

/**
 * Ensure directory exists with proper error handling
 */
export async function ensureDirWithCleanup(dirPath, options = {}) {
  const { mode = 0o755, recursive = true } = options;
  
  try {
    await fs.mkdir(dirPath, { mode, recursive });
  } catch (error) {
    if (error.code === 'EEXIST') {
      // Directory already exists, that's okay
      return;
    } else if (error.code === 'EACCES') {
      throw new FileError(`Permission denied: ${dirPath}`, dirPath, 'mkdir');
    } else {
      throw new FileError(`Failed to create directory: ${error.message}`, dirPath, 'mkdir');
    }
  }
}

/**
 * Get file stats with proper error handling
 */
export async function getFileStatsWithCleanup(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new FileError(`File not found: ${filePath}`, filePath, 'stat');
    } else if (error.code === 'EACCES') {
      throw new FileError(`Permission denied: ${filePath}`, filePath, 'stat');
    } else {
      throw new FileError(`Failed to get file stats: ${error.message}`, filePath, 'stat');
    }
  }
}

/**
 * Cleanup all file handles and streams
 */
export async function cleanupAllFileHandles() {
  await globalFileManager.cleanup();
}

/**
 * Get the number of active file handles and streams
 */
export function getActiveFileHandleCount() {
  return globalFileManager.getActiveCount();
}

/**
 * Process multiple files with proper cleanup
 */
export async function processFilesWithCleanup(filePaths, processor, options = {}) {
  const { concurrency = 10, timeout = 30000 } = options;
  const results = [];
  const errors = [];
  
  // Process files in batches to avoid overwhelming the system
  for (let i = 0; i < filePaths.length; i += concurrency) {
    const batch = filePaths.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (filePath) => {
      try {
        // Set timeout for each file processing
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout processing ${filePath}`)), timeout);
        });
        
        const processPromise = processor(filePath);
        const result = await Promise.race([processPromise, timeoutPromise]);
        
        results.push({ filePath, result, success: true });
      } catch (error) {
        errors.push({ filePath, error, success: false });
      }
    });
    
    await Promise.allSettled(batchPromises);
  }
  
  return { results, errors };
}

/**
 * Temporary file manager
 */
class TemporaryFileManager {
  constructor() {
    this.tempFiles = new Set();
  }

  /**
   * Create a temporary file
   */
  async createTempFile(content = '', options = {}) {
    const { prefix = 'baseline-lint-', suffix = '.tmp', dir = process.cwd() } = options;
    
    const tempPath = `${dir}/${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}${suffix}`;
    
    await writeFileWithCleanup(tempPath, content);
    this.tempFiles.add(tempPath);
    
    return tempPath;
  }

  /**
   * Cleanup all temporary files
   */
  async cleanup() {
    const cleanupPromises = Array.from(this.tempFiles).map(async (tempPath) => {
      try {
        await deleteFileWithCleanup(tempPath);
      } catch (error) {
        console.warn(`Warning: Failed to delete temporary file ${tempPath}:`, error.message);
      }
    });
    
    await Promise.allSettled(cleanupPromises);
    this.tempFiles.clear();
  }

  /**
   * Get the number of temporary files
   */
  getTempFileCount() {
    return this.tempFiles.size;
  }
}

/**
 * Global temporary file manager
 */
const globalTempManager = new TemporaryFileManager();

/**
 * Create temporary file
 */
export async function createTempFile(content = '', options = {}) {
  return globalTempManager.createTempFile(content, options);
}

/**
 * Cleanup all temporary files
 */
export async function cleanupTempFiles() {
  await globalTempManager.cleanup();
}

/**
 * Get temporary file count
 */
export function getTempFileCount() {
  return globalTempManager.getTempFileCount();
}

/**
 * Setup process cleanup handlers (only if not already setup)
 */
let processHandlersSetup = false;

export function setupProcessHandlers() {
  if (processHandlersSetup) return;
  processHandlersSetup = true;

  process.on('exit', () => {
    // Synchronous cleanup for process exit
    globalFileManager.cleanup().catch(() => {});
    globalTempManager.cleanup().catch(() => {});
  });

  process.on('SIGINT', async () => {
    // Cleanup on Ctrl+C
    await cleanupAllFileHandles();
    await cleanupTempFiles();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    // Cleanup on termination
    await cleanupAllFileHandles();
    await cleanupTempFiles();
    process.exit(0);
  });
}

/**
 * Remove process cleanup handlers
 */
export function removeProcessHandlers() {
  if (!processHandlersSetup) return;
  process.removeAllListeners('exit');
  process.removeAllListeners('SIGINT');
  process.removeAllListeners('SIGTERM');
  processHandlersSetup = false;
}

/**
 * Export utilities
 */
export {
  FileHandleManager,
  TemporaryFileManager,
  globalFileManager,
  globalTempManager
};
