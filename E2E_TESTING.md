# Playwright E2E Testing Guide

This document describes the comprehensive Playwright test suite for the Pharmacology Trainer application, including stable student journey tests across all major learning modules.

## Test Structure

### Files

- **`e2e/helpers.ts`** - Reusable helper functions for all E2E tests
  - User registration, login, and session management
  - Module navigation and interaction
  - Verification helpers for progress, attempts, and feedback
  - API-based user seeding for faster test execution

- **`e2e/student-journey.mcq.spec.ts`** - MCQ (Question Bank) module tests
  - Register → Login → Language switch → Complete MCQ → Verify progress
  - Keyboard navigation accessibility tests

- **`e2e/student-journey.cases.spec.ts`** - Clinical Case Reasoning tests
  - Case completion with structured feedback validation
  - Verification of all 4 feedback sections (correctness, contraindications, interactions, monitoring)
  - Multiple case attempt tracking

- **`e2e/student-journey.interactions.spec.ts`** - Drug Interactions sandbox tests
  - Deterministic interaction output validation
  - Severity badge verification
  - Multiple known drug pair testing

- **`e2e/student-journey.calculator.spec.ts`** - Dose Calculator tests
  - Input validation and calculation accuracy (±5% tolerance)
  - Disclaimer visibility verification
  - Attempt tracking

## Stability Features

All tests are designed for production CI/CD pipelines with the following reliability measures:

### Selector Strategy

- **Exclusive use of `data-testid` attributes** for critical UI elements
- No reliance on fragile class names or text content
- Selector framework: `[data-testid="element-name"]`

### Wait Strategies

- **Explicit waits** using `expect(locator).toBeVisible({ timeout: 5000 })`
- No hardcoded `waitForTimeout()` calls
- Proper `toHaveText()` matchers for content verification
- API waits: `waitForResponse(urlPattern)` for backend operations

### Test Isolation

- Session clearing between tests: `clearSession()` clears cookies/localStorage
- Separate test database (recommend: `prisma/test.db`)
- User seeding via API for speed: `seedTestUser(page, { email, password })`
- Data cleanup: Each test is independent

### Determinism

- **No random waits**: All waits have explicit timeout values
- **Deterministic assertions**: Same inputs produce same outputs (validated 2x)
- **Fixed test data**: Known drug interactions and calculation inputs
- **Retry logic**: Built-in via playwright.config.ts (2 retries on CI)

## Running Tests

### Local Development

```bash
# List all tests
npx playwright test --list

# Run all tests (headless)
npx playwright test

# Run specific test file
npx playwright test e2e/student-journey.mcq.spec.ts

# Run with visible browser
npx playwright test --headed

# Run single test by name
npx playwright test -g "Register → Login"

# Debug mode (step through tests)
npx playwright test --debug

# Generate HTML report
npx playwright test --reporter=html
```

### CI/CD Execution

The `playwright.config.ts` is pre-configured for CI:

```bash
# Headless chromium only (faster)
npx playwright test --project=chromium

# With full reporter output
npx playwright test --reporter=github --reporter=html
```

See `.github/workflows/e2e.yml` for automated CI setup.

## Test Data

### Known Drug Interactions

The interactions tests use these validated drug pairs:

| Drug 1      | Drug 2         | Severity | Key Result Keywords         |
| ----------- | -------------- | -------- | --------------------------- |
| Warfarin    | Aspirin        | Major    | "bleeding", "anticoagulant" |
| Metformin   | Contrast media | Major    | "lactic", "acidosis"        |
| Simvastatin | Clarithromycin | Major    | "statin", "myopathy"        |

### Calculation Test Cases

The calculator tests validate these inputs/outputs:

| Weight | Dose/kg | Expected       | Tolerance |
| ------ | ------- | -------------- | --------- |
| 70     | 10      | 700            | ±5%       |
| -      | -       | 500 (50×10)    | ±5%       |
| -      | -       | 1.7 (2.0×0.85) | ±5%       |

## Key Helpers

### Authentication

```typescript
// Register a new user via UI
await registerUser(page, {
  email: "test@example.com",
  password: "Test123!"
});

// Login with existing credentials
await loginUser(page, {
  email: "demo@test.com",
  password: "Password123!"
});

// Fast user creation via API
await seedTestUser(page, {
  email: unique-email@test.com",
  password: "Test123!"
});

// Clear session and cookies
await clearSession(page);
```

### Module Navigation

```typescript
// Navigate to MCQ module
await navigateToMCQ(page);

// Navigate to clinical cases
await navigateToClinicalCase(page);

// Navigate to interactions sandbox
await navigateToInteractions(page);

// Navigate to calculator
await navigateToDoseCalculator(page);

// Switch language to Czech
await switchLanguage(page, "cs");
```

### Module Interactions

```typescript
// MCQ-specific
await answerMCQ(page, 0); // Select option at index 0
await submitMCQAnswer(page);

// Cases-specific
await selectCaseTherapy(page, 1); // Select therapy at index 1
await submitCaseAnswer(page);

// Interactions-specific
await selectDrug(page, "Warfarin", 1); // Select in slot 1
const result = await verifyInteractionOutput(page);

// Calculator-specific
await enterCalculatorInputs(page, { weight: "70", dose_per_kg: "10" });
const result = await getCalculatorResult(page);
```

### Verification

