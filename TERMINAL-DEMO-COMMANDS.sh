# Terminal Demo Commands for baseline-lint Video
# Copy and paste these commands for your hackathon demo

# ================================
# INSTALLATION DEMO
# ================================

# Install baseline-lint globally
npm install -g baseline-lint

# Verify installation
baseline-lint --version
baseline-lint --help

# ================================
# BASIC USAGE DEMO  
# ================================

# Check a single file
baseline-lint check ./demo-examples.css

# Expected output for problematic file:
# 📁 Scanning: ./demo-examples.css
# 
# ❌ LIMITED SUPPORT (Needs fallbacks)
#    • CSS Subgrid (baseline: false)
#    • CSS color-mix() function (baseline: false)  
#    • CSS :has() selector (baseline: false)
#
# ⚠️  NEWLY AVAILABLE (Use with caution)
#    • CSS Container Queries (baseline: low, since 2023-02)
#    • CSS View Transitions (baseline: low, since 2023-12)
#
# ✅ WIDELY AVAILABLE (Safe to use)
#    • CSS Grid Layout (baseline: high, since 2020-01)
#    • CSS Custom Properties (baseline: high, since 2019-05)
#    • CSS Flexbox (baseline: high, since 2017-03)
#
# 📊 Baseline Score: 65/100 ⚠️  NEEDS IMPROVEMENT
# 💡 Consider adding @supports rules for limited features

# ================================
# SCORING DEMO
# ================================

# Get overall project score
baseline-lint score ./src

# Expected output:
# 📊 Project Baseline Compatibility Report
# 
# Files Scanned: 12
# Total Features: 38
# 
# Status Breakdown:
# ✅ Widely Available: 28 features (74%)
# ⚠️  Newly Available: 7 features (18%) 
# ❌ Limited Support: 3 features (8%)
# 
# Overall Score: 82/100 ✅ GOOD
# Recommendation: Consider fallbacks for 3 limited features

# ================================
# ADVANCED USAGE DEMO
# ================================

# Check with JSON output
baseline-lint check ./demo-examples.css --format json

# Check with score included
baseline-lint check ./demo-examples.css --score

# Save report to file
baseline-lint check ./src --format json --output baseline-report.json

# Check specific file types only
baseline-lint check ./src/**/*.css

# ================================
# SEARCH FEATURES DEMO
# ================================

# Search for specific features
baseline-lint search "grid"

# Expected output:
# Found 8 features:
# 
# ✅ Grid (grid)
#   CSS grid is a two-dimensional layout system, which lays content out in rows and columns....
# 
# ⚠️ Subgrid (subgrid)
#   The subgrid value for the grid-template-columns and grid-template-rows properties allows a grid item...
# 
# ❌ Masonry (masonry)
#   Masonry is a type of CSS grid layout where the items on one of the axes are tightly packed together,...

# Search container queries
baseline-lint search "container"

# ================================
# LIST FEATURES DEMO
# ================================

# List newly available CSS features
baseline-lint list newly --group css

# Expected output:
# NEWLY Available Features (0):

# List widely available features (first 10)
baseline-lint list widely | head -10

# Expected output:
# WIDELY Available Features (552):
# 
#   • <a>
#     undefined - since 2015-07-29
#     The <a> element creates a hyperlink to any resource that's accessible via a URL,...
# 
#   • <abbr>
#     undefined - since 2015-07-29
#     The <abbr> HTML element represents an abbreviation or acronym....

# List limited support features  
baseline-lint list limited | head -10# ================================
# CONFIGURATION DEMO
# ================================

# Initialize configuration file
baseline-lint config --init

# This creates baseline-lint.config.js:
# export default {
#   target: 'newly',
#   ignore: [],
#   output: {
#     format: 'cli',
#     includeDetails: true
#   },
#   thresholds: {
#     error: 50,
#     warning: 75
#   }
# };

# Check with custom config
baseline-lint check ./src --config ./baseline-lint.config.js

# ================================
# CI/CD INTEGRATION DEMO
# ================================

# Check changed files only (for CI/CD)
git diff --name-only HEAD~1 HEAD | grep -E '\.(css|js)$' | xargs baseline-lint check

# Exit code usage for CI/CD
baseline-lint check ./src
echo "Exit code: $?"
# Exit 0: All good
# Exit 1: Warnings found
# Exit 2: Errors found

# ================================
# PERFORMANCE DEMO
# ================================

# Run performance benchmark
baseline-lint performance

# Expected output:
# 🚀 baseline-lint Performance Benchmark
# 
# Test Results:
# ├── File parsing: 1.2ms per file
# ├── Feature detection: 0.8ms per feature  
# ├── Baseline lookup: 0.3ms per feature
# └── Report generation: 2.1ms total
# 
# Memory Usage:
# ├── Peak memory: 45.2 MB
# └── Cache efficiency: 94%
# 
# Recommendations:
# • Performance is optimal for projects up to 1000 files
# • Cache hit rate excellent - no optimization needed

# Export performance results
baseline-lint performance --export performance-results.json

# ================================
# REAL-WORLD DEMO SCENARIO
# ================================

# Create a test directory with problematic CSS
mkdir baseline-demo
cd baseline-demo

# Create a problematic CSS file
cat > modern.css << 'EOF'
.container {
  display: grid;
  grid-template-columns: subgrid;
  container-type: inline-size;
  background: color-mix(in srgb, red, blue);
}

@container (min-width: 400px) {
  .container {
    gap: 2rem;
  }
}

.card:has(.image) {
  grid-template-areas: "image content";
}
EOF

# Check the problematic file
baseline-lint check modern.css

# Create a baseline-compatible version
cat > baseline.css << 'EOF'
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  background: linear-gradient(45deg, red, blue);
}

@supports (container-type: inline-size) {
  .container {
    container-type: inline-size;
  }
  
  @container (min-width: 400px) {
    .container {
      gap: 2rem;
    }
  }
}

@supports selector(:has(*)) {
  .card:has(.image) {
    grid-template-areas: "image content";
  }
}
EOF

# Check the improved file
baseline-lint check baseline.css

# Compare scores
echo "=== BEFORE (problematic) ==="
baseline-lint score modern.css

echo "=== AFTER (baseline-compatible) ==="
baseline-lint score baseline.css

# ================================
# DASHBOARD DEMO SETUP
# ================================

# Navigate to dashboard (if showing the Next.js interface)
cd ../baseline-dashboard
npm install
npm run dev

# Dashboard will be available at http://localhost:3000
# Show:
# 1. File browser interface
# 2. Interactive scanning  
# 3. Visual reports with charts
# 4. Detailed feature breakdowns

# ================================
# GITHUB ACTIONS DEMO
# ================================

# Show sample GitHub Actions workflow file
cat > .github/workflows/baseline-check.yml << 'EOF'
name: Baseline Compatibility Check
on: [pull_request]

jobs:
  baseline-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install baseline-lint
        run: npm install -g baseline-lint
      
      - name: Check baseline compatibility
        run: |
          CHANGED_FILES=$(git diff --name-only HEAD~1 | grep -E '\.(css|js)$')
          if [ -n "$CHANGED_FILES" ]; then
            baseline-lint check $CHANGED_FILES --score
          fi
EOF

# ================================
# CLEANUP
# ================================

# Clean up demo files
cd ..
rm -rf baseline-demo
