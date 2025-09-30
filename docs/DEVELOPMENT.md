# 🛠️ Development Guide

> Complete guide for contributing to and developing with baseline-lint

---

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm 7+
- Git

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/TAGOOZ/baseline-lint.git
cd baseline-lint

# Install dependencies
npm install

# Install TypeScript dependencies
npm install --save-dev typescript @types/node @types/jest ts-node

# Make CLI executable
chmod +x bin/cli.js

# Verify installation
./bin/cli.js --version
```

---

## CI/CD Development

### Enhanced Workflows

baseline-lint includes robust CI/CD workflows with advanced file detection:

#### File Detection System
The CI workflows use a 5-strategy file detection system:

1. **GitHub PR Context**: Uses PR base/head SHAs when available
2. **Base Ref Comparison**: Compares with the base branch (e.g., main)
3. **Main Branch Comparison**: Fallback to main branch comparison
4. **HEAD~1 Comparison**: For shallow clones
5. **All Files Fallback**: Checks all CSS/JS files in current commit

#### Workflow Files
- `.github/workflows/ci.yml` - Main CI pipeline with comprehensive testing
- `.github/workflows/pr-check.yml` - PR-specific baseline checking
- `.github/workflows/release.yml` - Release automation
- `.github/workflows/test-file-detection.yml` - File detection testing

#### Testing CI Locally
```bash
# Test file detection logic
./scripts/detect-changed-files.sh

# Test baseline detection
npm run baseline-check

# Test performance
npm run test:performance
```

---

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm test test/core/          # Core functionality tests
npm test test/config/       # Configuration system tests
npm test test/parsers/      # CSS/JS parser tests  
npm test test/utils/        # Utility function tests

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Type Checking

```bash
# Type checking
npm run type-check

# Type checking in watch mode
npm run type-check:watch

# Build TypeScript
npm run build
```

### Development Commands

```bash
# Full development cycle
npm run clean && npm run build && npm test

# Try it locally
./bin/cli.js check ./src

# Self-baseline check (like CI)
baseline-lint check ./src --fail-on-error
```

---

## Project Structure

```
baseline-lint/
├── src/                    # Source code
│   ├── core/              # Core checking logic
│   ├── config/            # Configuration management
│   ├── parsers/           # CSS/JS parsers
│   ├── utils/             # Utility functions
│   └── index.js           # Main exports
├── bin/                   # CLI executable
├── scripts/               # Build and utility scripts
├── dashboard/             # Visual dashboard
├── test/                  # Test files
│   ├── core/             # Core tests
│   ├── config/           # Config tests
│   ├── parsers/          # Parser tests
│   └── utils/            # Utility tests
├── docs/                  # Documentation
├── .github/              # GitHub workflows
└── package.json          # Package configuration
```

---

## Code Organization

### Core Modules

#### `src/core/checker.js`
Main Baseline checking logic with LRU cache implementation.

**Key Functions:**
- `checkBaselineFeature(featureId, level)`
- `calculateScore(results)`
- `getFeatureStatus(featureId)`

#### `src/config/config.js`
Configuration management system with auto-discovery.

**Key Functions:**
- `loadConfig(options)`
- `mergeConfigs(configs)`
- `validateConfig(config)`

#### `src/parsers/`
CSS and JavaScript AST parsers for feature detection.

**CSS Parser:**
- `parseCSSFile(filePath)`
- `extractCSSFeatures(ast)`

**JavaScript Parser:**
- `parseJSFile(filePath)`
- `extractJSFeatures(ast)`

#### `src/utils/`
Utility functions for error handling, validation, and file management.

**Key Modules:**
- `error-handler.js` - Enhanced error handling
- `validation.js` - Input validation & sanitization
- `lru-cache.js` - LRU Cache implementation
- `file-handler.js` - File handling with cleanup

---

## Testing

### Test Structure

The project includes comprehensive tests:

- **315 individual test cases** (`it()` blocks)
- **96 test suites** (`describe()` blocks)
- **12 test files**
- **4,267 lines** of test code

### Test Categories

#### Unit Tests
- Core checker functionality
- CSS/JavaScript parsers
- Error handling
- Validation utilities
- LRU cache
- File handling
- Configuration management

#### Integration Tests
- CLI integration
- Parser integration
- End-to-end workflow

### Writing Tests

```javascript
// Example test structure
describe('checker', () => {
  describe('checkBaselineFeature', () => {
    it('should return correct status for widely available feature', async () => {
      const result = await checkBaselineFeature('css.grid', 'high');
      expect(result.status).toBe('widely-available');
      expect(result.score).toBe(1.0);
    });

    it('should handle unknown features gracefully', async () => {
      const result = await checkBaselineFeature('css.unknown', 'high');
      expect(result.status).toBe('unknown');
      expect(result.score).toBe(0);
    });
  });
});
```

### Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage

# Run specific test file
npm test test/core/checker.test.js

# Run tests matching pattern
npm test -- --grep "checkBaselineFeature"
```

---

## TypeScript Development

### Type Definitions

All APIs include comprehensive TypeScript definitions:

```typescript
// Core types
export interface AnalysisResult {
  score: number;
  issues: Issue[];
  features: BaselineFeature[];
}

export interface Issue {
  file: string;
  line: number;
  column: number;
  feature: string;
  status: 'widely-available' | 'newly-available' | 'limited';
  level: 'error' | 'warning' | 'info';
  message: string;
}

export interface BaselineFeature {
  id: string;
  status: 'widely-available' | 'newly-available' | 'limited';
  score: number;
  support: BrowserSupport;
}
```

