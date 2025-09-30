# ⚙️ Configuration Guide

> Complete guide to configuring baseline-lint for your project

---

## Overview

baseline-lint supports comprehensive configuration through multiple methods, allowing you to customize behavior for different environments and use cases.

---

## Configuration Discovery

The tool automatically discovers configuration files in this order (later files override earlier ones):

1. `baseline-lint.json` (in project root)
2. `baseline-lint.config.js` (JavaScript configuration)
3. `.baseline-lintrc` (JSON configuration)
4. `.baseline-lintrc.json` (JSON configuration)
5. `package.json` (in `baseline-lint` field)

---

## Configuration File Formats

### JSON Configuration

Create a `baseline-lint.json` file in your project root:

```json
{
  "$schema": "https://raw.githubusercontent.com/TAGOOZ/baseline-lint/main/schema.json",
  "requiredLevel": "low",
  "format": "text",
  "noWarnings": false,
  "failOnError": false,
  "cssOnly": false,
  "jsOnly": false,
  "cache": {
    "enabled": true,
    "bcdCacheSize": 5000,
    "featureCacheSize": 1000,
    "ttl": 3600000
  },
  "patterns": {
    "css": ["**/*.css"],
    "js": ["**/*.{js,jsx,ts,tsx}"],
    "ignore": ["**/node_modules/**", "**/dist/**", "**/build/**"]
  },
  "analysis": {
    "includeComments": false,
    "strictMode": false,
    "maxFileSize": 52428800,
    "timeout": 30000
  },
  "dashboard": {
    "port": 3000,
    "host": "localhost",
    "cors": {
      "enabled": true,
      "origins": ["http://localhost:3000"]
    },
    "rateLimit": {
      "enabled": true,
      "maxRequests": 100,
      "windowMs": 60000
    }
  },
  "ci": {
    "commentOnPR": true,
    "failOnError": true,
    "reportFormat": "markdown"
  }
}
```

### JavaScript Configuration

For dynamic configuration, use `baseline-lint.config.js`:

```javascript
module.exports = {
  requiredLevel: process.env.NODE_ENV === 'production' ? 'high' : 'low',
  format: 'text',
  noWarnings: false,
  failOnError: process.env.CI === 'true',
  cache: {
    enabled: true,
    bcdCacheSize: parseInt(process.env.BASELINE_CACHE_SIZE) || 5000,
    featureCacheSize: 1000,
    ttl: 3600000
  },
  patterns: {
    css: ['**/*.css'],
    js: ['**/*.{js,jsx,ts,tsx}'],
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**'
    ]
  },
  analysis: {
    includeComments: false,
    strictMode: false,
    maxFileSize: 52428800,
    timeout: 30000
  }
};
```

### Package.json Configuration

Add configuration to your `package.json`:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "baseline-lint": {
    "requiredLevel": "low",
    "format": "text",
    "failOnError": false,
    "patterns": {
      "ignore": ["**/node_modules/**", "**/dist/**"]
    }
  }
}
```

---

## Configuration Options

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `requiredLevel` | `string` | `"low"` | Baseline level: `"low"` (newly) or `"high"` (widely) |
| `format` | `string` | `"text"` | Output format: `"text"`, `"json"`, or `"markdown"` |
| `noWarnings` | `boolean` | `false` | Hide warnings, show only errors |
| `failOnError` | `boolean` | `false` | Exit with error code if issues found |
| `cssOnly` | `boolean` | `false` | Check only CSS files |
| `jsOnly` | `boolean` | `false` | Check only JavaScript files |

### Cache Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cache.enabled` | `boolean` | `true` | Enable caching for better performance |
| `cache.bcdCacheSize` | `number` | `5000` | Maximum BCD cache entries |
| `cache.featureCacheSize` | `number` | `1000` | Maximum feature cache entries |
| `cache.ttl` | `number` | `3600000` | Cache TTL in milliseconds (1 hour) |

### File Patterns

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `patterns.css` | `string[]` | `["**/*.css"]` | CSS file patterns |
| `patterns.js` | `string[]` | `["**/*.{js,jsx,ts,tsx}"]` | JavaScript file patterns |
| `patterns.ignore` | `string[]` | `["**/node_modules/**", "**/dist/**", "**/build/**"]` | Ignore patterns |

### Analysis Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `analysis.includeComments` | `boolean` | `false` | Include comments in analysis |
| `analysis.strictMode` | `boolean` | `false` | Enable strict mode for stricter checking |
| `analysis.maxFileSize` | `number` | `52428800` | Maximum file size in bytes (50MB) |
| `analysis.timeout` | `number` | `30000` | Analysis timeout in milliseconds |

### Dashboard Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dashboard.port` | `number` | `3000` | Dashboard server port |
| `dashboard.host` | `string` | `"localhost"` | Dashboard server host |
| `dashboard.cors.enabled` | `boolean` | `true` | Enable CORS |
| `dashboard.cors.origins` | `string[]` | `["http://localhost:3000"]` | Allowed CORS origins |
| `dashboard.rateLimit.enabled` | `boolean` | `true` | Enable rate limiting |
| `dashboard.rateLimit.maxRequests` | `number` | `100` | Maximum requests per window |
| `dashboard.rateLimit.windowMs` | `number` | `60000` | Rate limit window in milliseconds |

