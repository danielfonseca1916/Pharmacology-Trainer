# E2E Testing Quick Reference

**For the complete Pharmacology Trainer application documentation, see [README.md](README.md)**

This is a quick reference for the comprehensive Playwright E2E test suite.

## 🚀 Quick Start

```bash
# Setup test database
bash scripts/setup-test-db.sh reset

# Run all E2E tests
npx playwright test

# View interactive HTML report
npx playwright show-report
```

## 📊 Test Coverage

| Module            | Tests     | Scenarios                                    | Status       |
| ----------------- | --------- | -------------------------------------------- | ------------ |
| MCQ (Questions)   | ✅ 2      | Register→Login→Czech→MCQ→Progress            | Complete     |
| Cases (Reasoning) | ✅ 3      | Cases→4 Feedback Sections, Multiple Attempts | Complete     |
| Interactions      | ✅ 4      | 2 Drugs→Deterministic Output, 3 Pairs        | Complete     |
| Calculator        | ✅ 5      | Inputs→Output±5%, 3 Test Cases               | Complete     |
| **Total**         | **✅ 14** | **14 scenarios**                             | **Complete** |

## 📁 Files

### Tests (950+ lines)

- `e2e/helpers.ts` - 20+ reusable helper functions
- `e2e/student-journey.mcq.spec.ts` - MCQ module tests
- `e2e/student-journey.cases.spec.ts` - Clinical case tests
- `e2e/student-journey.interactions.spec.ts` - Interactions sandbox tests
- `e2e/student-journey.calculator.spec.ts` - Calculator tests

### Infrastructure

- `.github/workflows/e2e.yml` - GitHub Actions CI/CD
- `scripts/setup-test-db.sh` - Test database setup

### Documentation

- `E2E_TESTING.md` - Complete testing guide
- `PLAYWRIGHT_CONFIG.md` - Technical configuration
- `E2E_TEST_SUITE_SUMMARY.md` - Completion summary
- `E2E_IMPLEMENTATION_CHECKLIST.md` - Verification checklist

## 🎯 Common Commands

```bash
# Run all tests (headless)
npx playwright test

# Run with visible browser
npx playwright test --headed

# Run specific test file
npx playwright test e2e/student-journey.mcq.spec.ts

# Run tests matching pattern
npx playwright test -g "student-journey"

# Debug mode (step through)
npx playwright test --debug

# List all available tests
npx playwright test --list

# Generate and view HTML report
npx playwright test && npx playwright show-report

# Run specific browser
npx playwright test --project=chromium

# Run with specific reporter
npx playwright test --reporter=html --reporter=list
```

## 🔧 Test Database

```bash
# Initialize test database
bash scripts/setup-test-db.sh

# Reset test database
bash scripts/setup-test-db.sh reset

# Clean (remove) test database
bash scripts/setup-test-db.sh clean

# Show database status
bash scripts/setup-test-db.sh verify

# Show database statistics
bash scripts/setup-test-db.sh stats
```

## ✨ Key Features

- ✅ **Stable selectors:** All tests use `data-testid` attributes
- ✅ **Explicit waits:** 5-10 second timeouts (no flaky delays)
- ✅ **Test isolation:** Separate database, unique users per test
- ✅ **Determinism:** Interactions/calculator tested for consistency
- ✅ **CI-ready:** GitHub Actions integrated with automatic retry
- ✅ **Well-documented:** 3 comprehensive guides + this reference
- ✅ **Reusable helpers:** 20+ functions for all operations
- ✅ **Debuggable:** Screenshots, videos, traces on failure

## 📊 Test Execution

### Local (4 browsers in parallel)

```bash
npx playwright test
# Expected time: ~25-30 seconds
```

### CI/CD (GitHub Actions)

```yaml
# Runs on: push to main, PRs, daily at 2 AM UTC
# Browsers: chromium (1 at a time for DB isolation)
# Retries: 2 on failure
# Time: ~120-150 seconds
```

## 🔍 Data Validation

### Known Drug Interactions (3 pairs)

- **Warfarin + Aspirin** → Major (bleeding, anticoagulant)
- **Metformin + Contrast media** → Major (lactic acidosis)
- **Simvastatin + Clarithromycin** → Major (statin myopathy)

### Calculator Test Cases (3 cases)

- **weight=70, dose_per_kg=10** → 700 (±5% tolerance)
- **concentration=50, volume=10** → 500 (±5% tolerance)
- **creatinine=2.0, multiplier=0.85** → 1.7 (±5% tolerance)

## 🐛 Troubleshooting

### Tests Timing Out

```bash
# Check if dev server is running
curl http://localhost:3000

# Increase timeout if needed
# Edit test file and change timeout value (default: 5000ms)
```

### Tests Not Finding Elements

```bash
# Verify data-testid exists on element
npx playwright test --debug

# Check browser DevTools in debug mode
# Look for [data-testid="element-name"]
```

### Database Issues

```bash
# Reset test database
bash scripts/setup-test-db.sh reset

# Verify database
bash scripts/setup-test-db.sh verify
```

## 📚 Documentation

| Document                                                             | Purpose             | Audience         |
| -------------------------------------------------------------------- | ------------------- | ---------------- |
| [E2E_TESTING.md](./E2E_TESTING.md)                                   | Complete guide      | All users        |
| [PLAYWRIGHT_CONFIG.md](./PLAYWRIGHT_CONFIG.md)                       | Technical deep dive | Developers       |
| [E2E_TEST_SUITE_SUMMARY.md](./E2E_TEST_SUITE_SUMMARY.md)             | Completion overview | Project managers |
| [E2E_IMPLEMENTATION_CHECKLIST.md](./E2E_IMPLEMENTATION_CHECKLIST.md) | Verification        | QA engineers     |

## 🚀 CI/CD Integration

Tests automatically run on:

- ✅ Every push to `main` branch
- ✅ Every pull request
- ✅ Daily schedule (2 AM UTC)

View results:

1. Go to GitHub → Actions tab
2. Click "E2E Tests (Playwright)" workflow
3. Click latest run
4. Artifacts section has HTML report

## 💡 Tips

1. **Fast user creation:** Use `seedTestUser()` instead of `registerUser()`
   - API-based: ~0.5 seconds
   - UI-based: ~3-5 seconds

2. **Parallel execution:** Tests run in parallel locally
   - 4 browsers = 4× faster
   - Use `--workers=1` for sequential (database debugging)

3. **Selective testing:** Run only what you need

   ```bash
   npx playwright test -g "mcq"  # Only MCQ tests
   ```

4. **Debugging:** Use `--debug` flag with visible browser
   ```bash
   npx playwright test --debug --headed
   ```

## 📞 Support

1. Check [E2E_TESTING.md](./E2E_TESTING.md) troubleshooting section
2. Review [PLAYWRIGHT_CONFIG.md](./PLAYWRIGHT_CONFIG.md) for technical details
3. Examine test output and HTML report
4. Use `--debug` flag to step through tests

## 🔗 Related Documentation

- [README.md](./README.md) - Main project documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [Playwright Official Docs](https://playwright.dev) - Official documentation

---

**Status:** ✅ Production-Ready E2E Test Suite

All tests are stable, documented, and integrated into CI/CD.
