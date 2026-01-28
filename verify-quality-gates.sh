#!/usr/bin/env bash
set -e

echo "🔍 Verifying Quality Gates Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
  else
    echo -e "${RED}✗${NC} $1 (missing)"
    exit 1
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
  else
    echo -e "${RED}✗${NC} $1/ (missing)"
    exit 1
  fi
}

echo "📁 Checking configuration files..."
check_file ".prettierrc"
check_file ".prettierignore"
check_file ".lintstagedrc.js"
check_file ".gitattributes"
check_file "eslint.config.mjs"
check_file "tsconfig.json"
check_file "next.config.ts"
check_file "package.json"
check_file ".github/workflows/ci.yml"
echo ""

echo "📁 Checking Husky setup..."
check_dir ".husky"
check_file ".husky/pre-commit"
check_file ".husky/_/husky.sh"
echo ""

echo "📁 Checking documentation..."
check_file "docs/QUALITY_GATES.md"
check_file "SETUP_QUALITY_GATES.md"
check_file "QUALITY_GATES_SUMMARY.md"
echo ""

echo "🔍 Checking package.json scripts..."
if grep -q '"lint":' package.json && \
   grep -q '"format":' package.json && \
   grep -q '"typecheck":' package.json && \
   grep -q '"check":' package.json; then
  echo -e "${GREEN}✓${NC} All required scripts present"
else
  echo -e "${RED}✗${NC} Missing required scripts in package.json"
  exit 1
fi
echo ""

echo "🔍 Checking dependencies in package.json..."
if grep -q '"prettier":' package.json && \
   grep -q '"husky":' package.json && \
   grep -q '"lint-staged":' package.json && \
   grep -q '"@typescript-eslint/eslint-plugin":' package.json && \
   grep -q '"@typescript-eslint/parser":' package.json; then
  echo -e "${GREEN}✓${NC} All required dependencies listed"
else
  echo -e "${RED}✗${NC} Missing required dependencies in package.json"
  exit 1
fi
echo ""

echo "🔍 Checking Husky hook permissions..."
if [ -x ".husky/pre-commit" ]; then
  echo -e "${GREEN}✓${NC} .husky/pre-commit is executable"
else
  echo -e "${YELLOW}⚠${NC}  .husky/pre-commit is not executable (run: chmod +x .husky/pre-commit)"
fi
echo ""

echo -e "${GREEN}✅ All quality gate files are in place!${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Run: pnpm install (or npm install)"
echo "  2. Run: pnpm format"
echo "  3. Run: pnpm check"
echo "  4. Test commit hooks: git commit"
echo ""
echo "📖 See SETUP_QUALITY_GATES.md for detailed instructions"
