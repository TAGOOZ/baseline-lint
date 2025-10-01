# 📚 baseline-lint: Complete Documentation

> Comprehensive guide to all features and capabilities of baseline-lint

---

## 📋 Table of Contents

- [Overview](#overview)
- [Installation & Setup](#installation--setup)
- [CLI Commands](#cli-commands)
- [Configuration](#configuration)
- [TypeScript Support](#typescript-support)
- [GitHub Actions](#github-actions)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

baseline-lint is a comprehensive tooling suite for Baseline compatibility checking. It provides:

- **CLI Tool** - Command-line interface for checking files
- **GitHub Action** - Automated CI/CD integration
- **Visual Dashboard** - Interactive web interface
- **TypeScript Support** - Full type definitions
- **Configuration System** - Flexible configuration options
- **Performance Optimization** - LRU caching and batch processing

---

## Installation & Setup

### Global Installation
```bash
npm install -g baseline-lint
```

### Project Installation
```bash
npm install --save-dev baseline-lint
```

### Verify Installation
```bash
baseline-lint --version
baseline-lint check --help
```

---

## CLI Commands

### `check [paths...]`
Check files for Baseline compatibility.

**Options:**
- `-l, --level <level>` - `widely` or `newly` (default: `newly`)
- `-f, --format <format>` - `text` or `json` (default: `text`)
- `--no-warnings` - Show only errors
- `--fail-on-error` - Exit with code 1 if issues found
- `--css-only` - Check only CSS files
- `--js-only` - Check only JavaScript files
- `--score` - Show compatibility score
- `-c, --config <path>` - Path to configuration file

**Examples:**
```bash
baseline-lint check                          # Check current directory
baseline-lint check ./src ./styles           # Multiple paths
baseline-lint check --level widely           # Stricter checking
baseline-lint check --format json > out.json # JSON output
baseline-lint check --fail-on-error          # For CI/CD
```

### `score [paths...]`
Calculate Baseline compatibility score (0-100).

```bash
baseline-lint score ./src
# Output: 87/100
```

### `list <status>`
List features by Baseline status.

```bash
baseline-lint list widely              # Widely available features
baseline-lint list newly --group css   # Newly available CSS features
baseline-lint list limited             # Features not yet Baseline
```

### `search <query>`
Search for web features.

```bash
baseline-lint search "grid"
baseline-lint search "container queries"
```

### `info <featureId>`
Get detailed information about a feature.

```bash
baseline-lint info grid
baseline-lint info container-queries
```

### `config`
Configuration management commands.

```bash
baseline-lint config --init              # Create sample config file
baseline-lint config --show              # Show current configuration
```

### `cleanup`
Cleanup file handles and temporary files.

```bash
baseline-lint cleanup                    # Cleanup all file handles
```

---

## Configuration

### Configuration Files

The tool automatically discovers configuration files in this order:

1. `baseline-lint.json`
2. `baseline-lint.config.js`
3. `.baseline-lintrc`
4. `.baseline-lintrc.json`
5. `package.json` (in `baseline-lint` field)

### Sample Configuration

```json
{
  "$schema": "https://raw.githubusercontent.com/yourusername/baseline-lint/main/schema.json",
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

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `requiredLevel` | `string` | `"low"` | Baseline level: `"low"` (newly) or `"high"` (widely) |
| `format` | `string` | `"text"` | Output format: `"text"`, `"json"`, or `"markdown"` |
| `noWarnings` | `boolean` | `false` | Hide warnings, show only errors |
| `failOnError` | `boolean` | `false` | Exit with error code if issues found |
| `cssOnly` | `boolean` | `false` | Check only CSS files |
| `jsOnly` | `boolean` | `false` | Check only JavaScript files |
| `cache.enabled` | `boolean` | `true` | Enable caching for better performance |
| `cache.bcdCacheSize` | `number` | `5000` | Maximum BCD cache entries |
| `cache.featureCacheSize` | `number` | `1000` | Maximum feature cache entries |
| `cache.ttl` | `number` | `3600000` | Cache TTL in milliseconds |
| `patterns.css` | `string[]` | `["**/*.css"]` | CSS file patterns |
| `patterns.js` | `string[]` | `["**/*.{js,jsx,ts,tsx}"]` | JavaScript file patterns |
| `patterns.ignore` | `string[]` | `["**/node_modules/**", "**/dist/**", "**/build/**"]` | Ignore patterns |
| `analysis.maxFileSize` | `number` | `52428800` | Maximum file size in bytes (50MB) |
| `analysis.timeout` | `number` | `30000` | Analysis timeout in milliseconds |
| `dashboard.port` | `number` | `3000` | Dashboard server port |
| `dashboard.host` | `string` | `"localhost"` | Dashboard server host |
| `dashboard.cors.enabled` | `boolean` | `true` | Enable CORS |
| `dashboard.cors.origins` | `string[]` | `["http://localhost:3000"]` | Allowed CORS origins |
| `dashboard.rateLimit.enabled` | `boolean` | `true` | Enable rate limiting |
| `dashboard.rateLimit.maxRequests` | `number` | `100` | Maximum requests per window |
| `dashboard.rateLimit.windowMs` | `number` | `60000` | Rate limit window in milliseconds |
| `ci.commentOnPR` | `boolean` | `true` | Comment on pull requests |
| `ci.failOnError` | `boolean` | `true` | Fail CI on errors |
| `ci.reportFormat` | `string` | `"markdown"` | CI report format |

### Creating Configuration

```bash
# Create sample configuration file
baseline-lint config --init

# Show current configuration
baseline-lint config --show

# Use specific config file
baseline-lint check --config ./my-config.json
```

---

## TypeScript Support

baseline-lint provides comprehensive TypeScript support with full type definitions for all APIs.

### Installation with TypeScript

```bash
# Install baseline-lint
npm install baseline-lint

# TypeScript definitions are included automatically
# No additional @types package needed!
```

### TypeScript Usage

```typescript
import {
  analyzeCSSFile,
  analyzeJSFile,
  getFeatureStatus,
  calculateScore,
  type AnalysisResult,
  type BaselineFeature,
  type Issue,
  type BaselineLintConfig
} from 'baseline-lint';

// Fully typed analysis
const result: AnalysisResult = await analyzeCSSFile('./styles.css', {
  requiredLevel: 'high',
  format: 'json'
});

// Type-safe feature checking
const feature: BaselineFeature = await getFeatureStatus('css.grid');
console.log(feature.status); // 'widely-available' | 'newly-available' | 'limited'

// Typed configuration
const config: BaselineLintConfig = {
  requiredLevel: 'low',
  format: 'text',
  cache: {
    enabled: true,
    bcdCacheSize: 5000,
    featureCacheSize: 1000,
    ttl: 3600000
  }
};
```

### Type Definitions Included

- ✅ **Core Types**: `AnalysisResult`, `Issue`, `BaselineFeature`
- ✅ **Configuration Types**: `BaselineLintConfig`, `CacheConfig`, `DashboardConfig`
- ✅ **Error Types**: `BaselineLintError`, `ParseError`, `ValidationError`
- ✅ **Utility Types**: `LRUCache`, `FileOptions`, `PerformanceMetrics`
- ✅ **CLI Types**: Command interfaces and option types
- ✅ **Global Extensions**: Enhanced Node.js and Jest types

### Development with TypeScript

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true
  }
}

// Your code with full type safety
const issues: Issue[] = result.issues.filter(
  issue => issue.level === 'error'
);

const score: number = calculateScore([result]);
```

---

## GitHub Actions

### Quick Setup

```bash
# Automatic setup
npx baseline-lint setup-ci

# Or manually create .github/workflows/baseline-check.yml
```

### Full Action Example

```yaml
name: Baseline Compatibility Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  baseline:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install baseline-lint
        run: npm install -g baseline-lint
      
      - name: Run Baseline Check
        run: baseline-lint check ./src --fail-on-error
```

### PR Comments

Every PR automatically gets a detailed baseline compatibility report:

```
📊 Baseline Compatibility Report

Overall Scores:
- 📁 Source Code: 87/100
- 🧪 Test Files: 95/100

✅ Source Code - No Baseline Issues Found!
✅ Test Files - No Baseline Issues Found!

💡 Recommendations
- 🎯 Target Score: Aim for 90+ for production code
- 📚 Learn More: Check Baseline Web Features
- 🔧 Fix Issues: Use baseline-lint check ./src locally
```

---

## Architecture

```
baseline-lint/
├── src/
│   ├── core/
│   │   └── checker.js       # Core Baseline checking logic with LRU cache
│   ├── config/
│   │   └── config.js        # Configuration management system
│   ├── parsers/
│   │   ├── css-parser.js    # CSS AST parsing
│   │   └── js-parser.js     # JavaScript AST parsing (200+ APIs)
│   ├── utils/
│   │   ├── error-handler.js # Enhanced error handling
│   │   ├── validation.js    # Input validation & sanitization
│   │   ├── lru-cache.js     # LRU Cache implementation
│   │   └── file-handler.js  # File handling with proper cleanup
│   └── index.js             # Main package exports
├── bin/
│   └── cli.js               # CLI interface with config support
├── scripts/
│   ├── setup-ci.js          # GitHub Action setup
│   └── serve-dashboard.js   # Secure dashboard server
├── dashboard/
│   └── index.html           # Visual dashboard
├── test/                    # Comprehensive unit tests
│   ├── core/
│   ├── config/
│   ├── parsers/
│   ├── utils/
│   └── index.test.js
└── .github/
    └── workflows/
        └── baseline-check.yml
```

---

## API Reference

### Core Functions

```javascript
import {
  // Analysis functions
  analyzeCSSFile,
  analyzeJSFile,
  
  // Core checking
  getFeatureStatus,
  checkCSSPropertyValue,
  calculateScore,
  getCacheStats,
  
  // Error handling
  BaselineLintError,
  ParseError,
  ValidationError,
  
  // Validation
  validateFilePath,
  sanitizeFilePath,
  
  // LRU Cache
  LRUCache,
  createLRUCache,
  bcdCache,
  featureCache,
  clearAllCaches,
  getAllCacheStats,
  
  // Configuration
  loadConfig,
  createSampleConfig,
  getCommandConfig,
  DEFAULT_CONFIG,
  CONFIG_FILES,
  
  // File handling
  readFileWithCleanup,
  writeFileWithCleanup,
  createReadStreamWithCleanup,
  createWriteStreamWithCleanup,
  copyFileWithCleanup,
  moveFileWithCleanup,
  deleteFileWithCleanup,
  ensureDirWithCleanup,
  getFileStatsWithCleanup,
  cleanupAllFileHandles,
  getActiveFileHandleCount,
  processFilesWithCleanup,
  createTempFile,
  cleanupTempFiles,
  getTempFileCount,
  FileHandleManager,
  TemporaryFileManager,
  
  // And many more...
} from 'baseline-lint';
```

---

## Examples

### Basic Usage

```bash
# Check a single file
baseline-lint check ./src/styles.css

# Check multiple directories
baseline-lint check ./src ./styles

# Get compatibility score
baseline-lint score ./src

# Search for features
baseline-lint search "grid"
```

### Advanced Configuration

```json
{
  "requiredLevel": "high",
  "format": "json",
  "failOnError": true,
  "cache": {
    "enabled": true,
    "bcdCacheSize": 10000,
    "featureCacheSize": 2000
  },
  "patterns": {
    "ignore": ["**/node_modules/**", "**/dist/**", "**/vendor/**"]
  }
}
```

### CI/CD Integration

```yaml
name: Baseline Check
on: [pull_request]
jobs:
  baseline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g baseline-lint
      - run: baseline-lint check ./src --fail-on-error
```

---

## Troubleshooting

### Common Issues

**Q: Getting "command not found" after installation?**
```bash
# Make sure npm global bin is in your PATH
npm config get prefix
# Add to your shell profile: export PATH="$(npm config get prefix)/bin:$PATH"
```

**Q: Permission errors on macOS/Linux?**
```bash
# Use sudo for global installation
sudo npm install -g baseline-lint

# Or use npx instead
npx baseline-lint check ./src
```

**Q: Why am I getting 0/100 scores?**
- This indicates your code uses features not yet widely supported
- Check the detailed output for specific issues
- Consider using polyfills or alternative approaches

**Q: Analysis is slow on large projects?**
```bash
# Increase cache size
baseline-lint config --init
# Edit baseline-lint.json to increase cache.bcdCacheSize
```

### Getting Help

- 🐛 [Report Issues](https://github.com/TAGOOZ/baseline-lint/issues)
- 💬 [Discussions](https://github.com/TAGOOZ/baseline-lint/discussions)
- 📧 Email: mostafatageldeen588@gmail.com

---

*For more specific guides, see the other documentation files in this directory.*