### Development Setup

```bash
# Install TypeScript dependencies
npm install --save-dev typescript @types/node @types/jest ts-node

# Type checking in watch mode
npm run type-check:watch

# Build in watch mode
npm run build:watch
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "test", "dist"]
}
```

---

## Performance Development

### LRU Cache Implementation

The project includes a sophisticated LRU cache system:

```javascript
// Cache configuration
const cache = createLRUCache({
  bcdCacheSize: 5000,
  featureCacheSize: 1000,
  ttl: 3600000
});

// Cache usage
const result = await bcdCache.get(featureId, async () => {
  return await fetchBaselineData(featureId);
});
```

### Performance Monitoring

```javascript
// Performance tracking
const timer = performanceMonitor.startOperation('file-analysis');
try {
  const result = await analyzeFile(filePath);
  performanceMonitor.endOperation(timer, true);
  return result;
} catch (error) {
  performanceMonitor.endOperation(timer, false);
  throw error;
}
```

### Optimization Guidelines

1. **Use caching effectively** - Cache BCD lookups and feature data
2. **Batch operations** - Process files in batches for large projects
3. **Memory management** - Use LRU eviction and proper cleanup
4. **Async operations** - Use async/await for I/O operations
5. **Error boundaries** - Handle errors gracefully without crashing

---

## File Handling

### Automatic Cleanup

All file operations include automatic cleanup:

```javascript
// Read file with cleanup
const content = await readFileWithCleanup('./file.js', {
  encoding: 'utf-8',
  maxSize: 50 * 1024 * 1024 // 50MB limit
});

// Write file with cleanup
await writeFileWithCleanup('./output.json', JSON.stringify(data));

// Check active handles
console.log(`Active handles: ${getActiveFileHandleCount()}`);
```

### Temporary Files

```javascript
// Create temporary file
const tempPath = await createTempFile('content', {
  prefix: 'baseline-lint-',
  suffix: '.tmp'
});

// Cleanup all temporary files
await cleanupTempFiles();
```

---

## Error Handling

### Custom Error Types

```javascript
// Define custom errors
export class BaselineLintError extends Error {
  constructor(message, code, context) {
    super(message);
    this.name = 'BaselineLintError';
    this.code = code;
    this.context = context;
  }
}

export class ParseError extends BaselineLintError {
  constructor(message, file, line, column) {
    super(message, 'PARSE_ERROR', { file, line, column });
    this.name = 'ParseError';
  }
}
```

### Error Handling Patterns

```javascript
// Safe async wrapper
async function safeAsyncOperation(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ParseError) {
      logger.warn('Parse error', { error: error.message, context: error.context });
      return { success: false, error: error.message };
    }
    throw error;
  }
}
```

---

## CLI Development

### Command Structure

```javascript
// CLI command structure
const commands = {
  check: {
    description: 'Check files for Baseline compatibility',
    options: {
      level: { type: 'string', default: 'newly' },
      format: { type: 'string', default: 'text' },
      failOnError: { type: 'boolean', default: false }
    },
    handler: async (args, options) => {
      // Command implementation
    }
  }
};
```

### Adding New Commands

1. Add command definition to CLI structure
2. Implement command handler
3. Add tests for the command
4. Update documentation

---

## CI/CD Development

### Local CI Testing

```bash
# Run the same tests as CI
npm run test:all              # All tests
npm run type-check           # TypeScript validation
npm audit --audit-level moderate  # Security audit
npm run performance          # Performance benchmarks

# Self-baseline check (like CI)
baseline-lint check ./src --fail-on-error

# Test package installation (like CI)
npm pack
npm install -g baseline-lint-*.tgz
baseline-lint --version
```

### GitHub Actions

The project includes comprehensive CI/CD workflows:

- **Multi-platform testing** (Ubuntu, Windows, macOS)
- **Multi-Node.js version support** (16, 18, 20)
- **Security auditing** with vulnerability scanning
- **Performance benchmarking** and monitoring
- **Self-baseline checking**

---

## Contributing

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Write tests**
5. **Run the test suite**
6. **Submit a pull request**

### Code Style

- Use ESLint for code formatting
- Follow existing naming conventions
- Write comprehensive tests
- Update documentation

### Pull Request Guidelines

- Include tests for new features
- Update documentation
- Ensure all tests pass
- Follow the existing code style

---

## Debugging

### Debug Mode

```bash
# Enable debug logging
BASELINE_LINT_LOG_LEVEL=debug baseline-lint check ./src

# Verbose output
baseline-lint check ./src --verbose
```

### Common Issues

**Tests failing:**
```bash
# Clear cache and reinstall
npm run clean
npm install
npm test
```

**Type errors:**
```bash
# Check TypeScript configuration
npm run type-check

# Rebuild types
npm run build
```

**Performance issues:**
```bash
# Check cache statistics
baseline-lint performance

# Clear cache
baseline-lint cleanup
```

---

## Release Process

### Version Management

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Push to GitHub
5. CI/CD handles npm publishing

### Release Commands

```bash
# Create release
npm run release

# Publish to npm
npm publish

# Create GitHub release
npm run github-release
```

---

*For more information, see the [complete documentation](DOCUMENTATION.md) or [CLI reference](CLI.md).*
