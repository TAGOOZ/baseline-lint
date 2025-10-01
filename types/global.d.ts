// Global type definitions for baseline-lint

declare global {
  // Extend Node.js Process interface
  namespace NodeJS {
    interface Process {
      baselineLint?: {
        fileHandles: number;
        tempFiles: number;
        cacheStats: Record<string, any>;
        startTime: number;
        config?: any;
      };
    }

    interface ProcessEnv {
      BASELINE_LINT_CONFIG?: string;
      BASELINE_LINT_CACHE_DIR?: string;
      BASELINE_LINT_DEBUG?: string;
      BASELINE_LINT_LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    }
  }

  // Global error handling
  interface Error {
    code?: string;
    details?: any;
    timestamp?: Date;
    file?: string;
    line?: number;
    column?: number;
    operation?: string;
    field?: string;
    value?: any;
  }

  // Performance monitoring
  interface PerformanceEntry {
    name: string;
    entryType: string;
    startTime: number;
    duration: number;
    detail?: any;
  }

  // File system extensions
  interface FileSystemStats {
    size: number;
    mtime: Date;
    atime: Date;
    ctime: Date;
    mode: number;
    isFile(): boolean;
    isDirectory(): boolean;
  }

  // Cache interface
  interface CacheInterface<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size(): number;
  }

  // CLI command interface
  interface CLICommand {
    name: string;
    description: string;
    options: Record<string, any>;
    action: (args: string[], options: any) => Promise<void>;
  }

  // Configuration schema
  interface ConfigSchema {
    type: string;
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  }
}

// Export empty object to make this a module
export {};
