#!/bin/bash
# Simulate PR workflow logic for testing

echo "=== Simulating PR Baseline Check Workflow ==="
echo ""

# Simulate the changed files detection
echo "=== File Detection Simulation ==="
CHANGED_FILES="test-pr-files/test-component.css test-pr-files/test-component.js"
echo "Changed files: $CHANGED_FILES"
echo ""

# Test baseline-lint installation
echo "=== Testing baseline-lint Installation ==="
which baseline-lint || echo "baseline-lint not found in PATH"
baseline-lint --version || {
    echo "baseline-lint version check failed"
    echo "result=failed"
    echo "score=0"
    echo "issues=0"
    exit 1
}
echo ""

# Run baseline check
echo "=== Running Baseline Check ==="
echo "Running: baseline-lint check $CHANGED_FILES --format json --score"
RESULT=$(baseline-lint check $CHANGED_FILES --format json --score 2>&1 || echo "{\"error\": \"baseline-lint failed\"}")
echo "Baseline-lint result: $RESULT"
echo ""

# Check if the result contains an error
if echo "$RESULT" | grep -q '"error"'; then
    echo "baseline-lint execution failed"
    echo "result=failed"
    echo "score=0"
    echo "issues=0"
    exit 1
fi

# Extract score and issues count
SCORE=$(echo "$RESULT" | jq -r '.score // 100')
ISSUES=$(echo "$RESULT" | jq -r '.results | length // 0')

echo "=== Results ==="
echo "result=completed"
echo "score=$SCORE"
echo "issues=$ISSUES"
echo ""
echo "Baseline Score: $SCORE/100"
echo "Issues Found: $ISSUES"
echo ""

# Simulate PR comment generation
echo "=== Simulated PR Comment ==="
echo ""

if [ "$SCORE" -ge 90 ]; then
    echo "🎉 **Excellent Baseline Compatibility!**"
elif [ "$SCORE" -ge 70 ]; then
    echo "⚠️ **Good Baseline Compatibility**"
elif [ "$SCORE" -ge 50 ]; then
    echo "🔶 **Fair Baseline Compatibility**"
else
    echo "🚨 **Baseline Compatibility Issues Detected**"
fi

echo ""
echo "**Score:** ${SCORE}/100"
echo "**Issues Found:** ${ISSUES}"
echo ""

if [ "$ISSUES" -gt 0 ]; then
    echo "**Recommendations:**"
    echo "- Consider using widely supported features (baseline: high)"
    echo "- Add fallbacks for newly available features (baseline: low)"
    echo "- Review limited availability features (baseline: false)"
    echo ""
    echo "**View detailed results:** Check the workflow logs for specific file issues."
    echo ""
else
    echo "🎯 **Perfect! No baseline compatibility issues found.**"
    echo ""
fi

echo "**Install baseline-lint:** \`npm install -g baseline-lint\`"
echo "**Check your code:** \`baseline-lint check ./src --score\`"
echo ""
echo "---"
echo "*Powered by [baseline-lint](https://www.npmjs.com/package/baseline-lint)*"
