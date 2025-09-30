// src/utils/performance.js
// Performance monitoring and metrics collection system

import { logger } from './logger.js';
import fs from 'fs/promises';
import path from 'path';
import { isTestEnvironment } from './test-helpers.js';

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this.startTime = process.hrtime.bigint();
  }

  /**
   * Start timing an operation
   */
  startTimer(name, labels = {}) {
    // Skip timing in test environment to prevent interference
    if (isTestEnvironment()) {
      return;
    }
    
    const key = this.createKey(name, labels);
    this.timers.set(key, {
      start: process.hrtime.bigint(),
      labels,
      name
    });
    logger.debug(`Started timer: ${name}`, labels);
  }

  /**
   * End timing an operation
   */
  endTimer(name, labels = {}) {
    // Skip timing in test environment to prevent interference
    if (isTestEnvironment()) {
      return 0;
    }
    
    const key = this.createKey(name, labels);
    const timer = this.timers.get(key);
    
    if (!timer) {
      logger.warn(`Timer not found: ${name}`, labels);
      return null;
    }

    const end = process.hrtime.bigint();
    const duration = Number(end - timer.start) / 1000000; // Convert to milliseconds
    
    this.timers.delete(key);
    
    // Record in metrics
    this.recordMetric('timer', name, duration, labels);
    
    logger.debug(`Timer completed: ${name}`, { ...labels, duration });
    return duration;
  }

  /**
   * Increment a counter
   */
  incrementCounter(name, value = 1, labels = {}) {
    const key = this.createKey(name, labels);
    const current = this.counters.get(key) || { value: 0, labels, name };
    current.value += value;
    this.counters.set(key, current);
    
    logger.debug(`Counter incremented: ${name}`, { ...labels, value, total: current.value });
  }

  /**
   * Set a gauge value
   */
  setGauge(name, value, labels = {}) {
    const key = this.createKey(name, labels);
    this.gauges.set(key, { value, labels, name, timestamp: Date.now() });
    
    logger.debug(`Gauge set: ${name}`, { ...labels, value });
  }

  /**
   * Record a histogram value
   */
  recordHistogram(name, value, labels = {}) {
    const key = this.createKey(name, labels);
    const histogram = this.histograms.get(key) || {
      values: [],
      labels,
      name,
      sum: 0,
      count: 0,
      min: Infinity,
      max: -Infinity
    };
    
    histogram.values.push(value);
    histogram.sum += value;
    histogram.count++;
    histogram.min = Math.min(histogram.min, value);
    histogram.max = Math.max(histogram.max, value);
    
    // Keep only last 1000 values to prevent memory issues
    if (histogram.values.length > 1000) {
      histogram.values = histogram.values.slice(-1000);
    }
    
    this.histograms.set(key, histogram);
    
    logger.debug(`Histogram recorded: ${name}`, { ...labels, value });
  }

  /**
   * Record a metric (internal method)
   */
  recordMetric(type, name, value, labels = {}) {
    const key = this.createKey(`${type}.${name}`, labels);
    const existing = this.metrics.get(key) || {
      type,
      name,
      labels,
      values: [],
      count: 0,
      sum: 0
    };
    
    existing.values.push({
      value,
      timestamp: Date.now()
    });
    existing.count++;
    existing.sum += value;
    
    // Keep only last 1000 values
    if (existing.values.length > 1000) {
      existing.values = existing.values.slice(-1000);
    }
    
    this.metrics.set(key, existing);
  }

  /**
   * Create a unique key for metrics
   */
  createKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return {
      timers: Object.fromEntries(this.timers),
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(this.histograms),
      metrics: Object.fromEntries(this.metrics),
      uptime: this.getUptime()
    };
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime() {
    const now = process.hrtime.bigint();
    return Number(now - this.startTime) / 1000000;
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const summary = {
      uptime: this.getUptime(),
      timers: {},
      counters: {},
      gauges: {},
      histograms: {}
    };

    // Process counters
    for (const [key, counter] of this.counters) {
      summary.counters[key] = {
        value: counter.value,
        labels: counter.labels
      };
    }

    // Process gauges
    for (const [key, gauge] of this.gauges) {
      summary.gauges[key] = {
        value: gauge.value,
        labels: gauge.labels,
        timestamp: gauge.timestamp
      };
    }

    // Process histograms
    for (const [key, histogram] of this.histograms) {
      summary.histograms[key] = {
        count: histogram.count,
        sum: histogram.sum,
        min: histogram.min === Infinity ? null : histogram.min,
        max: histogram.max === -Infinity ? null : histogram.max,
        avg: histogram.count > 0 ? histogram.sum / histogram.count : null,
        labels: histogram.labels
      };
    }

    // Process metrics (timers)
    for (const [key, metric] of this.metrics) {
      if (metric.type === 'timer') {
        const values = metric.values.map(v => v.value);
        summary.timers[key] = {
          count: metric.count,
          sum: metric.sum,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: metric.count > 0 ? metric.sum / metric.count : null,
          labels: metric.labels
        };
      }
    }

    return summary;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.timers.clear();
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.startTime = process.hrtime.bigint();
    logger.info('Performance metrics cleared');
  }

  /**
   * Export metrics to file
   */
  async exportToFile(filePath, format = 'json') {
    try {
      const data = this.getAllMetrics();
      let content;
      
      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
      } else if (format === 'csv') {
        content = this.exportToCSV(data);
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }
      
      await fs.writeFile(filePath, content);
      logger.info(`Performance metrics exported to: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to export metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export metrics to CSV format
   */
  exportToCSV(data) {
    const lines = ['metric_type,name,value,labels,timestamp'];
    
    // Export counters
    for (const [key, counter] of Object.entries(data.counters)) {
      const labels = Object.entries(counter.labels)
        .map(([k, v]) => `${k}=${v}`)
        .join(';');
      lines.push(`counter,${key},${counter.value},"${labels}",${Date.now()}`);
    }
    
    // Export gauges
    for (const [key, gauge] of Object.entries(data.gauges)) {
      const labels = Object.entries(gauge.labels)
        .map(([k, v]) => `${k}=${v}`)
        .join(';');
      lines.push(`gauge,${key},${gauge.value},"${labels}",${gauge.timestamp}`);
    }
    
    // Export histogram summaries
    for (const [key, histogram] of Object.entries(data.histograms)) {
      const labels = Object.entries(histogram.labels)
        .map(([k, v]) => `${k}=${v}`)
        .join(';');
      lines.push(`histogram,${key}_count,${histogram.count},"${labels}",${Date.now()}`);
      lines.push(`histogram,${key}_avg,${histogram.sum / histogram.count},"${labels}",${Date.now()}`);
      lines.push(`histogram,${key}_min,${histogram.min},"${labels}",${Date.now()}`);
      lines.push(`histogram,${key}_max,${histogram.max},"${labels}",${Date.now()}`);
    }
    
    return lines.join('\n');
  }
}

/**
 * Performance monitor for operations
 */
export class PerformanceMonitor {
  constructor(metrics = null) {
    this.metrics = metrics || new PerformanceMetrics();
    this.activeOperations = new Map();
  }

  /**
   * Start monitoring an operation
   */
  startOperation(name, labels = {}) {
    const operationId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.activeOperations.set(operationId, {
      name,
      labels,
      startTime: process.hrtime.bigint()
    });
    
    this.metrics.startTimer(name, labels);
    return operationId;
  }

  /**
   * End monitoring an operation
   */
  endOperation(operationId, success = true, error = null) {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      logger.warn(`Operation not found: ${operationId}`);
      return null;
    }
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - operation.startTime) / 1000000;
    
    this.activeOperations.delete(operationId);
    
    // Record metrics
    this.metrics.endTimer(operation.name, operation.labels);
    this.metrics.incrementCounter(`${operation.name}_total`, 1, operation.labels);
    
    if (success) {
      this.metrics.incrementCounter(`${operation.name}_success`, 1, operation.labels);
    } else {
      this.metrics.incrementCounter(`${operation.name}_errors`, 1, operation.labels);
    }
    
    this.metrics.recordHistogram(`${operation.name}_duration`, duration, operation.labels);
    
    logger.debug(`Operation completed: ${operation.name}`, {
      ...operation.labels,
      duration,
      success,
      error: error?.message
    });
    
    return duration;
  }

  /**
   * Wrap a function with performance monitoring
   */
  wrap(name, fn, labels = {}) {
    return async (...args) => {
      const operationId = this.startOperation(name, labels);
      try {
        const result = await fn(...args);
        this.endOperation(operationId, true);
        return result;
      } catch (error) {
        this.endOperation(operationId, false, error);
        throw error;
      }
    };
  }

  /**
   * Monitor memory usage
   */
  monitorMemory() {
    const memUsage = process.memoryUsage();
    
    this.metrics.setGauge('memory_heap_used', memUsage.heapUsed, { unit: 'bytes' });
    this.metrics.setGauge('memory_heap_total', memUsage.heapTotal, { unit: 'bytes' });
    this.metrics.setGauge('memory_external', memUsage.external, { unit: 'bytes' });
    this.metrics.setGauge('memory_rss', memUsage.rss, { unit: 'bytes' });
    
    logger.debug('Memory usage recorded', memUsage);
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const summary = this.metrics.getSummary();
    summary.activeOperations = this.activeOperations.size;
    return summary;
  }
}

/**
 * File analysis performance tracker
 */
export class FileAnalysisTracker {
  constructor(monitor) {
    this.monitor = monitor;
    this.fileStats = new Map();
  }

  /**
   * Start tracking file analysis
   */
  startFileAnalysis(filePath, fileType) {
    const operationId = this.monitor.startOperation('file_analysis', {
      file_type: fileType,
      file_path: filePath
    });
    
    this.fileStats.set(operationId, {
      filePath,
      fileType,
      startTime: Date.now(),
      size: 0
    });
    
    return operationId;
  }

  /**
   * Record file size
   */
  recordFileSize(operationId, size) {
    const stats = this.fileStats.get(operationId);
    if (stats) {
      stats.size = size;
    }
  }

  /**
   * End file analysis tracking
   */
  endFileAnalysis(operationId, issues = []) {
    const stats = this.fileStats.get(operationId);
    if (!stats) {
      logger.warn(`File analysis not found: ${operationId}`);
      return null;
    }
    
    const duration = this.monitor.endOperation(operationId);
    
    if (duration !== null) {
      // Record additional metrics
      this.monitor.metrics.incrementCounter('files_analyzed', 1, {
        file_type: stats.fileType
      });
      
      this.monitor.metrics.recordHistogram('file_size', stats.size, {
        file_type: stats.fileType
      });
      
      this.monitor.metrics.incrementCounter('issues_found', issues.length, {
        file_type: stats.fileType,
        severity: 'total'
      });
      
      issues.forEach(issue => {
        this.monitor.metrics.incrementCounter('issues_found', 1, {
          file_type: stats.fileType,
          severity: issue.severity
        });
      });
    }
    
    this.fileStats.delete(operationId);
    return duration;
  }
}

/**
 * Default performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();
export const fileAnalysisTracker = new FileAnalysisTracker(performanceMonitor);

/**
 * Performance decorators for automatic monitoring
 */
export function monitorPerformance(name, labels = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const operationId = performanceMonitor.startOperation(name, labels);
      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitor.endOperation(operationId, true);
        return result;
      } catch (error) {
        performanceMonitor.endOperation(operationId, false, error);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Memory usage monitoring
 */
export class MemoryMonitor {
  constructor(interval = 30000) { // 30 seconds default
    this.interval = interval;
    this.intervalId = null;
    this.baselineMemory = null;
  }

  start() {
    // Skip memory monitoring in test environment
    if (isTestEnvironment()) {
      logger.debug('Memory monitoring disabled in test environment');
      return;
    }
    
    this.baselineMemory = process.memoryUsage();
    logger.info('Memory monitoring started', this.baselineMemory);
    
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage();
    }, this.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Memory monitoring stopped');
    }
  }

  checkMemoryUsage() {
    const current = process.memoryUsage();
    const baseline = this.baselineMemory;
    
    const memoryDiff = {
      heapUsed: current.heapUsed - baseline.heapUsed,
      heapTotal: current.heapTotal - baseline.heapTotal,
      external: current.external - baseline.external,
      rss: current.rss - baseline.rss
    };
    
    // Log memory usage
    performanceMonitor.monitorMemory();
    
    // Check for memory leaks
    if (memoryDiff.heapUsed > 100 * 1024 * 1024) { // 100MB increase
      logger.warn('Potential memory leak detected', {
        baseline,
        current,
        diff: memoryDiff
      });
    }
    
    logger.debug('Memory usage check', {
      current,
      diff: memoryDiff
    });
  }
}

/**
 * Default memory monitor
 */
export const memoryMonitor = new MemoryMonitor();

/**
 * Export default instances
 */
export default {
  metrics: performanceMonitor.metrics,
  monitor: performanceMonitor,
  fileTracker: fileAnalysisTracker,
  memoryMonitor
};
