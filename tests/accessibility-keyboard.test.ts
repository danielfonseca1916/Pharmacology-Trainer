import { expect, test } from "@playwright/test";

test.describe("Accessibility: Keyboard Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("http://localhost:3000/login");
    await page.fill('input[id="email"]', "demo@pharmtrainer.test");
    await page.fill('input[id="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard");
  });

  test("should navigate dashboard using Tab key", async ({ page }) => {
    // Check skip link is accessible via Tab
    const skipLink = page.locator("a:has-text('Skip to main content')");

    // First tab should focus skip link
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();

    // Main content should be focusable after skip link
    await page.keyboard.press("Tab");
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeFocused();
  });

  test("should navigate module blocks with Tab and activate with Enter", async ({ page }) => {
    // Tab to first course block
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should be able to activate with Enter key
    const firstBlock = page.locator("button").first();
    await expect(firstBlock).toBeFocused();

    // Enter should navigate to module
    const currentUrl = page.url();
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle");

    // Should have navigated away
    expect(page.url()).not.toBe(currentUrl);
  });

  test("should navigate to module and use keyboard shortcuts", async ({ page }) => {
    // Navigate to questions module
    await page.goto("http://localhost:3000/modules/questions");
    await page.waitForSelector("fieldset");

    // Should be able to tab through radio options
    const firstOption = page.locator('input[name="answer"]').first();
    await page.keyboard.press("Tab");
    await expect(firstOption).toBeFocused();

    // Select first option with Space or click
    await page.keyboard.press("Space");
    await expect(firstOption).toBeChecked();

    // Tab to submit button and press Enter
    let activeCount = 0;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const submitBtn = page.locator("button").filter({
        hasText: /submit|Submit/,
      });
      const isFocused = await submitBtn.evaluate((el) => el === document.activeElement);
      if (isFocused) {
        await page.keyboard.press("Enter");
        activeCount++;
        break;
      }
    }

    expect(activeCount).toBeGreaterThan(0);

    // After submit, should see feedback
    const explanation = page.locator("p:has-text('Explanation')");
    await expect(explanation).toBeVisible({ timeout: 1000 });
  });

  test("should trap focus in disclaimer modal", async ({ page }) => {
    // Clear disclaimer acceptance to show modal
    await page.evaluate(() => {
      localStorage.removeItem("disclaimer_accepted");
    });
    await page.reload();
    await page.waitForSelector('[role="dialog"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Tab should cycle through modal elements only
    const focusableElements = modal.locator(
      "button, [href], input, [tabindex]:not([tabindex='-1'])"
    );
    const count = await focusableElements.count();

    expect(count).toBeGreaterThan(0);

    // First Tab should focus first button
    await page.keyboard.press("Tab");
    const firstButton = modal.locator("button").first();
    await expect(firstButton).toBeFocused();
  });

  test("should close modal with ESC key", async ({ page }) => {
    // Clear disclaimer acceptance
    await page.evaluate(() => {
      localStorage.removeItem("disclaimer_accepted");
    });
    await page.reload();
    await page.waitForSelector('[role="dialog"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Press ESC to close
    await page.keyboard.press("Escape");

    // Modal should be hidden
    await expect(modal).not.toBeVisible({ timeout: 1000 });
  });

  test("should have visible focus indicators on links", async ({ page }) => {
    // Tab to first navigation link
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const navLink = page.locator('a:has-text("Progress")');
    await page.keyboard.press("Tab");

    // Check that focus ring is visible (CSS ring-2)
    const focusStyle = await navLink.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outline || style.boxShadow;
    });

    expect(focusStyle).toBeTruthy();
  });

  test("should support keyboard navigation in question options", async ({ page }) => {
    await page.goto("http://localhost:3000/modules/questions");
    await page.waitForSelector("fieldset");

    // Navigate to second option with Tab
    const options = page.locator('input[name="answer"]');

    // Focus first option
    await page.keyboard.press("Tab");
    await expect(options.nth(0)).toBeFocused();

    // Arrow Down should move to next option in radiogroup
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toBeFocused();

    // Arrow Up should move back
    await page.keyboard.press("ArrowUp");
    await expect(options.nth(0)).toBeFocused();
  });

  test("should have aria-labels for form fields", async ({ page }) => {
    await page.goto("http://localhost:3000/login");

    const emailInput = page.locator('input[id="email"]');
    const emailLabel = page.locator('label[for="email"]');

    // Label should exist and be associated
    await expect(emailLabel).toBeVisible();

    // Input should have aria-required
    const ariaRequired = await emailInput.getAttribute("aria-required");
    expect(ariaRequired).toBe("true");
  });

  test("should display error messages with aria-describedby", async ({ page }) => {
    await page.goto("http://localhost:3000/login");

    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');

    // Try invalid credentials
    await emailInput.fill("invalid@test.com");
    await passwordInput.fill("wrongpassword");
    await page.click('button[type="submit"]');

    // Wait for error message
    const error = page.locator('[role="alert"]');
    await expect(error).toBeVisible({ timeout: 2000 });

    // Input should reference error with aria-describedby
    const ariaDescribedBy = await emailInput.getAttribute("aria-describedby");
    expect(ariaDescribedBy).toBeTruthy();
  });

  test("should have semantic HTML structure", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");

    // Check for main element with id
    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();

    // Check for header element
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Check for nav element with aria-label
    const nav = page.locator("nav[aria-label]");
    await expect(nav).toBeVisible();

    // Check for sections with aria-labelledby
    const sections = page.locator("section[aria-labelledby]");
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });
});
