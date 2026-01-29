# Playwright Test Suite - Configuration & Architecture

This document provides deep technical details about the Playwright test suite configuration, test data management, and helper architecture for the Pharmacology Trainer application.

## Overview

The Pharmacology Trainer uses **Playwright 1.49.1** for comprehensive E2E testing covering all major student learning journeys:

- **MCQ (Question Bank)** - Knowledge assessment
- **Clinical Cases** - Problem-solving with structured feedback
- **Drug Interactions** - Pharmacological interaction checking
- **Dose Calculator** - Pharmaceutical calculation validation

## Playwright Configuration

### File: `playwright.config.ts`

```typescript
{
  testDir: './e2e',           // Test file location
  fullyParallel: true,        // Run tests in parallel
  forbidOnly: true,           // Fail if tests are marked as `.only`
  retries: process.env.CI ? 2 : 0,  // Retry failed tests on CI
  workers: process.env.CI ? 1 : undefined,  // Sequential on CI, parallel locally
  reporter: [
    ['html'],                 // HTML report
    ['list'],                 // Console output
    ['github']                // GitHub Actions integration
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',  // Capture trace on first failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
}
```

### Key Configuration Points

| Setting         | Value                   | Rationale                                        |
| --------------- | ----------------------- | ------------------------------------------------ |
| `fullyParallel` | true                    | Tests are independent, can run in parallel       |
| `retries`       | 2 (CI), 0 (local)       | Handle CI flakiness without masking local issues |
| `workers`       | 1 (CI), default (local) | CI sequential for database isolation             |
| `timeout`       | 30s per test            | Adequate for complex module interactions         |
| `trace`         | on-first-retry          | Detailed debugging without overhead              |
| `screenshot`    | only-on-failure         | Failure investigation without bloat              |

## Test Files Organization

### Test Discovery Pattern

```
e2e/
├── helpers.ts                           # Reusable utilities
├── student-journey.mcq.spec.ts         # MCQ module journey
├── student-journey.cases.spec.ts       # Cases module journey
├── student-journey.interactions.spec.ts # Interactions module journey
├── student-journey.calculator.spec.ts  # Calculator module journey
├── admin-dataset.spec.ts               # Admin functionality
└── auth-and-mcq.spec.ts                # Basic auth + MCQ
```

**Naming Convention:** `{category}.{subtype}.spec.ts`

- Helps with test filtering: `--grep "student-journey"`
- Clear test scope from filename
- Groups related tests together

## Helper Functions Architecture

### File: `e2e/helpers.ts` (8.9 KB, 20+ functions)

#### Authentication Helpers

```typescript
// High-level user registration (UI-based, slower)
registerUser(page, {
  email: string,
  password: string
}): Promise<void>
// Steps: Navigate to /register → Fill form → Submit → Verify redirect

// Login with credentials (UI-based)
loginUser(page, {
  email: string,
  password: string
}): Promise<void>
// Steps: Navigate to /login → Fill form → Submit → Verify dashboard

// Fast API-based user creation (preferred for tests)
seedTestUser(page, {
  email: string,
  password: string
}): Promise<void>
// Steps: POST /api/register → Create user instantly → No UI interaction

// Session cleanup (essential between tests)
clearSession(page): Promise<void>
// Steps: Clear all cookies → Clear localStorage → Verify logged out
```

#### Navigation Helpers

Each navigation helper:

- Waits for the module to load
- Verifies correct page via URL or content
- Returns when ready for interaction

```typescript
navigateToMCQ(page): Promise<void>
navigateToClinicalCase(page): Promise<void>
navigateToInteractions(page): Promise<void>
navigateToDoseCalculator(page): Promise<void>
switchLanguage(page, language: "en" | "cs"): Promise<void>
```

#### Module Interaction Helpers

**MCQ Module:**

```typescript
answerMCQ(page, index: number): Promise<void>
// Click option at index (0-based), select via radio button

submitMCQAnswer(page): Promise<void>
// Click submit button, wait for feedback

getMCQFeedback(page): Promise<string>
// Extract feedback text from DOM
```

**Clinical Cases:**

