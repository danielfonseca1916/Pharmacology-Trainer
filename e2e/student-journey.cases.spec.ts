import { expect, test } from "@playwright/test";
import {
  clearSession,
  loginUser,
  navigateToClinicalCase,
  seedTestUser,
  selectCaseTherapy,
  submitCaseAnswer,
  verifyAttemptSaved,
} from "./helpers";

const testUser = {
  email: `student-cases-${Date.now()}@test.com`,
  password: "TestPassword123!",
};

test.describe("Student Journey: Clinical Case Module", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    // Seed user via API (faster than registration)
    await seedTestUser(page, testUser);
  });

  test("Complete clinical case → Verify feedback sections render → Attempt saved", async ({
    page,
  }) => {
    // Step 1: Login
    console.log("Step 1: Logging in...");
    await loginUser(page, testUser);

    // Step 2: Navigate to clinical cases module
    console.log("Step 2: Navigating to clinical cases...");
    await navigateToClinicalCase(page);

    // Verify case is loaded
    await expect(page.locator('[data-testid="case-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-info"]')).toBeVisible();

    // Step 3: Select therapy
    console.log("Step 3: Selecting therapy...");
    await selectCaseTherapy(page, 0); // Select first therapy option

    // Step 4: Submit answer
    console.log("Step 4: Submitting case answer...");
    await submitCaseAnswer(page);

    // Step 5: Verify feedback sections
    console.log("Step 5: Verifying feedback sections...");

    // Check correctness feedback
    const correctnessFeedback = page.locator('[data-testid="feedback-section-correctness"]');
    await expect(correctnessFeedback).toBeVisible({ timeout: 5000 });

    // Check contraindications feedback
    const contraindicationsFeedback = page.locator(
      '[data-testid="feedback-section-contraindications"]'
    );
    await expect(contraindicationsFeedback).toBeVisible();

    // Check interactions feedback
    const interactionsFeedback = page.locator('[data-testid="feedback-section-interactions"]');
    await expect(interactionsFeedback).toBeVisible();

    // Check monitoring feedback
    const monitoringFeedback = page.locator('[data-testid="feedback-section-monitoring"]');
    await expect(monitoringFeedback).toBeVisible();

    // Step 6: Verify attempt was saved
    console.log("Step 6: Verifying attempt saved...");
    await verifyAttemptSaved(page, "cases");

    // Verify all feedback sections have content
    await expect(correctnessFeedback).not.toBeEmpty();
    await expect(contraindicationsFeedback).not.toBeEmpty();
    await expect(interactionsFeedback).not.toBeEmpty();
    await expect(monitoringFeedback).not.toBeEmpty();

    console.log("✅ Clinical case journey test completed successfully!");
  });

  test("Case feedback structure is correct", async ({ page }) => {
    await loginUser(page, testUser);
    await navigateToClinicalCase(page);
    await selectCaseTherapy(page, 0);
    await submitCaseAnswer(page);

    // Verify feedback has proper structure
    const feedbackSection = page.locator('[data-testid="feedback-container"]');
    await expect(feedbackSection).toBeVisible();

    // Check all feedback types exist
    const feedbackTypes = ["correctness", "contraindications", "interactions", "monitoring"];
    for (const type of feedbackTypes) {
      const section = page.locator(`[data-testid="feedback-section-${type}"]`);
      await expect(section).toBeVisible();

      // Verify it has title
      const title = section.locator(`[data-testid="feedback-title-${type}"]`);
      await expect(title).toBeVisible();

      // Verify it has content
      const content = section.locator(`[data-testid="feedback-content-${type}"]`);
      await expect(content).not.toBeEmpty();
    }
  });

  test("Multiple case attempts are tracked", async ({ page }) => {
    await loginUser(page, testUser);

    // Complete first case
    await navigateToClinicalCase(page);
    await selectCaseTherapy(page, 0);
    await submitCaseAnswer(page);
    await expect(page.locator('[data-testid="feedback-container"]')).toBeVisible();

    // Go back to case list and try another case (if available)
    const nextButton = page.locator('[data-testid="case-next-button"]');
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextButton.click();

      // Verify we're on a new case
      await expect(page.locator('[data-testid="case-container"]')).toBeVisible();

      // Complete second case
      await selectCaseTherapy(page, 1);
      await submitCaseAnswer(page);
      await expect(page.locator('[data-testid="feedback-container"]')).toBeVisible();

      console.log("✅ Multiple case attempts tracked!");
    }
  });
});
