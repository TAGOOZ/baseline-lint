// src/core/checker.js
// Enhanced Baseline checking with caching and JavaScript support

import { features } from 'web-features';
import { getStatus } from 'compute-baseline';
import { bcdCache, featureCache, clearAllCaches } from '../utils/lru-cache.js';
import { logger, logHelpers } from '../utils/logger.js';
import { isTestEnvironment, getMockBCDStatus } from '../utils/test-helpers.js';

/**
 * Baseline levels
 */
export const BaselineLevel = {
  WIDELY: 'high',
  NEWLY: 'low',
  LIMITED: false
};

/**
 * Check if a feature meets the specified Baseline level
 */
export function meetsBaselineLevel(baselineStatus, requiredLevel) {
  if (requiredLevel === 'high') {
    return baselineStatus === 'high';
  } else if (requiredLevel === 'low') {
    // For 'low' level, accept 'high' and 'low', but NOT 'false' (limited)
    return baselineStatus === 'high' || baselineStatus === 'low';
  }
  return true;
}

/**
 * Get Baseline status for a feature by ID with caching
 */
export function getFeatureStatus(featureId) {
  logger.debug(`Getting feature status for: ${featureId}`);
  
  // Check cache first
  if (featureCache.has(featureId)) {
    logger.debug(`Cache hit for feature: ${featureId}`);
    return featureCache.get(featureId);
  }

  logger.debug(`Cache miss for feature: ${featureId}`);
  const feature = features[featureId];
  if (!feature) {
    logger.warn(`Feature not found: ${featureId}`);
    featureCache.set(featureId, null);
    return null;
  }

  const result = {
    id: featureId,
    name: feature.name,
    baseline: feature.status.baseline,
    baseline_low_date: feature.status.baseline_low_date,
    baseline_high_date: feature.status.baseline_high_date,
    support: feature.status.support,
    description: feature.description,
    group: feature.group
  };

  // Cache the result
  featureCache.set(featureId, result);
  logger.debug(`Cached feature status: ${featureId}`, { baseline: result.baseline });
  return result;
}

/**
 * Get Baseline status for a specific BCD key with caching and timeout
 */
export function getBCDKeyStatus(bcdKey) {
  logger.debug(`Getting BCD key status: ${bcdKey}`);
  
  if (bcdCache.has(bcdKey)) {
    logger.debug(`Cache hit for BCD key: ${bcdKey}`);
    return bcdCache.get(bcdKey);
  }

  logger.debug(`Cache miss for BCD key: ${bcdKey}`);
  
  // In test environment, use mock data to prevent hanging
  if (isTestEnvironment()) {
    const mockStatus = getMockBCDStatus(bcdKey);
    bcdCache.set(bcdKey, mockStatus);
    logger.debug(`Using mock BCD status: ${bcdKey}`, { baseline: mockStatus?.baseline });
    return mockStatus;
  }
  
  try {
    const status = getStatus(null, bcdKey);
    bcdCache.set(bcdKey, status);
    logger.debug(`Cached BCD key status: ${bcdKey}`, { baseline: status?.baseline });
    return status;
  } catch (error) {
    logger.debug(`Failed to get BCD key status: ${bcdKey}`, { error: error.message });
    bcdCache.set(bcdKey, null);
    return null;
  }
}

/**
 * Check CSS property-value pair
 */
export function checkCSSPropertyValue(property, value) {
  const propertyValueKey = `css.properties.${property}.${value}`;
  const propertyValueStatus = getBCDKeyStatus(propertyValueKey);
  
  if (propertyValueStatus) {
    return {
      type: 'property-value',
      bcdKey: propertyValueKey,
      status: propertyValueStatus,
      property,
      value
    };
  }

  const propertyKey = `css.properties.${property}`;
  const propertyStatus = getBCDKeyStatus(propertyKey);
  
  return {
    type: 'property',
    bcdKey: propertyKey,
    status: propertyStatus,
    property,
    value
  };
}

/**
 * Check JavaScript API usage
 */
