// TypeScript declarations for baseline-lint
export interface BaselineIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  feature: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface AnalysisResult {
  file: string;
  issues: BaselineIssue[];
  summary: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  };
  type: 'css' | 'js';
}

export interface BaselineScore {
  score: number;
  total: number;
  errors: number;
  warnings: number;
  breakdown: {
    css: number;
    js: number;
  };
}

export interface CLIOptions {
  level: 'widely' | 'newly';
  format: 'text' | 'json';
  noWarnings?: boolean;
  failOnError?: boolean;
  cssOnly?: boolean;
  jsOnly?: boolean;
  score?: boolean;
  batchSize?: number;
  config?: string;
}

// Main CLI function
export function check(paths: string[], options?: CLIOptions): Promise<AnalysisResult[]>;
export function score(paths: string[], options?: CLIOptions): Promise<BaselineScore>;
export function list(status: 'widely' | 'newly' | 'limited'): void;
export function search(query: string): void;
export function info(featureId: string): void;