```typescript
selectCaseTherapy(page, index: number): Promise<void>
// Select therapy option at index

submitCaseAnswer(page): Promise<void>
// Submit case answer, wait for feedback sections

verifyCaseFeedbackSection(page, type: "correctness" | "contraindications" | "interactions" | "monitoring"): Promise<boolean>
// Check if specific feedback section is visible with content
```

**Interactions Module:**

```typescript
selectDrug(page, drugName: string, slotNumber: 1 | 2): Promise<void>
// Open dropdown, search for drug, select from results

verifyInteractionOutput(page): Promise<{
  result: string,
  severity: string,
  keywords: string[]
}>
// Extract result, severity, and parse keywords

clearInteractionState(page): Promise<void>
// Reset both drug selections for next test
```

**Calculator:**

```typescript
enterCalculatorInputs(page, inputs: Record<string, string>): Promise<void>
// Fill form with variable number of inputs

getCalculatorResult(page): Promise<number>
// Extract calculation result as number

verifyDisclaimerVisible(page): Promise<boolean>
// Check disclaimer presence and visibility
```

#### Verification Helpers

```typescript
verifyAttemptSaved(page, moduleType: string): Promise<boolean>
// Check database or progress page for recorded attempt

verifyProgressUpdate(page, module: string): Promise<{
  attempts: number,
  correct: number,
  accuracy: number
}>
// Extract progress widget data

verifyDisclaimerVisible(page): Promise<boolean>
// Verify legal disclaimer is present

waitForAPIResponse(page, urlPattern: string | RegExp): Promise<unknown>
// Wait for specific API call to complete and return response
```

## Test Data Management

### Test Database

#### Creation

```bash
# Initialize test database
bash scripts/setup-test-db.sh

# Reset test database
bash scripts/setup-test-db.sh reset

# Clean test database
bash scripts/setup-test-db.sh clean
```

#### Location

- **File:** `prisma/test.db`
- **Environment:** `.env.test`
- **URL:** `file:./prisma/test.db`

#### Isolation Strategy

Each test:

1. Creates unique user via `seedTestUser()` with timestamp-based email
2. Performs actions in isolated session
3. Clears session cookies at cleanup
4. Database remains intact for post-test analysis

Tests can run in parallel because:

- Each user has unique email (via timestamp)
- Users don't conflict on unique constraints
- Sessions are isolated by cookie

#### Data Retention

```bash
# Delete test database to start fresh
rm prisma/test.db

# Re-run setup for clean state
bash scripts/setup-test-db.sh reset
```

### Test Data Fixtures

#### Known Drug Interactions

```typescript
const KNOWN_INTERACTIONS = [
  {
    drug1: "Warfarin",
    drug2: "Aspirin",
    severity: "Major",
    expectedKeywords: ["bleeding", "anticoagulant", "increased"],
  },
  {
    drug1: "Metformin",
    drug2: "Contrast media",
    severity: "Major",
    expectedKeywords: ["lactic", "acidosis", "renal"],
  },
  {
    drug1: "Simvastatin",
    drug2: "Clarithromycin",
    severity: "Major",
    expectedKeywords: ["statin", "myopathy", "CYP3A4"],
  },
];
```

#### Calculation Test Cases

```typescript
const CALCULATOR_TEST_CASES = [
  {
    inputs: { weight: "70", dose_per_kg: "10" },
    expected: 700,
    tolerance: 0.05, // 5%
  },
  {
    inputs: { concentration: "50", volume: "10" },
    expected: 500,
    tolerance: 0.05,
  },
  {
    inputs: { creatinine: "2.0", multiplier: "0.85" },
    expected: 1.7,
    tolerance: 0.05,
  },
];
```

## Selector Strategy

### Why data-testid?

| Selector Type   | Stability | Maintenance | Accessibility |
| --------------- | --------- | ----------- | ------------- |
| `data-testid`   | ★★★★★     | ★★★★★       | ★★★★☆         |
| Class names     | ★☆☆☆☆     | ★☆☆☆☆       | ★★★★☆         |
| Text content    | ★☆☆☆☆     | ★☆☆☆☆       | ★★★★★         |
| IDs             | ★★★☆☆     | ★★★☆☆       | ★★★★☆         |
| Role attributes | ★★★★☆     | ★★★★☆       | ★★★★★         |

