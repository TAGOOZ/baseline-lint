// src/utils/lru-cache.js
// LRU Cache implementation with size limits

/**
 * LRU Cache implementation with size limits
 * Uses a Map for O(1) access and maintains insertion order
 */
export class LRUCache {
  constructor(maxSize = 1000) {
    if (maxSize <= 0) {
      throw new Error('Max size must be greater than 0');
    }
    
    this.maxSize = maxSize;
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get value from cache
   * @param {any} key - Cache key
   * @returns {any} Cached value or undefined
   */
  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      this.hits++;
      return value;
    }
    
    this.misses++;
    return undefined;
  }

  /**
   * Set value in cache
   * @param {any} key - Cache key
   * @param {any} value - Value to cache
   */
  set(key, value) {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  /**
   * Check if key exists in cache
   * @param {any} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete key from cache
   * @param {any} key - Cache key
   * @returns {boolean} True if key was deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from cache
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache size
   * @returns {number} Number of entries
   */
  size() {
    return this.cache.size;
  }

  /**
   * Check if cache is full
   * @returns {boolean} True if cache is at max size
   */
  isFull() {
    return this.cache.size >= this.maxSize;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0
    };
  }

  /**
   * Get all keys in cache (in order of access)
   * @returns {Array} Array of keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in cache (in order of access)
   * @returns {Array} Array of values
   */
  values() {
    return Array.from(this.cache.values());
  }

  /**
   * Get all entries in cache (in order of access)
   * @returns {Array} Array of [key, value] pairs
   */
  entries() {
    return Array.from(this.cache.entries());
  }

  /**
   * Iterate over cache entries
   * @param {Function} callback - Function to call for each entry
   */
  forEach(callback) {
    this.cache.forEach(callback);
  }

  /**
   * Create a new cache with different max size
   * @param {number} newMaxSize - New maximum size
   * @returns {LRUCache} New cache instance
   */
  resize(newMaxSize) {
    if (newMaxSize <= 0) {
      throw new Error('Max size must be greater than 0');
    }
    
    const newCache = new LRUCache(newMaxSize);
    
    // Copy entries in order, respecting new size limit
    const entries = this.entries();
    const entriesToCopy = entries.slice(-newMaxSize);
    
    entriesToCopy.forEach(([key, value]) => {
      newCache.set(key, value);
    });
    
    return newCache;
  }

  /**
   * Get cache as object (for serialization)
   * @returns {Object} Cache data
   */
  toObject() {
    return {
      maxSize: this.maxSize,
      entries: this.entries(),
      stats: this.getStats()
    };
  }

  /**
   * Create cache from object (for deserialization)
   * @param {Object} data - Cache data
   * @returns {LRUCache} New cache instance
   */
  static fromObject(data) {
    const cache = new LRUCache(data.maxSize);
    
    data.entries.forEach(([key, value]) => {
      cache.set(key, value);
    });
    
    return cache;
  }
}

/**
 * Create a new LRU cache instance
 * @param {number} maxSize - Maximum number of entries
 * @returns {LRUCache} New cache instance
 */
export function createLRUCache(maxSize = 1000) {
  return new LRUCache(maxSize);
}

/**
 * Default cache instance for BCD lookups
 */
export const bcdCache = new LRUCache(5000);

/**
 * Default cache instance for feature lookups
 */
export const featureCache = new LRUCache(1000);

/**
 * Clear all default caches
 */
export function clearAllCaches() {
  bcdCache.clear();
  featureCache.clear();
}

/**
 * Get statistics for all default caches
 * @returns {Object} Combined statistics
 */
export function getAllCacheStats() {
  return {
    bcdCache: bcdCache.getStats(),
    featureCache: featureCache.getStats()
  };
}
