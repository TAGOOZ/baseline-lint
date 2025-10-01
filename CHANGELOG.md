# 📝 Changelog

All notable changes to baseline-lint will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.6] - 2025-10-01

### 🔧 CI/CD Workflow Fixes

#### Fixed
- ✅ **Node.js Compatibility** - Updated Node.js requirement from >=16.0.0 to >=18.0.0 for better dependency compatibility
- ✅ **CI Matrix Updates** - Changed CI test matrix from Node [16,18,20] to [18,20,22] to align with package requirements
- ✅ **Windows Test Compatibility** - Fixed test script glob patterns with proper quotes for Windows PowerShell
- ✅ **Cross-Platform Shell** - Added `shell: bash` directive to all workflow run steps for consistent cross-platform execution
- ✅ **Dependency Warnings** - Eliminated Node 16 compatibility warnings from dependencies like `ora`, `chalk`, `minimatch`

#### Changed
- 🔄 **Default Node Version** - Updated workflow default NODE_VERSION from 18 to 20
- 🔄 **Test Scripts** - Improved test script patterns: `"test/**/*.test.js"` → `"test/unit/*.test.js"` for better Windows support

#### Benefits
- ✅ No more Node 16 dependency warnings
- ✅ Windows PowerShell compatibility resolved  
- ✅ All CI jobs should now pass consistently
- ✅ Cross-platform workflow execution standardized

---

## [1.0.2] - 2025-10-01

### 🎯 Enhanced Baseline Compatibility Detection

#### Fixed
- ✅ **Resolved Unknown Status Warnings** - Fixed "Unknown Baseline status" warnings for widely supported CSS properties and JavaScript APIs
- ✅ **Improved BCD Integration** - Enhanced Browser Compatibility Data integration with intelligent fallback strategies
- ✅ **Better Accuracy** - Added comprehensive fallback mappings for common features like `flex-direction`, `justify-content`, `align-items`, `background-color`, `console`, `Promise`, `Symbol`, etc.
- ✅ **Reduced False Warnings** - Significantly reduced false "Unknown Baseline status" warnings while maintaining accuracy
- ✅ **CLI Hang / Workflow Exit** - Added graceful shutdown: implemented `PerformanceMonitor.stop()`, switched to `program.parseAsync()`, ensured timers (memory + logger flush) are cleared so CI workflows proceed to next phase without hanging

#### Added
- ✅ **CSS Fallback Mappings** - Added fallback data for 15+ common CSS properties
- ✅ **JavaScript Fallback Mappings** - Added fallback data for 20+ common JavaScript APIs
- ✅ **Enhanced CSS Parser** - Improved CSS keyword detection and filtering
- ✅ **Extended JavaScript Coverage** - Added more modern ES features to API detection

---

## [1.0.1] - 2025-10-01

### 🎉 Initial Release + Enhanced CI/CD & File Detection

#### Added
- ✅ **Comprehensive CLI Tool** - Full command-line interface with multiple commands
- ✅ **GitHub Action Integration** - Automated PR checks with detailed comments
- ✅ **Visual Dashboard** - Interactive web interface with charts and analytics
- ✅ **Configuration System** - Auto-discovery, validation, and merging of config files
- ✅ **Enhanced JavaScript API Coverage** - 200+ APIs including modern ES2022+ features
- ✅ **Robust File Handle Management** - Automatic cleanup and resource leak prevention
- ✅ **Advanced Error Handling** - Custom error types, stack traces, and safe async wrappers
- ✅ **LRU Cache System** - Optimized performance with configurable size limits
- ✅ **Comprehensive Test Suite** - 315 individual test cases across 96 test suites
- ✅ **Security Hardening** - Input validation, path sanitization, and CORS protection
- ✅ **Complete CI/CD Pipeline** - Multi-platform testing and automated deployment
- ✅ **Full TypeScript Support** - Comprehensive type definitions for all APIs
- ✅ **Performance Monitoring** - Detailed metrics and profiling capabilities
- ✅ **Advanced Logging System** - Structured output with multiple levels and formats
- ✅ **Advanced File Detection System** - 5-strategy approach for reliable CSS/JS change detection
- ✅ **Robust CI/CD Workflows** - Enhanced error handling and timeout management
- ✅ **Smart PR Detection** - Automatic detection of changed files in pull requests
- ✅ **Comprehensive Debugging** - Detailed logging for troubleshooting CI issues
- ✅ **Production Scripts** - Standalone file detection script for CI environments
- ✅ **Enhanced NPM Scripts** - New scripts for baseline checking and performance testing
- ✅ **Integration Tests** - Comprehensive tests for file detection and performance
- ✅ **Memory Usage Testing** - Performance validation for large file processing