```typescript
// Verify attempt was saved
await verifyAttemptSaved(page, "Question Bank");

// Verify progress widget updated
await verifyProgressUpdate(page, "questions");

// Verify disclaimer is visible
await verifyDisclaimerVisible(page);

// Wait for specific API response
await waitForAPIResponse(page, "/api/attempts");
```

## Data-testid Reference

### Authentication Pages

- `[data-testid="email-input"]` - Email field
- `[data-testid="password-input"]` - Password field
- `[data-testid="confirm-password-input"]` - Confirm password (register)
- `[data-testid="disclaimer-checkbox"]` - Disclaimer checkbox
- `[data-testid="login-button"]` - Login button
- `[data-testid="register-button"]` - Register button

### Dashboard

- `[data-testid="dashboard-main"]` - Main container
- `[data-testid="dashboard-title"]` - Dashboard heading
- `[data-testid="module-questions"]` - MCQ module link
- `[data-testid="module-cases"]` - Cases module link
- `[data-testid="module-interactions"]` - Interactions module link
- `[data-testid="module-calculations"]` - Calculator module link

### MCQ Module

- `[data-testid="question-container"]` - Question wrapper
- `[data-testid="answer-option-{index}"]` - Answer choice (0, 1, 2, 3)
- `[data-testid="submit-answer-button"]` - Submit button
- `[data-testid="answer-feedback"]` - Feedback display

### Clinical Cases

- `[data-testid="case-container"]` - Case wrapper
- `[data-testid="patient-info"]` - Patient information section
- `[data-testid="therapy-option-{index}"]` - Therapy choice
- `[data-testid="submit-case-button"]` - Submit button
- `[data-testid="feedback-section-correctness"]` - Correctness feedback
- `[data-testid="feedback-section-contraindications"]` - Contraindications feedback
- `[data-testid="feedback-section-interactions"]` - Interactions feedback
- `[data-testid="feedback-section-monitoring"]` - Monitoring feedback

### Interactions Module

- `[data-testid="interactions-container"]` - Interactions wrapper
- `[data-testid="drug-select-1"]` - First drug selector
- `[data-testid="drug-select-2"]` - Second drug selector
- `[data-testid="interaction-result"]` - Result display
- `[data-testid="interaction-severity"]` - Severity badge

### Calculator Module

- `[data-testid="calculator-container"]` - Calculator wrapper
- `[data-testid="input-weight"]` - Weight input
- `[data-testid="input-dose_per_kg"]` - Dose per kg input
- `[data-testid="calculate-button"]` - Calculate button
- `[data-testid="calculation-result"]` - Result display
- `[data-testid="calculation-disclaimer"]` - Disclaimer text

## Environment Variables

Create `.env.test` for test-specific configuration:

```bash
DATABASE_URL="file:./prisma/test.db"
NEXTAUTH_SECRET="test-secret-for-testing-only"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="test"
```

## Troubleshooting

### Tests Timing Out

- Check if dev server is running: `curl http://localhost:3000`
- Increase timeout: Add `{ timeout: 10000 }` to `expect()` call
- Verify data-testid exists on element

### Flaky Tests

- Check for race conditions: Ensure `waitForResponse()` or `waitForURL()`
- Avoid `page.waitForTimeout()` - use explicit waits instead
- Verify network requests complete before assertions

### Login Failures

- Verify test database has test user or use `seedTestUser()`
- Check NEXTAUTH_SECRET matches in app
- Verify session cookies are being set: Check browser DevTools

### Module Navigation Issues

- Verify element exists: `page.locator('[data-testid="module-questions"]')`
- Check if login is required: Redirect to /login might occur
- Verify module routes are accessible: Check middleware configuration

## CI/CD Integration

The test suite is integrated into GitHub Actions via `.github/workflows/e2e.yml`:

```yaml
- name: Run E2E tests
  run: npx playwright test --reporter=github --reporter=html

- name: Upload HTML report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

Tests run:

- On every pull request
- On push to main branch
- Optionally on schedule (daily at 2 AM UTC)

Failed tests create artifacts with:

- Screenshot on failure
- Video recording
- HTML report with full trace

## Best Practices

1. **Keep selectors stable**: Use data-testid, never rely on text/classes
2. **Wait explicitly**: Use proper matchers, never hardcoded waits
3. **Clear between tests**: Always call `clearSession()` in test cleanup
4. **Test data**: Use known values for determinism validation
5. **Error handling**: Wrap optional elements with `.catch(() => false)`
6. **Timeouts**: Set explicit timeouts (5s for UI, 10s for API)
7. **Accessibility**: Use proper ARIA attributes in selectors when available
8. **Documentation**: Update this file when adding new test patterns

## Performance

Expected test execution times (locally, with dev server):

- MCQ journey: ~15-20 seconds
- Cases journey: ~20-25 seconds
- Interactions journey: ~15-20 seconds
- Calculator journey: ~15-20 seconds
- **Total:** ~70-85 seconds

CI times may be faster/slower depending on infrastructure and browser parallelization.

## Contributing

When adding new tests:

1. Follow the established pattern (student journey per module)
2. Use helpers exclusively (avoid direct DOM selectors)
3. Include determinism validation (run assertion 2x if applicable)
4. Add data-testid attributes to UI before writing tests
5. Document in this file
6. Test locally before pushing
7. Ensure tests pass headlessly

## Related Documentation

- [Playwright Official Docs](https://playwright.dev)
- [Test Database Setup](./DEPLOYMENT.md#test-database)
- [CI/CD Configuration](./.github/workflows/e2e.yml)
- [Project README](./README.md)
