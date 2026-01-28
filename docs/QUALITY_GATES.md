# Quality Gates Setup

## Overview

This repository includes comprehensive quality gates to ensure code quality:

- **ESLint** with `next/core-web-vitals` preset and strict TypeScript rules
- **Prettier** with automatic import sorting
- **TypeScript** with strict compiler options
- **Husky + lint-staged** for pre-commit validation
- **CI/CD** pipeline that runs all checks before merge

## Scripts

### Linting
```bash
pnpm lint           # Run ESLint (fail on warnings)
pnpm lint:fix       # Auto-fix ESLint issues
```

### Formatting
```bash
pnpm format         # Format all files with Prettier
pnpm format:check   # Check formatting without writing
```

### Type Checking
```bash
pnpm typecheck      # Run TypeScript compiler checks
```

### Comprehensive Check
```bash
pnpm check          # Run: lint + typecheck + dataset:lint + test
```

## Pre-commit Hooks

Husky + lint-staged automatically runs on every commit:
- ESLint with auto-fix on staged `.ts/.tsx` files
- Prettier formatting on staged files
- TypeScript type checking (no emit)

## CI Pipeline

The GitHub Actions CI workflow (`.github/workflows/ci.yml`) runs:
1. Install dependencies
2. Generate Prisma client
3. **pnpm check** (lint, typecheck, dataset:lint, test)
4. Production build (fails on TS/ESLint errors)

## Build Configuration

`next.config.ts` is configured to:
- Fail build on ESLint errors (`ignoreDuringBuilds: false`)
- Fail build on TypeScript errors (`ignoreBuildErrors: false`)

## TypeScript Strict Mode

`tsconfig.json` includes:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedIndexedAccess: true`
- `forceConsistentCasingInFileNames: true`

## ESLint Rules

Custom rules in `eslint.config.mjs`:
- `@typescript-eslint/no-unused-vars: error` (ignore `_` prefix)
- `@typescript-eslint/no-explicit-any: error`
- `no-console: warn` (allow `console.warn` and `console.error`)

## Setup Instructions

### Initial Setup

After cloning the repository:

```bash
# Install dependencies
pnpm install

# This automatically runs the "prepare" script which sets up Husky
```

### Manual Husky Setup (if needed)

```bash
# Initialize Husky
pnpm husky init

# Make pre-commit hook executable
chmod +x .husky/pre-commit
```

## Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass pre-commit hooks:

```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning**: CI will still run all checks, and the build will fail if issues exist.

## Troubleshooting

### Pre-commit Hook Not Running

1. Ensure Husky is installed: `pnpm install`
2. Check hook permissions: `chmod +x .husky/pre-commit`
3. Verify Git hooks path: `git config core.hooksPath`

### ESLint or TypeScript Errors

1. Run `pnpm lint:fix` to auto-fix issues
2. Run `pnpm format` to format code
3. Check type errors with `pnpm typecheck`
4. Fix remaining issues manually

### Build Failures

If the build fails:
1. Run `pnpm check` locally to see all errors
2. Fix errors before pushing
3. Verify with `pnpm build`

## Best Practices

1. **Commit Often**: Small, focused commits are easier to review
2. **Run Checks**: Use `pnpm check` before pushing
3. **Fix Warnings**: Don't ignore ESLint/TS warnings
4. **Update Dependencies**: Keep tooling up to date
5. **Document Changes**: Update this file when modifying quality gates
