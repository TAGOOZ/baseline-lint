# baseline-lint 🎯

> Automated Baseline compatibility checking for modern web development. Know instantly if your CSS and JavaScript features work across all modern browsers.

[![Baseline Compatible](https://img.shields.io/badge/Baseline-Compatible-green.svg)](https://web.dev/baseline)
[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](https://www.npmjs.com/package/baseline-lint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD Pipeline](https://github.com/TAGOOZ/baseline-lint/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/TAGOOZ/baseline-lint/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Supported-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)

**Built for the [Baseline Tooling Hackathon](https://baseline-tooling-hackathon.devpost.com/) by Google Chrome** 🏆

---

## 🚀 What is This?

**baseline-lint** is a comprehensive tooling suite that helps developers ensure their web applications use features that work across **all modern browsers**. Stop guessing, start knowing!

### The Problem 😫
- 🤔 "Is this CSS property safe to use?"
- 🔍 Constantly checking caniuse.com
- 📚 Reading dozens of compatibility tables
- ⏰ Wasting hours researching browser support

### The Solution ✨
- ✅ Instant compatibility checks for CSS & JavaScript
- 📊 Real-time Baseline scoring (0-100)
- 🤖 Automated GitHub Action with smart file detection
- 📈 Beautiful visual dashboard
- 🔒 Enhanced security with input validation
- ⚡ LRU Cache with size limits for optimal performance
- 🧪 Comprehensive unit and integration tests (315 test cases)
- 📘 Complete TypeScript support
- 🛡️ Robust CI/CD workflows with multiple fallback strategies
- 🔍 Advanced file detection for changed CSS/JS files in PRs

---

## 🎯 What is Baseline?

[Baseline](https://web.dev/baseline) is Google Chrome's initiative to identify web features that are **safe to use** across all major browsers:

| Status | Meaning | Use It? |
|--------|---------|---------|
| ✅ **Widely Available** | Stable for 30+ months | **Yes! Safe for production** |
| ⚠️ **Newly Available** | Just reached cross-browser support | Use with caution |
| ❌ **Limited** | Not yet supported everywhere | Avoid or use polyfills |

---

## ⚡ Quick Start

### Install & Run

```bash
# Install globally
npm install -g baseline-lint

# Check your project
baseline-lint check ./src

# Calculate compatibility score
baseline-lint score ./src
```

### Or use directly with npx (no install)

```bash
npx baseline-lint check ./styles
```

---

## 📦 Core Features

### 1️⃣ CLI Tool
```bash
baseline-lint check ./src          # Check files
baseline-lint score ./src          # Get compatibility score
baseline-lint search "grid"        # Search features
baseline-lint list newly --group css # List features
baseline-lint config --init        # Setup configuration
```

### 2️⃣ GitHub Action
```yaml
# .github/workflows/baseline-check.yml
name: Baseline Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for proper file detection
      - run: npm install -g baseline-lint
      - run: baseline-lint check ./src --score
```

**Advanced Features:**
- 🔍 **Smart File Detection**: Automatically detects changed CSS/JS files in PRs
- 📊 **Baseline Scoring**: Calculates compatibility scores for changed files
- 💬 **PR Comments**: Posts detailed compatibility reports on pull requests
- 🛡️ **Robust Error Handling**: Multiple fallback strategies for reliable detection

### 3️⃣ Visual Dashboard
```bash
npm run dashboard
# Opens http://localhost:3000
```

---

## 🎨 Example Output

```
📊 Baseline Compatibility Report

Score: 87/100

🎨 src/styles/main.css
──────────────────────
  ❌ 15:3 - word-break: auto-phrase
    Limited availability: Not yet Baseline

  ⚠️ 42:5 - container-type: inline-size
    Newly available: Use with caution (since 2023-02-14)

⚡ src/utils/helpers.js
──────────────────────
  ⚠️ 23:12 - Array.prototype.at
    Newly available: Use with caution (since 2022-03-14)

──────────────────────────────────────────────
Summary:
  Files with issues: 2
  Errors: 1
  Warnings: 2
```

---

## 🔧 Installation

### Global Installation
```bash
npm install -g baseline-lint
```

### Project Installation
```bash
npm install --save-dev baseline-lint
```

Add to `package.json`:
```json
{
  "scripts": {
    "lint:baseline": "baseline-lint check ./src",
    "score": "baseline-lint score ./src"
  }
}
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **[📚 Complete Documentation](docs/DOCUMENTATION.md)** | Full documentation with all features and examples |
| **[⚙️ Configuration Guide](docs/CONFIGURATION.md)** | Detailed configuration options and examples |
| **[🎯 CLI Commands](docs/CLI.md)** | Complete CLI command reference |
| **[📘 TypeScript Support](docs/TYPESCRIPT.md)** | TypeScript usage and type definitions |
| **[🤖 GitHub Actions](docs/GITHUB_ACTIONS.md)** | CI/CD integration guide |
| **[🏗️ Architecture](docs/ARCHITECTURE.md)** | Technical architecture and how it works |
| **[🧪 Testing](docs/TESTING.md)** | Test suite details and quality metrics |
| **[🔒 Security](docs/SECURITY.md)** | Security features and best practices |
| **[⚡ Performance](docs/PERFORMANCE.md)** | Performance optimization and caching |

---

## 📊 Validation Reports

baseline-lint has been extensively validated on real-world projects:

### 🎯 Error Detection Validation
- **[Error Detection Report](error-detection-report.md)** - Proves accurate error detection with 0/100 score on problematic code
- **55 API usages analyzed** with 1 error and 54 warnings correctly identified
- **Zero false positives** - demonstrates tool reliability

### ⚛️ React Library Validation  
- **[React Analysis Report](react-baseline-marketing-report.md)** - Comprehensive analysis of Facebook's React repository
- **275 files analyzed** with perfect 100/100 compatibility scores
- **4,398 total files** processed in 66MB codebase

### 🚀 Large Directory Performance
- **[Large Directory Report](react-large-directory-report.md)** - Optimized batch processing validation
- **263 files analyzed** with configurable batch sizes
- **Enterprise-scale** performance testing

---

## 🎓 Supported Features

### CSS
- Properties (display, container-type, etc.)
- Property values (auto-phrase, etc.)
- At-rules (@container, @layer, etc.)
- Pseudo-classes (:has, :is, etc.)

### JavaScript (200+ APIs)
- **Array methods** (at, findLast, toSorted, flatMap, includes, etc.)
- **Promise methods** (allSettled, any, try, all, race, etc.)
- **String methods** (replaceAll, at, padStart, trimStart, startsWith, etc.)
- **Object methods** (hasOwn, groupBy, fromEntries, assign, freeze, etc.)
- **Browser APIs** (performance, crypto, location, navigator, etc.)
- And many more...

---

## 📊 Scoring System

Score calculation:
- **Widely Available:** 1.0 points
- **Newly Available:** 0.7 points  
- **Limited:** 0.0 points

```
Score = (Total Weight / Total Features) × 100
```

---

## 🛠️ Development

```bash
# Clone and setup
git clone https://github.com/TAGOOZ/baseline-lint.git
cd baseline-lint
npm install

# Run tests
npm test

# Try it locally
./bin/cli.js check ./src
```

For detailed development setup, see [Development Guide](docs/DEVELOPMENT.md).

---

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md).

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/TAGOOZ/baseline-lint/issues)
- 💬 [Discussions](https://github.com/TAGOOZ/baseline-lint/discussions)
- 📧 Email: mostafatageldeen588@gmail.com

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and feature updates.

### Recent Highlights
- **v1.0.0**: Initial production release with comprehensive Baseline compatibility checking
- **315 test cases** across 96 test suites ensuring reliability
- **200+ JavaScript APIs** supported with full Baseline integration
- **Enterprise-grade** security and performance features
- **🛡️ Enhanced CI/CD**: Robust workflows with smart file detection and multiple fallback strategies
- **🔍 Advanced Detection**: 5-strategy file detection system for reliable CSS/JS change detection
- **⚡ Performance**: Optimized batch processing and memory management
- **🧪 Comprehensive Testing**: Integration tests for file detection, performance, and memory usage

---

## 🏆 Built for Baseline Tooling Hackathon

This project was created for the [Google Chrome Baseline Tooling Hackathon](https://baseline-tooling-hackathon.devpost.com/).

**Goal:** Accelerate adoption of modern web features by making Baseline data accessible in developer tools.

---

<p align="center">
  <strong>Made with ❤️ for the web development community</strong>
</p>

<p align="center">
  <a href="#-quick-start">Get Started</a> •
  <a href="#-core-features">Features</a> •
  <a href="#-documentation">Docs</a> •
  <a href="#-validation-reports">Examples</a>
</p>
