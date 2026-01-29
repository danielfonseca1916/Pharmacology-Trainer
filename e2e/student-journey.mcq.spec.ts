import { expect, test } from "@playwright/test";
import {
  answerMCQ,
  clearSession,
  loginUser,
  navigateToMCQ,
  registerUser,
  submitMCQAnswer,
  switchLanguage,
  verifyAttemptSaved,
  verifyProgressUpdate,
} from "./helpers";

// Test user credentials
const testUser = {
  email: `student-mcq-${Date.now()}@test.com`,
  password: "TestPassword123!",
};

test.describe("Student Journey: MCQ Module", () => {
  test.beforeEach(async ({ page }) => {
    // Clear session before each test
    await clearSession(page);
  });

  test("Register → Login → Switch to Czech → Complete MCQ → Progress Updates", async ({ page }) => {
    // Step 1: Register new user
    console.log("Step 1: Registering user...");
    await registerUser(page, testUser);

    // Step 2: Login with credentials
    console.log("Step 2: Logging in...");
    await loginUser(page, testUser);

    // Verify we're on dashboard
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();

    // Step 3: Switch language to Czech
    console.log("Step 3: Switching to Czech...");
    await switchLanguage(page, "cs");

    // Verify language changed
    await expect(page.locator("text=Přehled")).toBeVisible();

    // Step 4: Navigate to MCQ module
    console.log("Step 4: Navigating to MCQ module...");
    await navigateToMCQ(page);

    // Step 5: Answer a question
    console.log("Step 5: Answering MCQ...");
    await answerMCQ(page, 0); // Select first answer

    // Step 6: Submit answer
    console.log("Step 6: Submitting answer...");
    await submitMCQAnswer(page);

    // Wait for feedback
    await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible();

    // Step 7: Verify attempt was saved
    console.log("Step 7: Verifying attempt saved...");
    await verifyAttemptSaved(page, "questions");

    // Step 8: Verify progress widget updated
    console.log("Step 8: Checking progress widget...");
    await verifyProgressUpdate(page, "questions");

    // Verify we see the attempt in progress
    await expect(page.locator('[data-testid="progress-questions-attempts"]')).toContainText(
      /[1-9]/
    );

    console.log("✅ MCQ journey test completed successfully!");
  });

  test("MCQ accessibility: Navigate with keyboard", async ({ page }) => {
    await loginUser(page, testUser);
    await navigateToMCQ(page);

    // Get question container
    const questionContainer = page.locator('[data-testid="question-container"]');
    await expect(questionContainer).toBeVisible();

    // Tab to first answer
    await page.keyboard.press("Tab");
    let focusedElement = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-testid")
    );
    expect(focusedElement).toContain("answer");

    // Navigate with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");

    // Verify selection
    const selectedAnswer = page.locator('[data-testid="answer-option"][aria-checked="true"]');
    await expect(selectedAnswer).toBeVisible();
  });
});
