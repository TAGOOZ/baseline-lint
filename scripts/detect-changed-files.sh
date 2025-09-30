#!/bin/bash
# Production-ready file detection for CI workflows

# Initialize variables
CHANGED_FILES=""

# Get GitHub context (will be empty if not in GitHub Actions)
GITHUB_EVENT_NAME="${GITHUB_EVENT_NAME:-}"
GITHUB_BASE_REF="${GITHUB_BASE_REF:-}"

# Strategy 1: Use GitHub context for PR events
if [ "$GITHUB_EVENT_NAME" = "pull_request" ]; then
  BASE_SHA="${GITHUB_EVENT_PULL_REQUEST_BASE_SHA:-}"
  HEAD_SHA="${GITHUB_EVENT_PULL_REQUEST_HEAD_SHA:-}"
  
  if [ -n "$BASE_SHA" ] && [ -n "$HEAD_SHA" ]; then
    CHANGED_FILES=$(git diff --name-only --diff-filter=AM $BASE_SHA $HEAD_SHA | grep -E '\.(css|js|jsx|ts|tsx)$' || echo "")
  fi
fi

# Strategy 2: Use base ref comparison
if [ -z "$CHANGED_FILES" ] && [ -n "$GITHUB_BASE_REF" ]; then
  BASE_REF="$GITHUB_BASE_REF"
  git fetch origin $BASE_REF:$BASE_REF >/dev/null 2>&1 || true
  
  if git rev-parse origin/$BASE_REF >/dev/null 2>&1; then
    CHANGED_FILES=$(git diff --name-only --diff-filter=AM origin/$BASE_REF...HEAD | grep -E '\.(css|js|jsx|ts|tsx)$' || echo "")
  fi
fi

# Strategy 3: Use main branch comparison
if [ -z "$CHANGED_FILES" ]; then
  git fetch origin main:main >/dev/null 2>&1 || true
  
  if git rev-parse origin/main >/dev/null 2>&1; then
    CHANGED_FILES=$(git diff --name-only --diff-filter=AM origin/main...HEAD | grep -E '\.(css|js|jsx|ts|tsx)$' || echo "")
  fi
fi

# Strategy 4: Use HEAD~1 comparison (for shallow clones)
if [ -z "$CHANGED_FILES" ]; then
  if git rev-parse HEAD~1 >/dev/null 2>&1; then
    CHANGED_FILES=$(git diff --name-only --diff-filter=AM HEAD~1 HEAD | grep -E '\.(css|js|jsx|ts|tsx)$' || echo "")
  fi
fi

# Strategy 5: Check all files in current commit (fallback)
if [ -z "$CHANGED_FILES" ]; then
  CHANGED_FILES=$(git ls-tree --name-only HEAD | grep -E '\.(css|js|jsx|ts|tsx)$' || echo "")
fi

# Output result
if [ -z "$CHANGED_FILES" ]; then
  echo "No CSS/JS files found"
  exit 0
else
  echo "$CHANGED_FILES"
fi