### Selector Naming Convention

```
[data-testid="entity-action-detail"]

entity: dashboard, modal, form, button, etc.
action: main, submit, cancel, next, etc.
detail: optional specificity (e.g., -1 for first item)

Examples:
[data-testid="dashboard-main"]
[data-testid="question-container"]
[data-testid="answer-option-0"]
[data-testid="submit-answer-button"]
[data-testid="feedback-section-correctness"]
```

### Selector Patterns

```typescript
// Simple element selection
page.locator('[data-testid="login-button"]');

// Dynamic/indexed selection
page.locator(`[data-testid="answer-option-${index}"]`);

// Combination selectors (when needed)
page.locator('[data-testid="feedback-section"] [data-testid="feedback-title"]');

// Role-based (accessible alternative)
page.locator('button[data-testid="submit-answer-button"]');

// Avoid in tests:
page.locator(".bg-blue-600"); // Too fragile
page.locator("button:nth-child(2)"); // Position-dependent
page.locator("text=Submit"); // Language/text-dependent
```

## Wait Strategies

### Explicit Waits (Recommended)

```typescript
// Wait for visibility
await expect(page.locator('[data-testid="feedback-section-correctness"]')).toBeVisible({
  timeout: 5000,
});

// Wait for specific text
await expect(page.locator('[data-testid="answer-feedback"]')).toContainText("Correct!", {
  timeout: 5000,
});

// Wait for value
await expect(page.locator('[data-testid="calculation-result"]')).toHaveValue("700", {
  timeout: 5000,
});

// Wait for attribute
await expect(page.locator('input[data-testid="email-input"]')).toHaveAttribute("disabled", "", {
  timeout: 5000,
});
```

### API Waits

```typescript
// Wait for network response
const response = await page.waitForResponse(
  (response) => response.url().includes("/api/attempts") && response.status() === 201,
  { timeout: 10000 }
);

// Wait for URL change
await page.waitForURL(/\/dashboard/);

// Wait for function condition
await page.waitForFunction(() => {
  return window.localStorage.getItem("session-valid") === "true";
});
```

### Anti-Patterns (Avoid)

```typescript
// ❌ Hardcoded waits (flaky and slow)
await page.waitForTimeout(2000);

// ❌ No wait (race condition)
await page.click('[data-testid="submit-button"]');
const text = await page.locator('[data-testid="result"]').textContent();

// ❌ Excessive timeout
await expect(page.locator('[data-testid="button"]')).toBeVisible({ timeout: 30000 }); // Too long
```

## Test Isolation

### Session Management

```typescript
// At the start of each test
test.beforeEach(async ({ page }) => {
  // Create fresh user via API
  const email = `test${Date.now()}@test.com`;
  await seedTestUser(page, { email, password: "Test123!" });

  // Perform test actions
});

// At the end of each test
test.afterEach(async ({ page }) => {
  // Clean up session
  await clearSession(page);
  // Database remains intact for verification
});
```

### Database Cleanup

For complete isolation between test runs:

```bash
# Before running tests
bash scripts/setup-test-db.sh reset

# Run tests
npx playwright test

# Inspect test data afterward
sqlite3 prisma/test.db ".tables"
sqlite3 prisma/test.db "SELECT COUNT(*) as users FROM User;"
```

## Performance Characteristics

### Test Execution Times

```
Local Development (single browser):
├── MCQ journey:           15-20 seconds
├── Cases journey:         20-25 seconds
├── Interactions journey:  15-20 seconds
├── Calculator journey:    15-20 seconds
└── Total (sequential):    70-85 seconds
    Total (parallel):      25-30 seconds

CI Environment (1 worker):
├── Same tests, sequential
├── Slower due to container overhead
└── Total expected:        120-150 seconds
```

### Optimization Tips

1. **Use `seedTestUser()` instead of `registerUser()`**
   - API seeding: ~0.5 seconds
   - UI registration: ~3-5 seconds

