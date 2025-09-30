# 🎯 CLI Commands Reference

> Complete reference for all baseline-lint command-line interface commands

---

## Overview

baseline-lint provides a comprehensive CLI with multiple commands for checking, scoring, searching, and managing Baseline compatibility.

---

## Global Options

All commands support these global options:

- `-h, --help` - Show help information
- `-V, --version` - Show version number
- `-v, --verbose` - Enable verbose output
- `-q, --quiet` - Suppress non-essential output

---

## Commands

### `check [paths...]`

Check files for Baseline compatibility issues.

#### Syntax
```bash
baseline-lint check [paths...] [options]
```

#### Arguments
- `paths` - File or directory paths to check (default: current directory)

#### Options
- `-l, --level <level>` - Baseline level: `widely` or `newly` (default: `newly`)
- `-f, --format <format>` - Output format: `text`, `json`, or `markdown` (default: `text`)
- `--no-warnings` - Show only errors, hide warnings
- `--fail-on-error` - Exit with code 1 if issues found
- `--css-only` - Check only CSS files
- `--js-only` - Check only JavaScript files
- `--score` - Include compatibility score in output
- `-c, --config <path>` - Path to configuration file
- `--no-cache` - Disable caching
- `--cache-only` - Use only cached results
- `--timeout <ms>` - Analysis timeout in milliseconds (default: 30000)

#### Examples
```bash
# Check current directory
baseline-lint check

# Check specific files
baseline-lint check ./src/styles.css ./src/app.js

# Check with stricter level
baseline-lint check ./src --level widely

# JSON output for CI/CD
baseline-lint check ./src --format json --fail-on-error

# CSS files only
baseline-lint check ./styles --css-only

# With custom config
baseline-lint check ./src --config ./my-config.json
```

#### Output Formats

**Text Format (default):**
```
📊 Baseline Compatibility Report

Score: 87/100

🎨 src/styles/main.css
──────────────────────
  ❌ 15:3 - word-break: auto-phrase
    Limited availability: Not yet Baseline

  ⚠️ 42:5 - container-type: inline-size
    Newly available: Use with caution (since 2023-02-14)
```

**JSON Format:**
```json
{
  "score": 87,
  "totalFiles": 2,
  "issues": [
    {
      "file": "src/styles/main.css",
      "line": 15,
      "column": 3,
      "feature": "word-break: auto-phrase",
      "status": "limited",
      "level": "error",
      "message": "Limited availability: Not yet Baseline"
    }
  ]
}
```

---

### `score [paths...]`

Calculate Baseline compatibility score (0-100).

#### Syntax
```bash
baseline-lint score [paths...] [options]
```

#### Options
- `-l, --level <level>` - Baseline level: `widely` or `newly` (default: `newly`)
- `-f, --format <format>` - Output format: `number`, `text`, or `json` (default: `number`)
- `--css-only` - Score only CSS files
- `--js-only` - Score only JavaScript files
- `-c, --config <path>` - Path to configuration file

#### Examples
```bash
# Get score for current directory
baseline-lint score

# Get score for specific directory
baseline-lint score ./src

# Text format with details
baseline-lint score ./src --format text

# JSON format with metadata
baseline-lint score ./src --format json
```

#### Output Examples

**Number format:**
```
87
```

**Text format:**
```
Score: 87/100
```

**JSON format:**
```json
{
  "score": 87,
  "total": 100,
  "breakdown": {
    "widelyAvailable": 70,
    "newlyAvailable": 30,
    "limited": 0
  }
}
```

---

### `list <status>`

List features by Baseline status.

#### Syntax
```bash
baseline-lint list <status> [options]
```

#### Arguments
- `status` - Feature status: `widely`, `newly`, or `limited`

#### Options
- `--group <type>` - Filter by feature type: `css` or `js`
- `--limit <number>` - Limit number of results (default: 50)
- `-f, --format <format>` - Output format: `text` or `json` (default: `text`)

#### Examples
```bash
# List widely available features
baseline-lint list widely

# List newly available CSS features
baseline-lint list newly --group css

# List limited JavaScript features
baseline-lint list limited --group js

# JSON format with limit
baseline-lint list widely --format json --limit 10
```

---

### `search <query>`

Search for web features by name or description.

#### Syntax
```bash
baseline-lint search <query> [options]
```

#### Arguments
- `query` - Search term (supports partial matches)

#### Options
- `--group <type>` - Filter by feature type: `css` or `js`
- `--status <status>` - Filter by Baseline status: `widely`, `newly`, or `limited`
- `--limit <number>` - Limit number of results (default: 20)
- `-f, --format <format>` - Output format: `text` or `json` (default: `text`)