export function checkJavaScriptAPI(apiPath) {
  const bcdKey = convertAPIPathToBCDKey(apiPath);
  const status = getBCDKeyStatus(bcdKey);
  
  return {
    type: 'javascript-api',
    bcdKey,
    status,
    apiPath
  };
}

/**
 * Convert JavaScript API path to BCD key format
 */
function convertAPIPathToBCDKey(apiPath) {
  // Array.at -> javascript.builtins.Array.at
  // Promise.try -> javascript.builtins.Promise.try
  // structuredClone -> javascript.builtins.structuredClone
  
  if (apiPath.includes('.prototype.')) {
    const [obj, , method] = apiPath.split('.');
    return `javascript.builtins.${obj}.${method}`;
  }
  
  if (apiPath.includes('.')) {
    const parts = apiPath.split('.');
    return `javascript.builtins.${parts.join('.')}`;
  }
  
  return `javascript.builtins.${apiPath}`;
}

/**
 * Generate report for a Baseline check
 */
export function generateReport(result, requiredLevel) {
  if (!result.status) {
    return {
      severity: 'warning',
      message: `Unknown Baseline status - API may not be widely supported`,
      compatible: false
    };
  }

  const { baseline } = result.status;
  const compatible = meetsBaselineLevel(baseline, requiredLevel);

  let severity = 'info';
  let message = '';

  if (!compatible) {
    if (baseline === false) {
      severity = 'error';
      message = `Limited availability - Not yet Baseline`;
    } else if (baseline === 'low' && requiredLevel === 'high') {
      severity = 'warning';
      message = `Newly available - Use with caution (since ${result.status.baseline_low_date})`;
    }
  } else {
    severity = 'info';
    if (baseline === 'high') {
      message = `Widely available (since ${result.status.baseline_high_date})`;
    } else if (baseline === 'low') {
      message = `Newly available (since ${result.status.baseline_low_date})`;
    }
  }

  return {
    severity,
    message,
    compatible,
    baseline,
    support: result.status.support,
    bcdKey: result.bcdKey
  };
}

/**
 * Calculate Baseline score (0-100)
 */
export function calculateScore(results) {
  if (results.length === 0) return 100;

  const weights = {
    widely: 1.0,    // High baseline - widely supported
    newly: 0.7,     // Low baseline - newly available  
    limited: 0.3,   // False baseline - limited support
    unknown: 0.5    // Undefined baseline - unknown status
  };

  let totalWeight = 0;
  let totalPossible = results.length;

  results.forEach(result => {
    // Handle both formats: result.status.baseline and result.baseline
    const baseline = result.status?.baseline || result.baseline;
    if (baseline === 'high') {
      totalWeight += weights.widely;
    } else if (baseline === 'low') {
      totalWeight += weights.newly;
    } else if (baseline === false) {
      totalWeight += weights.limited;
    } else {
      // Undefined/unknown baseline status
      totalWeight += weights.unknown;
    }
  });

  return Math.round((totalWeight / totalPossible) * 100);
}

/**
 * Get all features by Baseline status
 */
export function getFeaturesByStatus(status) {
  const webFeatures = Object.values(features);
  return webFeatures.filter(feature => 
    feature.status && feature.status.baseline === status
  );
}

/**
 * Get all features in a group
 */
export function getFeaturesByGroup(groupName) {
  const webFeatures = Object.values(features);
  return webFeatures.filter(feature => 
    feature.group && feature.group.includes(groupName)
  );
}

/**
 * Search for features
 */
export function searchFeatures(query) {
  const webFeatures = Object.entries(features);
  const lowerQuery = query.toLowerCase();
  
  return webFeatures
    .filter(([id, feature]) => {
      return (
        id.toLowerCase().includes(lowerQuery) ||
        (feature.name && feature.name.toLowerCase().includes(lowerQuery)) ||
        (feature.description && feature.description.toLowerCase().includes(lowerQuery))
      );
    })
    .map(([id, feature]) => ({
      id,
      name: feature.name || id,
      baseline: feature.status?.baseline,
      description: feature.description
    }));
}

/**
 * Clear cache (useful for testing)
 */
export function clearCache() {
  clearAllCaches();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    bcdCache: bcdCache.getStats(),
    featureCache: featureCache.getStats()
  };
}