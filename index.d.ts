// TypeScript definitions for baseline-lint
// Generated for version 1.0.0

declare module 'baseline-lint' {
  // ============================================================================
  // Core Types
  // ============================================================================

  export type BaselineLevel = 'low' | 'high';
  export type BaselineStatus = 'widely-available' | 'newly-available' | 'limited';
  export type OutputFormat = 'text' | 'json' | 'markdown';
  export type FileType = 'css' | 'js' | 'jsx' | 'ts' | 'tsx';

  export interface BaselineFeature {
    id: string;
    name: string;
    status: BaselineStatus;
    level: BaselineLevel;
    since?: string;
    support: Record<string, string>;
    description?: string;
    group?: string;
  }

  export interface Issue {
    level: 'error' | 'warning' | 'info';
    message: string;
    file: string;
    line: number;
    column: number;
    feature: string;
    status: BaselineStatus;
    suggestion?: string;
  }

  export interface AnalysisResult {
    issues: Issue[];
    score: number;
    totalFeatures: number;
    compatibleFeatures: number;
    incompatibleFeatures: number;
    warnings: number;
    errors: number;
    duration: number;
    fileCount: number;
  }

  // ============================================================================
  // Configuration Types
  // ============================================================================

  export interface CacheConfig {
    enabled: boolean;
    bcdCacheSize: number;
    featureCacheSize: number;
    ttl: number;
  }

  export interface PatternsConfig {
    css: string[];
    js: string[];
    ignore: string[];
  }

  export interface AnalysisConfig {
    includeComments: boolean;
    strictMode: boolean;
    maxFileSize: number;
    timeout: number;
  }

  export interface CorsConfig {
    enabled: boolean;
    origins: string[];
  }

  export interface RateLimitConfig {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  }

  export interface DashboardConfig {
    port: number;
    host: string;
    cors: CorsConfig;
    rateLimit: RateLimitConfig;
  }

  export interface CIConfig {
    commentOnPR: boolean;
    failOnError: boolean;
    reportFormat: OutputFormat;
  }

  export interface BaselineLintConfig {
    requiredLevel: BaselineLevel;
    format: OutputFormat;
    noWarnings: boolean;
    failOnError: boolean;
    cssOnly: boolean;
    jsOnly: boolean;
    cache: CacheConfig;
    patterns: PatternsConfig;
    analysis: AnalysisConfig;
    dashboard: DashboardConfig;
    ci: CIConfig;
  }

  export const DEFAULT_CONFIG: BaselineLintConfig;
  export const CONFIG_FILES: string[];

  // ============================================================================
  // Error Types
  // ============================================================================

  export class BaselineLintError extends Error {
    constructor(message: string, code?: string, details?: any);
    code?: string;
    details?: any;
    timestamp: Date;
  }

  export class ParseError extends BaselineLintError {
    constructor(message: string, file?: string, line?: number, column?: number);
    file?: string;
    line?: number;
    column?: number;
  }

  export class ValidationError extends BaselineLintError {
    constructor(message: string, field?: string, value?: any);
    field?: string;
    value?: any;
  }

  export class FileError extends BaselineLintError {
    constructor(message: string, file?: string, operation?: string);
    file?: string;
    operation?: string;
  }

  // ============================================================================
  // Validation Types
  // ============================================================================

  export interface ValidationRule {
    required?: boolean;
    type?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  }

  export interface ValidationRules {
    [key: string]: ValidationRule;
  }

  export const VALIDATION_RULES: ValidationRules;

  // ============================================================================
  // Cache Types
  // ============================================================================

  export interface CacheStats {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    maxSize: number;
  }

  export interface LRUCacheOptions {
    maxSize: number;
    ttl?: number;
  }

  export class LRUCache<K, V> {
    constructor(options: LRUCacheOptions);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    getStats(): CacheStats;
    size(): number;
    maxSize(): number;
  }

  export function createLRUCache<K, V>(maxSize: number, ttl?: number): LRUCache<K, V>;

  export const bcdCache: LRUCache<string, any>;
  export const featureCache: LRUCache<string, BaselineFeature>;

  export function clearAllCaches(): void;
  export function getAllCacheStats(): Record<string, CacheStats>;

  // ============================================================================
  // File Handling Types
  // ============================================================================

