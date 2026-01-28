# Setup Instructions for Quality Gates

## Quick Start

Since Node.js might not be active in your current terminal session, follow these steps:

### 1. Install Dependencies

Open a **new terminal** in VS Code or restart your terminal, then run:

```bash
cd /workspaces/pharmacology-trainer
pnpm install
```

This will install all the new quality gate tools:
- `prettier` + `prettier-plugin-organize-imports`
- `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`
- `husky` + `lint-staged`
- `@eslint/eslintrc` + `@eslint/js`

### 2. Verify Installation

```bash
# Check that all tools are installed
pnpm exec prettier --version
pnpm exec eslint --version
pnpm exec husky --version

# Run a quick format check
pnpm format:check

# Run ESLint
pnpm lint

# Run TypeScript check
pnpm typecheck

# Run all checks at once
pnpm check
```

### 3. Format Existing Code

After installation, format the entire codebase:

```bash
# Format all files
pnpm format

# Fix ESLint issues
pnpm lint:fix
```

### 4. Test Pre-commit Hooks

Make a small change and commit it:

```bash
git add .
git commit -m "test: verify quality gates"
```

The pre-commit hook should automatically:
- Run ESLint with auto-fix
- Format files with Prettier
- Run TypeScript type checking

## What Was Added

### Configuration Files

- **`.prettierrc`** - Prettier configuration (semi, no trailing comma, etc.)
- **`.prettierignore`** - Files to ignore during formatting
- **`.lintstagedrc.js`** - Pre-commit hook configuration
- **`.husky/pre-commit`** - Git pre-commit hook that runs lint-staged
- **`eslint.config.mjs`** - Updated with strict TypeScript rules
- **`tsconfig.json`** - Updated with strict compiler options
- **`next.config.ts`** - Configured to fail build on errors

### Package Scripts

Added to `package.json`:
```json
{
  "lint": "eslint . --max-warnings 0",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md,yml,yaml}\"",
  "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md,yml,yaml}\"",
  "typecheck": "tsc --noEmit",
  "check": "pnpm lint && pnpm typecheck && pnpm dataset:lint && pnpm test",
  "prepare": "husky || true"
}
```

### CI/CD Updates

**`.github/workflows/ci.yml`** now runs:
1. `pnpm check` - Comprehensive quality checks
2. `pnpm build` - Fails on TS/ESLint errors

## Troubleshooting

### If `pnpm` is not found

The issue is that Node.js is not in your PATH. Try:

```bash
# Option 1: Use the existing node_modules/.bin
cd /workspaces/pharmacology-trainer
./node_modules/.bin/prettier --version

# Option 2: Use npx (if available)
npx prettier --version

# Option 3: Restart your codespace/terminal
# Then run: pnpm install
```

### If hooks don't run on commit

```bash
# Manually setup Husky
cd /workspaces/pharmacology-trainer
pnpm husky install
chmod +x .husky/pre-commit
git config core.hooksPath .husky
```

### Manual Quality Check

If automated tools aren't working, you can manually check quality:

```bash
# Check TypeScript
npx tsc --noEmit

# Check ESLint
npx eslint .

# Format with Prettier
npx prettier --write "**/*.{ts,tsx}"
```

## Next Steps

1. **Install dependencies**: `pnpm install` (in a fresh terminal)
2. **Format codebase**: `pnpm format`
3. **Fix any issues**: `pnpm lint:fix`
4. **Verify everything**: `pnpm check`
5. **Commit changes**: Git hooks will run automatically

## Documentation

See [docs/QUALITY_GATES.md](./docs/QUALITY_GATES.md) for complete documentation on:
- All available scripts
- Configuration details
- Best practices
- Troubleshooting guide