#### Examples
```bash
# Search for grid features
baseline-lint search "grid"

# Search for container query features
baseline-lint search "container"

# Search CSS features only
baseline-lint search "flex" --group css

# Search with specific status
baseline-lint search "array" --status newly

# JSON format
baseline-lint search "promise" --format json
```

---

### `info <featureId>`

Get detailed information about a specific feature.

#### Syntax
```bash
baseline-lint info <featureId> [options]
```

#### Arguments
- `featureId` - Feature identifier (e.g., `css.grid`, `js.array.at`)

#### Options
- `-f, --format <format>` - Output format: `text` or `json` (default: `text`)

#### Examples
```bash
# Get info about CSS Grid
baseline-lint info css.grid

# Get info about Array.at method
baseline-lint info js.array.at

# Get info about container queries
baseline-lint info css.container-queries

# JSON format
baseline-lint info css.grid --format json
```

#### Output Example
```
Feature: CSS Grid Layout (css.grid)

Status: Widely Available
Available Since: 2017-03-14
Support: Chrome 57+, Firefox 52+, Safari 10.1+

Description:
CSS Grid Layout is a two-dimensional layout system for the web.

Browser Support:
- Chrome: 57+
- Chrome Android: 57+
- Edge: 16+
- Firefox: 52+
- Safari: 10.1+
- Safari iOS: 10.3+

Usage:
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}
```

---

### `config`

Configuration management commands.

#### Subcommands

##### `config --init`
Create a sample configuration file.

```bash
baseline-lint config --init
# Creates baseline-lint.json with default settings
```

##### `config --show`
Display current configuration.

```bash
baseline-lint config --show
# Shows merged configuration from all sources
```

##### `config --validate <path>`
Validate a configuration file.

```bash
baseline-lint config --validate ./my-config.json
```

---

### `cleanup`

Cleanup file handles and temporary files.

#### Syntax
```bash
baseline-lint cleanup [options]
```

#### Options
- `--force` - Force cleanup without confirmation
- `--verbose` - Show detailed cleanup information

#### Examples
```bash
# Interactive cleanup
baseline-lint cleanup

# Force cleanup
baseline-lint cleanup --force

# Verbose cleanup
baseline-lint cleanup --verbose
```

---

### `performance`

Show performance metrics and statistics.

#### Syntax
```bash
baseline-lint performance [options]
```

#### Options
- `--clear` - Clear all performance metrics
- `--export <path>` - Export metrics to file (JSON or CSV)
- `--reset` - Reset performance counters

#### Examples
```bash
# Show current metrics
baseline-lint performance

# Clear metrics
baseline-lint performance --clear

# Export to JSON
baseline-lint performance --export metrics.json

# Export to CSV
baseline-lint performance --export metrics.csv
```

---

## Exit Codes

baseline-lint uses the following exit codes:

- `0` - Success, no issues found
- `1` - Issues found (when using `--fail-on-error`)
- `2` - Invalid command or options
- `3` - File system errors
- `4` - Configuration errors
- `5` - Network or API errors

---

## Environment Variables

- `BASELINE_LINT_CONFIG` - Path to configuration file
- `BASELINE_LINT_CACHE_DIR` - Cache directory path
- `BASELINE_LINT_LOG_LEVEL` - Log level (error, warn, info, debug, trace)
- `BASELINE_LINT_TIMEOUT` - Default timeout in milliseconds
- `BASELINE_LINT_NO_CACHE` - Disable caching (set to `true`)

---

## Configuration Integration

All CLI commands respect configuration files and can be overridden with command-line options. Configuration is merged in this order:

1. Default configuration
2. Configuration file (`baseline-lint.json`, etc.)
3. Environment variables
4. Command-line options (highest priority)

---

## Examples

### Basic Workflow
```bash
# Check your project
baseline-lint check ./src

# Get compatibility score
baseline-lint score ./src

# Search for specific features
baseline-lint search "container"

# Get detailed info
baseline-lint info css.container-queries
```

### CI/CD Integration
```bash
# Fail on errors for CI
baseline-lint check ./src --fail-on-error --format json

# Get score for monitoring
SCORE=$(baseline-lint score ./src)
echo "Compatibility score: $SCORE"
```

### Development Workflow
```bash
# Quick check during development
baseline-lint check ./src --no-warnings

# Detailed analysis
baseline-lint check ./src --level widely --score

# Search for alternatives
baseline-lint search "flexbox" --group css
```

---

*For more information, see the [complete documentation](DOCUMENTATION.md) or [configuration guide](CONFIGURATION.md).*