  export interface FileOptions {
    encoding?: BufferEncoding;
    maxSize?: number;
    timeout?: number;
  }

  export interface StreamOptions extends FileOptions {
    highWaterMark?: number;
    autoClose?: boolean;
  }

  export interface FileStats {
    size: number;
    mtime: Date;
    atime: Date;
    ctime: Date;
    mode: number;
    isFile(): boolean;
    isDirectory(): boolean;
  }

  export class FileHandleManager {
    constructor();
    addHandle(handle: any): void;
    removeHandle(handle: any): void;
    closeAll(): Promise<void>;
    getCount(): number;
  }

  export class TemporaryFileManager {
    constructor();
    createTempFile(content: string, options?: FileOptions): Promise<string>;
    deleteTempFile(path: string): Promise<void>;
    cleanupAll(): Promise<void>;
    getCount(): number;
  }

  // ============================================================================
  // Performance Types
  // ============================================================================

  export interface PerformanceMetrics {
    operations: Record<string, OperationMetrics>;
    memory: MemoryMetrics;
    timers: Record<string, TimerMetrics>;
  }

  export interface OperationMetrics {
    count: number;
    totalDuration: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    successCount: number;
    errorCount: number;
  }

  export interface MemoryMetrics {
    used: number;
    total: number;
    external: number;
    arrayBuffers: number;
  }

  export interface TimerMetrics {
    startTime: number;
    endTime?: number;
    duration?: number;
    label: string;
  }

  // ============================================================================
  // Main API Functions
  // ============================================================================

  // CSS Analysis
  export function analyzeCSSContent(
    content: string,
    options?: Partial<BaselineLintConfig>
  ): Promise<AnalysisResult>;

  export function analyzeCSSFile(
    filePath: string,
    options?: Partial<BaselineLintConfig>
  ): Promise<AnalysisResult>;

  export function formatIssues(
    issues: Issue[],
    format?: OutputFormat
  ): string;

  // JavaScript Analysis
  export function analyzeJSContent(
    content: string,
    options?: Partial<BaselineLintConfig>
  ): Promise<AnalysisResult>;

  export function analyzeJSFile(
    filePath: string,
    options?: Partial<BaselineLintConfig>
  ): Promise<AnalysisResult>;

  export function formatJSIssues(
    issues: Issue[],
    format?: OutputFormat
  ): string;

  // Core checking functions
  export function getFeatureStatus(
    featureId: string,
    level?: BaselineLevel
  ): Promise<BaselineFeature>;

  export function getFeaturesByStatus(
    status: BaselineStatus,
    group?: string
  ): Promise<BaselineFeature[]>;

  export function getFeaturesByGroup(
    group: string,
    status?: BaselineStatus
  ): Promise<BaselineFeature[]>;

  export function searchFeatures(
    query: string,
    group?: string
  ): Promise<BaselineFeature[]>;

  export function checkCSSPropertyValue(
    property: string,
    value: string,
    level?: BaselineLevel
  ): Promise<{ compatible: boolean; status: BaselineStatus; feature: BaselineFeature }>;

  export function checkJavaScriptAPI(
    api: string,
    level?: BaselineLevel
  ): Promise<{ compatible: boolean; status: BaselineStatus; feature: BaselineFeature }>;

  export function generateReport(
    results: AnalysisResult[],
    format?: OutputFormat
  ): string;

  export function calculateScore(
    results: AnalysisResult[]
  ): number;

  export function meetsBaselineLevel(
    status: BaselineStatus,
    level: BaselineLevel
  ): boolean;

  export function clearCache(): void;
  export function getCacheStats(): Record<string, CacheStats>;

  // Error handling utilities
  export function handleError(
    error: Error,
    context?: any
  ): BaselineLintError;

  export function formatError(
    error: Error,
    format?: OutputFormat
  ): string;

  // Validation utilities
  export function validateFilePath(
    filePath: string
  ): { valid: boolean; error?: string };

  export function validateFileExtension(
    filePath: string,
    allowedExtensions?: string[]
  ): { valid: boolean; error?: string };

  export function validateBaselineLevel(
    level: string
  ): { valid: boolean; error?: string };

  export function validateOutputFormat(
    format: string
  ): { valid: boolean; error?: string };

