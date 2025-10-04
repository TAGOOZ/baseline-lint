# 🧪 baseline-lint Testing Guide

> Complete guide to testing the baseline-lint project

## Table of Contents

- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [Performance Tests](#performance-tests)
- [CI/CD Testing](#cicd-testing)
- [Large-scale Testing](#large-scale-testing)

## Unit Tests

baseline-lint includes comprehensive unit tests covering all core functionality:

```bash
# Run all unit tests
npm run test:unit

# Run specific unit test file
npx node --test test/unit/specific-test.test.js
```

## Integration Tests

Integration tests verify how baseline-lint components work together and with external dependencies:

```bash
# Run all integration tests
npm run test:integration
```

## Performance Tests

Performance tests ensure baseline-lint maintains high performance even with large codebases:

```bash
# Run performance tests
npm run test:performance

# Export performance metrics to JSON
npm run test:performance -- --export performance-results.json
```

## CI/CD Testing

Our CI/CD pipeline runs tests across multiple environments:

- **Operating Systems**: Ubuntu, Windows, macOS
- **Node.js Versions**: 18.x, 20.x, 22.x
- **Test Categories**: Unit, Integration, Performance, File Detection

## Large-scale Testing

We've tested baseline-lint with large-scale React codebases to ensure it can handle enterprise-level projects:

### Test Environment Setup

```bash
# Create test directory
mkdir -p ~/react-test-large/{js,css,components,fixtures}

# Download large CSS frameworks
cd ~/react-test-large/css
curl -O https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.css
curl -O https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.css
curl -O https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.css
```

### Performance Results

In our tests with large CSS frameworks:

| Framework | File Size | Processing Time |
|-----------|-----------|-----------------|
| Tailwind CSS | 3.6MB | ~16 seconds |
| Bootstrap | 280KB | ~3 seconds |
| Bulma | 245KB | ~3 seconds |

### Memory Usage

Memory usage remains reasonable even with large files:

```
Memory monitoring: {"rss":201498624,"heapTotal":119304192,"heapUsed":91964304}
```

### Compatibility Score Results

Our tool correctly identified compatibility issues in large frameworks:

```
$ baseline-lint score ~/react-test-large

📊 Baseline Compatibility Score
──────────────────────────────────────────────────

  78/100

Details:
  Total files analyzed: 28
  Total checks: 68145
  Errors: 118
  Warnings: 29781
```

These tests confirm baseline-lint is enterprise-ready and can handle large-scale production codebases effectively.