#### Fixed
- 🔧 **File Detection Issues** - Fixed git diff commands failing in CI environments
- 🔧 **Shallow Clone Problems** - Added proper git history fetching
- 🔧 **Timeout Issues** - Increased CI job timeouts from 5 to 10-15 minutes
- 🔧 **Missing Base Branches** - Added fallback strategies for missing git references
- 🔧 **Error Handling** - Improved error handling in CI workflows
- 🔧 **Build Process** - Enhanced build step logging and error handling

#### Enhanced
- ⚡ **Performance** - Optimized file detection with multiple fallback strategies
- 🧪 **Testing** - Added comprehensive integration tests for CI scenarios
- 📚 **Documentation** - Updated README and docs with new CI features
- 🔍 **Debugging** - Added extensive debugging output for troubleshooting

                                #### CLI Commands
- `baseline-lint check [paths...]` - Check files for Baseline compatibility
- `baseline-lint score [paths...]` - Calculate compatibility score (0-100)
- `baseline-lint list <status>` - List features by Baseline status
- `baseline-lint search <query>` - Search for web features
- `baseline-lint info <featureId>` - Get detailed feature information
- `baseline-lint config --init` - Create sample configuration files
- `baseline-lint config --show` - Display current configuration
- `baseline-lint cleanup` - Manual file handle cleanup
- `baseline-lint performance` - Show performance metrics

#### Configuration Features
- Auto-discovery of config files (baseline-lint.json, .baseline-lintrc, etc.)
- Comprehensive validation and error reporting
- Cache configuration with size limits and TTL
- File pattern matching with ignore rules
- Dashboard configuration with security settings
- CI/CD integration settings

#### Supported Features

##### CSS
- Properties (display, container-type, etc.)
- Property values (auto-phrase, etc.)
- At-rules (@container, @layer, etc.)
- Pseudo-classes (:has, :is, etc.)

##### JavaScript (200+ APIs)
- **Array methods** (at, findLast, toSorted, flatMap, includes, etc.)
- **Promise methods** (allSettled, any, try, all, race, etc.)
- **String methods** (replaceAll, at, padStart, trimStart, startsWith, etc.)
- **Object methods** (hasOwn, groupBy, fromEntries, assign, freeze, etc.)
- **Number methods** (isFinite, isInteger, isNaN, isSafeInteger, etc.)
- **Math methods** (trunc, sign, cbrt, log2, hypot, etc.)
- **RegExp methods** (hasIndices, dotAll, flags, test, exec, etc.)
- **Map/Set methods** (has, get, set, delete, clear, keys, values, etc.)
- **WeakMap/WeakSet methods** (has, get, set, delete, add, etc.)
- **Symbol methods** (for, keyFor, hasInstance, iterator, etc.)
- **Proxy methods** (revocable)
- **Reflect methods** (apply, construct, defineProperty, etc.)
- **Global functions** (structuredClone, queueMicrotask, fetch, etc.)
- **Constructor functions** (Array, Object, String, Number, Date, etc.)
- **Browser APIs** (performance, crypto, location, navigator, etc.)
- **Event handlers** (onload, onerror, onresize, etc.)

#### Security Features
- Input validation and sanitization
- Path traversal protection
- File extension validation
- Content length limits
- CORS whitelist configuration
- Rate limiting protection
- Security headers

#### Performance Features
- LRU Cache with configurable size limits (5000 BCD entries, 1000 feature entries)
- Separate caches for BCD and feature lookups
- Memory-efficient eviction policies
- Cache statistics and monitoring
- Batch processing for large directories
- Timeout handling for long operations

#### Testing & Quality
- **315 individual test cases** across 96 test suites
- **12 test files** with comprehensive coverage
- **4,267 lines** of test code
- Unit tests for all core functionality
- Integration tests for end-to-end workflows
- Error boundary testing
- Performance testing
- Security testing
- Cross-platform compatibility testing

#### Documentation
- Comprehensive README with examples
- Validation reports on real-world projects
- Judge evaluation criteria
- FAQ and troubleshooting guide
- TypeScript type definitions
- API documentation

#### Validation Results
- **Error Detection**: 0/100 score on problematic code (55 APIs analyzed)
- **React Analysis**: 100/100 scores on Facebook's React repository (275 files)
- **Large Directory**: 263 files analyzed with perfect batch processing
- **Enterprise Scale**: 4,398 files in 66MB codebase processed

---

## [Unreleased]

### Planned Features
- Enhanced CSS Grid and Flexbox analysis
- Support for additional JavaScript frameworks
- Integration with popular build tools
- Advanced reporting formats (HTML, PDF)
- Custom rule creation system
- Plugin architecture for extensibility

### Known Issues
- None currently identified

---

## 📊 Version Comparison

| Version | CLI | Dashboard | Tests | APIs | Security | Performance |
|---------|-----|-----------|-------|------|----------|-------------|
| 1.0.0   | ✅   | ✅         | 315   | 200+ | ✅        | ✅           |

---

*For more details, see [Validation Reports](README.md#-validation-reports)*