  export function validateContentLength(
    content: string,
    maxLength?: number
  ): { valid: boolean; error?: string };

  export function validateOptions(
    options: any,
    rules?: ValidationRules
  ): { valid: boolean; errors: string[] };

  export function validatePaths(
    paths: string[]
  ): { valid: boolean; errors: string[] };

  export function sanitizeFilePath(
    filePath: string
  ): string;

  export function sanitizeContent(
    content: string
  ): string;

  // Configuration utilities
  export function loadConfig(
    configPath?: string
  ): Promise<BaselineLintConfig>;

  export function createSampleConfig(
    outputPath?: string
  ): Promise<string>;

  export function getCommandConfig(
    args: string[]
  ): Partial<BaselineLintConfig>;

  // File handling utilities
  export function readFileWithCleanup(
    filePath: string,
    options?: FileOptions
  ): Promise<string>;

  export function writeFileWithCleanup(
    filePath: string,
    content: string,
    options?: FileOptions
  ): Promise<void>;

  export function createReadStreamWithCleanup(
    filePath: string,
    options?: StreamOptions
  ): Promise<NodeJS.ReadableStream>;

  export function createWriteStreamWithCleanup(
    filePath: string,
    options?: StreamOptions
  ): Promise<NodeJS.WritableStream>;

  export function copyFileWithCleanup(
    src: string,
    dest: string,
    options?: FileOptions
  ): Promise<void>;

  export function moveFileWithCleanup(
    src: string,
    dest: string,
    options?: FileOptions
  ): Promise<void>;

  export function deleteFileWithCleanup(
    filePath: string
  ): Promise<void>;

  export function ensureDirWithCleanup(
    dirPath: string
  ): Promise<void>;

  export function getFileStatsWithCleanup(
    filePath: string
  ): Promise<FileStats>;

  export function cleanupAllFileHandles(): Promise<void>;
  export function getActiveFileHandleCount(): number;

  export function processFilesWithCleanup(
    filePaths: string[],
    processor: (filePath: string, content: string) => Promise<any>,
    options?: FileOptions
  ): Promise<any[]>;

  export function createTempFile(
    content: string,
    options?: FileOptions
  ): Promise<string>;

  export function cleanupTempFiles(): Promise<void>;
  export function getTempFileCount(): number;

  // Convenience functions
  export function analyzeContent(
    content: string,
    type: FileType,
    options?: Partial<BaselineLintConfig>
  ): Promise<AnalysisResult>;

  export function analyzeFile(
    filePath: string,
    options?: Partial<BaselineLintConfig>
  ): Promise<AnalysisResult>;

  // Package information
  export const version: string;
  export const defaultConfig: Partial<BaselineLintConfig>;
}

// CLI types for bin/cli.js
declare module 'baseline-lint/bin/cli' {
  import { BaselineLintConfig } from 'baseline-lint';

  export interface CLIOptions {
    level?: 'low' | 'high';
    format?: 'text' | 'json' | 'markdown';
    noWarnings?: boolean;
    failOnError?: boolean;
    cssOnly?: boolean;
    jsOnly?: boolean;
    config?: string;
    help?: boolean;
    version?: boolean;
    verbose?: boolean;
    quiet?: boolean;
  }

  export interface CLICommand {
    name: string;
    description: string;
    options: CLIOptions;
    action: (args: string[], options: CLIOptions) => Promise<void>;
  }

  export function createCLI(): CLICommand[];
  export function runCLI(args: string[]): Promise<void>;
}

// Dashboard types
declare module 'baseline-lint/dashboard' {
  import { AnalysisResult, BaselineLintConfig } from 'baseline-lint';

  export interface DashboardServer {
    start(port?: number, host?: string): Promise<void>;
    stop(): Promise<void>;
    getResults(): AnalysisResult[];
    updateResults(results: AnalysisResult[]): void;
  }

  export function createDashboard(
    config?: Partial<BaselineLintConfig>
  ): DashboardServer;
}

// Global declarations for Node.js
declare global {
  namespace NodeJS {
    interface Process {
      baselineLint?: {
        fileHandles: number;
        tempFiles: number;
        cacheStats: Record<string, any>;
      };
    }
  }
}

export = baselineLint;
export as namespace baselineLint;