2. **Reuse session when possible**
   - Login once, perform multiple actions
   - Clear only at test end

3. **Parallel execution (locally)**
   - Run `npx playwright test` without `--workers=1`
   - Divides time by browser count

4. **Selective test runs**

   ```bash
   # Run only student-journey tests
   npx playwright test -g "student-journey"

   # Run only MCQ tests
   npx playwright test student-journey.mcq
   ```

## Debugging

### Generate Full Trace

```bash
# Run test with full trace capture
npx playwright test --trace on

# Open trace viewer
npx playwright show-trace trace/path/to/trace.zip
```

### Debug Mode

```bash
# Interactive debug with inspector
npx playwright test --debug

# Pause at specific point in test
await page.pause();
```

### View HTML Report

```bash
# Generate and open report
npx playwright show-report

# Or manually open the HTML
open playwright-report/index.html
```

## CI/CD Integration

### GitHub Actions Workflow

See `.github/workflows/e2e.yml` for full configuration.

Key features:

- Runs on push to main, pull requests, and schedule
- Uses matrix for multiple browsers (currently chromium for speed)
- Uploads HTML report as artifact
- Comments on PR with results
- Retries failed tests once
- 30-minute timeout

### Local CI Simulation

```bash
# Simulate CI environment locally
CI=true npx playwright test --project=chromium
```

## Troubleshooting Reference

### "Element not found" Error

```typescript
// Issue: data-testid doesn't exist on element
// Solution: Add data-testid to component

// Verify testid exists:
await page
  .locator('[data-testid="element-name"]')
  .isVisible()
  .catch(() => {
    console.error("Element with testid not found");
    throw new Error('Missing data-testid="element-name"');
  });
```

### "Timeout waiting for..." Error

```typescript
// Issue: Element not appearing within timeout
// Causes: Loading too slow, wrong page, selector wrong

// Debug:
await page.screenshot({ path: "debug.png" }); // Visual check
const url = page.url(); // Verify correct page
const visible = await page.locator('[data-testid="target"]').isVisible();
```

### "Session not persisted" Error

```typescript
// Issue: Login doesn't persist between operations
// Solution: Ensure cookies are not cleared

// DON'T do this mid-test:
await page.context().clearCookies();

// Only clear at test end:
test.afterEach(async ({ page }) => {
  await clearSession(page); // Proper cleanup
});
```

## Contributing to Test Suite

### Adding New Tests

1. **Create new .spec.ts file**

   ```bash
   # For new module journey
   touch e2e/student-journey.{module-name}.spec.ts
   ```

2. **Follow established pattern**

   ```typescript
   import { test, expect } from '@playwright/test';
   import {
     seedTestUser, loginUser, clearSession,
     navigateTo{Module}, // Import helpers
   } from './helpers';

   test.describe('New Module Student Journey', () => {
     let testEmail: string;

     test.beforeEach(async ({ page }) => {
       testEmail = `test${Date.now()}@test.com`;
       await seedTestUser(page, { email: testEmail, password: 'Test123!' });
       await loginUser(page, { email: testEmail, password: 'Test123!' });
     });

     test.afterEach(async ({ page }) => {
       await clearSession(page);
     });

     test('User completes module', async ({ page }) => {
       await navigateTo{Module}(page);
       // Test steps...
     });
   });
   ```

3. **Use helpers, not direct selectors**

   ```typescript
   // ✅ Good - uses helper
   await answerMCQ(page, 0);

   // ❌ Bad - direct DOM access
   await page.click(".radio-button");
   ```

4. **Add determinism validation when applicable**

   ```typescript
   // For interactions or calculations
   const result1 = await getInteractionResult(page);
   await clearAndRedo(page);
   const result2 = await getInteractionResult(page);
   expect(result1).toBe(result2); // Same input = same output
   ```

5. **Document in E2E_TESTING.md**
   - What the test validates
   - Expected data
   - Timeout settings

## References

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Configuration Reference](https://playwright.dev/docs/test-configuration)
- [Network Testing](https://playwright.dev/docs/network)
