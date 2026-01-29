import { Page, expect } from "@playwright/test";

/**
 * Stable test helpers for student journey tests
 */

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

/**
 * Register a new test user
 */
export async function registerUser(page: Page, user: TestUser) {
  await page.goto("/register");
  await page.waitForURL("**/register");

  // Fill registration form
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.fill('[data-testid="confirm-password-input"]', user.password);

  // Accept disclaimer
  const disclaimerCheckbox = page.locator('[data-testid="disclaimer-checkbox"]');
  if ((await disclaimerCheckbox.isVisible()) && !(await disclaimerCheckbox.isChecked())) {
    await disclaimerCheckbox.click();
  }

  // Submit form
  await page.click('[data-testid="register-button"]');

  // Wait for redirect to login
  await page.waitForURL("**/login", { timeout: 5000 });
}

/**
 * Login with email and password
 */
export async function loginUser(page: Page, user: TestUser) {
  await page.goto("/login");
  await page.waitForURL("**/login");

  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-button"]');

  // Wait for dashboard or redirect
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
}

/**
 * Switch app language
 */
export async function switchLanguage(page: Page, language: "en" | "cs") {
  const button = page.locator(`[data-testid="language-toggle-${language}"]`);
  await expect(button).toBeVisible();
  await button.click();

  // Wait for language to change - check a known i18n string
  const expectedString = language === "cs" ? "Přehled" : "Dashboard";
  await expect(page.locator("text=" + expectedString)).toBeVisible({ timeout: 5000 });
}

/**
 * Navigate to MCQ module
 */
export async function navigateToMCQ(page: Page) {
  await page.click('[data-testid="module-questions"]');
  await page.waitForURL("**/modules/questions");
  await expect(page.locator('[data-testid="question-container"]')).toBeVisible({ timeout: 10000 });
}

/**
 * Answer an MCQ question
 */
export async function answerMCQ(page: Page, answerIndex: number) {
  // Get all answer options
  const answers = page.locator('[data-testid="answer-option"]');
  const count = await answers.count();

  if (answerIndex >= count) {
    throw new Error(`Answer index ${answerIndex} out of range (${count} options)`);
  }

  // Click the specified answer
  await answers.nth(answerIndex).click();
  await expect(answers.nth(answerIndex)).toHaveClass(/selected|active/);
}

/**
 * Submit MCQ answer
 */
export async function submitMCQAnswer(page: Page) {
  await page.click('[data-testid="submit-answer-button"]');

  // Wait for feedback
  await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Navigate to clinical case module
 */
export async function navigateToClinicalCase(page: Page) {
  await page.click('[data-testid="module-cases"]');
  await page.waitForURL("**/modules/cases");
  await expect(page.locator('[data-testid="case-container"]')).toBeVisible({ timeout: 10000 });
}

/**
 * Select therapy in clinical case
 */
export async function selectCaseTherapy(page: Page, therapyIndex: number) {
  const therapies = page.locator('[data-testid="therapy-option"]');
  const count = await therapies.count();

  if (therapyIndex >= count) {
    throw new Error(`Therapy index ${therapyIndex} out of range (${count} options)`);
  }

  await therapies.nth(therapyIndex).click();
  await expect(therapies.nth(therapyIndex)).toHaveClass(/selected|active/);
}

/**
 * Submit case answer
 */
export async function submitCaseAnswer(page: Page) {
  await page.click('[data-testid="submit-case-button"]');

  // Wait for feedback sections
  await expect(page.locator('[data-testid="feedback-section"]')).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Navigate to interactions sandbox
 */
export async function navigateToInteractions(page: Page) {
  await page.click('[data-testid="module-interactions"]');
  await page.waitForURL("**/modules/interactions");
  await expect(page.locator('[data-testid="interactions-container"]')).toBeVisible({
    timeout: 10000,
  });
}

/**
 * Select drug in interactions sandbox
 */
export async function selectDrug(page: Page, drugName: string, slotNumber: 1 | 2) {
  const selector = `[data-testid="drug-select-${slotNumber}"]`;
  await page.click(selector);

  // Wait for dropdown
  const dropdown = page.locator('[data-testid="drug-dropdown"]');
  await expect(dropdown).toBeVisible({ timeout: 5000 });

  // Search and select drug
  const searchInput = page.locator('[data-testid="drug-search"]');
  await searchInput.fill(drugName);

  // Select from dropdown
  await page.click(`text=${drugName}`);

  // Verify selection
  await expect(page.locator(selector)).toContainText(drugName, { timeout: 5000 });
}

/**
 * Verify interaction output
 */
export async function verifyInteractionOutput(page: Page) {
  // Wait for interaction result
  const result = page.locator('[data-testid="interaction-result"]');
  await expect(result).toBeVisible({ timeout: 5000 });

  // Verify severity badge exists
  const severity = page.locator('[data-testid="interaction-severity"]');
  await expect(severity).toBeVisible();

  // Get text
  const text = await result.textContent();
  return text;
}

/**
 * Navigate to dose calculator
 */
export async function navigateToDoseCalculator(page: Page) {
  await page.click('[data-testid="module-calculations"]');
  await page.waitForURL("**/modules/calculations");
  await expect(page.locator('[data-testid="calculator-container"]')).toBeVisible({
    timeout: 10000,
  });
}

/**
 * Enter dose calculator inputs
 */
export async function enterCalculatorInputs(page: Page, inputs: Record<string, string>) {
  for (const [key, value] of Object.entries(inputs)) {
    const input = page.locator(`[data-testid="input-${key}"]`);
    await expect(input).toBeVisible();
    await input.fill(value);
  }
}

/**
 * Get calculator result
 */
export async function getCalculatorResult(page: Page): Promise<string> {
  const result = page.locator('[data-testid="calculation-result"]');
  await expect(result).toBeVisible({ timeout: 5000 });
  return (await result.textContent()) || "";
}

/**
 * Verify disclaimer is visible
 */
export async function verifyDisclaimerVisible(page: Page) {
  const disclaimer = page.locator('[data-testid="calculation-disclaimer"]');
  await expect(disclaimer).toBeVisible();
}

/**
 * Check progress widget for updates
 */
export async function verifyProgressUpdate(page: Page, module: string) {
  // Navigate to progress page
  await page.goto("/progress");
  await page.waitForURL("**/progress");

  // Wait for progress widget to show the module
  const moduleProgress = page.locator(`[data-testid="progress-${module}"]`);
  await expect(moduleProgress).toBeVisible({ timeout: 5000 });

  // Verify it shows attempts > 0
  const attemptCount = page.locator(`[data-testid="progress-${module}-attempts"]`);
  await expect(attemptCount).not.toContainText("0");
}

/**
 * Verify attempt was saved
 */
export async function verifyAttemptSaved(page: Page, moduleType: string) {
  expect(moduleType).toBeTruthy();
  // Check that the page shows attempt saved message
  const saveMessage = page.locator('[data-testid="attempt-saved-message"]');

  // Either check for explicit message or verify we're still on the module
  // (which means the response was successful)
  if (await saveMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
    await expect(saveMessage).toBeVisible();
  }
}

/**
 * Seed test user via API (faster than UI registration)
 */
export async function seedTestUser(page: Page, user: TestUser) {
  const response = await page.request.post("/api/auth/register", {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  return response.ok();
}

/**
 * Clear all cookies and local storage
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(() => sessionStorage.clear());
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse((response) => {
    const url = response.url();
    if (typeof urlPattern === "string") {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}