### CI/CD Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ci.commentOnPR` | `boolean` | `true` | Comment on pull requests |
| `ci.failOnError` | `boolean` | `true` | Fail CI on errors |
| `ci.reportFormat` | `string` | `"markdown"` | CI report format |

---

## Environment-Specific Configurations

### Development Configuration

```json
{
  "requiredLevel": "low",
  "format": "text",
  "noWarnings": false,
  "failOnError": false,
  "cache": {
    "enabled": true,
    "bcdCacheSize": 5000,
    "featureCacheSize": 1000
  },
  "patterns": {
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/test/**"
    ]
  }
}
```

### Production Configuration

```json
{
  "requiredLevel": "high",
  "format": "json",
  "noWarnings": true,
  "failOnError": true,
  "cache": {
    "enabled": true,
    "bcdCacheSize": 10000,
    "featureCacheSize": 2000
  },
  "analysis": {
    "strictMode": true,
    "maxFileSize": 104857600
  }
}
```

### CI/CD Configuration

```json
{
  "requiredLevel": "low",
  "format": "json",
  "failOnError": true,
  "cache": {
    "enabled": false
  },
  "ci": {
    "commentOnPR": true,
    "failOnError": true,
    "reportFormat": "markdown"
  }
}
```

---

## Advanced Configuration Examples

### Large Project Configuration

```json
{
  "requiredLevel": "low",
  "format": "json",
  "cache": {
    "enabled": true,
    "bcdCacheSize": 15000,
    "featureCacheSize": 3000,
    "ttl": 7200000
  },
  "patterns": {
    "css": ["**/*.css", "**/*.scss", "**/*.sass"],
    "js": ["**/*.{js,jsx,ts,tsx}", "**/*.vue"],
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/vendor/**",
      "**/public/**",
      "**/static/**"
    ]
  },
  "analysis": {
    "maxFileSize": 104857600,
    "timeout": 60000
  }
}
```

### Performance-Optimized Configuration

```json
{
  "requiredLevel": "low",
  "cache": {
    "enabled": true,
    "bcdCacheSize": 20000,
    "featureCacheSize": 5000,
    "ttl": 14400000
  },
  "analysis": {
    "includeComments": false,
    "strictMode": false,
    "timeout": 15000
  },
  "patterns": {
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/test/**",
      "**/spec/**",
      "**/docs/**"
    ]
  }
}
```

### Strict Configuration

```json
{
  "requiredLevel": "high",
  "noWarnings": false,
  "failOnError": true,
  "analysis": {
    "includeComments": true,
    "strictMode": true,
    "maxFileSize": 52428800
  },
  "ci": {
    "commentOnPR": true,
    "failOnError": true,
    "reportFormat": "markdown"
  }
}
```

---

## Configuration Commands

### Initialize Configuration

```bash
# Create sample configuration file
baseline-lint config --init

# Create with specific format
baseline-lint config --init --format json
```

### Show Current Configuration

```bash
# Show merged configuration
baseline-lint config --show

# Show configuration from specific file
baseline-lint config --show --config ./my-config.json
```

### Validate Configuration

```bash
# Validate configuration file
baseline-lint config --validate ./baseline-lint.json

# Validate and show errors
baseline-lint config --validate ./config.json --verbose
```

---

## Configuration Best Practices

### 1. Use Environment Variables

```javascript
// baseline-lint.config.js
module.exports = {
  requiredLevel: process.env.NODE_ENV === 'production' ? 'high' : 'low',
  failOnError: process.env.CI === 'true',
  cache: {
    enabled: !process.env.BASELINE_NO_CACHE
  }
};
```

### 2. Separate Configurations by Environment

```bash
# Development
baseline-lint.json

# Production
baseline-lint.prod.json

# CI/CD
baseline-lint.ci.json
```

### 3. Use Relative Paths

```json
{
  "patterns": {
    "css": ["./src/**/*.css", "./styles/**/*.css"],
    "js": ["./src/**/*.{js,jsx,ts,tsx}"]
  }
}
```

### 4. Optimize Cache Settings

```json
{
  "cache": {
    "enabled": true,
    "bcdCacheSize": 10000,  // Increase for large projects
    "featureCacheSize": 2000,
    "ttl": 7200000  // 2 hours for stable projects
  }
}
```

### 5. Use Ignore Patterns Effectively

```json
{
  "patterns": {
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/vendor/**",
      "**/public/**",
      "**/static/**",
      "**/docs/**",
      "**/examples/**"
    ]
  }
}
```

---

## Troubleshooting Configuration

### Common Issues

**Configuration not being loaded:**
```bash
# Check if config file exists and is valid JSON
baseline-lint config --show

# Validate configuration file
baseline-lint config --validate ./baseline-lint.json
```

**Patterns not matching files:**
```bash
# Test patterns with verbose output
baseline-lint check ./src --verbose

# Check if files are being ignored
baseline-lint check ./src --no-cache
```

**Cache issues:**
```bash
# Clear cache
baseline-lint cleanup

# Disable cache temporarily
baseline-lint check ./src --no-cache
```

---

## Configuration Schema

The configuration file supports JSON Schema validation. Add this to your configuration file:

```json
{
  "$schema": "https://raw.githubusercontent.com/TAGOOZ/baseline-lint/main/schema.json",
  "requiredLevel": "low"
}
```

This provides:
- IntelliSense support in your editor
- Validation of configuration options
- Documentation for each option

---

*For more information, see the [CLI reference](CLI.md) or [complete documentation](DOCUMENTATION.md).*
