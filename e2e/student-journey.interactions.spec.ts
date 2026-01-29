import { expect, test } from "@playwright/test";
import {
  clearSession,
  loginUser,
  navigateToInteractions,
  seedTestUser,
  selectDrug,
  verifyInteractionOutput,
} from "./helpers";

const testUser = {
  email: `student-interactions-${Date.now()}@test.com`,
  password: "TestPassword123!",
};

type InteractionCase = {
  drug1: string;
  drug2: string;
  expectedSeverity: string;
  expectedKeywords: string[];
};

// Known drug pairs and their expected interaction outcomes
const KNOWN_INTERACTIONS: InteractionCase[] = [
  {
    drug1: "Warfarin",
    drug2: "Aspirin",
    expectedSeverity: "Major",
    expectedKeywords: ["bleeding", "anticoagulant"],
  },
  {
    drug1: "Metformin",
    drug2: "Contrast media",
    expectedSeverity: "Major",
    expectedKeywords: ["lactic", "acidosis"],
  },
  {
    drug1: "Simvastatin",
    drug2: "Clarithromycin",
    expectedSeverity: "Major",
    expectedKeywords: ["statin", "myopathy"],
  },
];

const getInteractionCase = (index: number): InteractionCase => {
  const interaction = KNOWN_INTERACTIONS[index];
  if (!interaction) {
    throw new Error(`Missing interaction case at index ${index}.`);
  }
  return interaction;
};

test.describe("Student Journey: Interactions Sandbox", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await seedTestUser(page, testUser);
  });

  test("Select 2 known drugs → Verify deterministic interaction output + severity badge", async ({
    page,
  }) => {
    // Step 1: Login
    console.log("Step 1: Logging in...");
    await loginUser(page, testUser);

    // Step 2: Navigate to interactions
    console.log("Step 2: Navigating to interactions...");
    await navigateToInteractions(page);

    // Use first known interaction pair
    const interaction = getInteractionCase(0);

    // Step 3: Select first drug
    console.log(`Step 3: Selecting drug 1: ${interaction.drug1}...`);
    await selectDrug(page, interaction.drug1, 1);

    // Step 4: Select second drug
    console.log(`Step 4: Selecting drug 2: ${interaction.drug2}...`);
    await selectDrug(page, interaction.drug2, 2);

    // Step 5: Verify interaction result
    console.log("Step 5: Verifying interaction output...");
    const result = await verifyInteractionOutput(page);

    // Step 6: Verify deterministic output
    console.log("Step 6: Checking output determinism...");
    expect(result).toBeTruthy();
    const normalizedResult = (result ?? "").toLowerCase();
    const [primaryKeyword] = interaction.expectedKeywords;
    expect(primaryKeyword).toBeTruthy();
    if (!primaryKeyword) {
      throw new Error("Missing expected keyword for interaction case.");
    }
    expect(normalizedResult).toContain(primaryKeyword.toLowerCase());

    // Step 7: Verify severity badge
    const severityBadge = page.locator('[data-testid="interaction-severity"]');
    await expect(severityBadge).toBeVisible();
    const severityText = await severityBadge.textContent();
    expect(severityText).toContain(interaction.expectedSeverity);

    console.log("✅ Interactions test completed successfully!");
  });

  test("Drug interaction results are deterministic", async ({ page }) => {
    await loginUser(page, testUser);
    await navigateToInteractions(page);

    const interaction = getInteractionCase(0);

    // First attempt
    await selectDrug(page, interaction.drug1, 1);
    await selectDrug(page, interaction.drug2, 2);
    const result1 = await verifyInteractionOutput(page);

    // Clear and try again
    const clearButton = page.locator('[data-testid="interactions-clear"]');
    if (await clearButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await clearButton.click();
    }

    // Reset drug selections
    await page.reload();
    await selectDrug(page, interaction.drug1, 1);
    await selectDrug(page, interaction.drug2, 2);
    const result2 = await verifyInteractionOutput(page);

    // Results should be identical (deterministic)
    expect(result1).toBe(result2);
    console.log("✅ Drug interactions are deterministic!");
  });

  test("Multiple interaction pairs work correctly", async ({ page }) => {
    await loginUser(page, testUser);
    await navigateToInteractions(page);

    // Test all known interaction pairs
    for (const interaction of KNOWN_INTERACTIONS) {
      // Select drugs
      await selectDrug(page, interaction.drug1, 1);
      await selectDrug(page, interaction.drug2, 2);

      // Verify output
      const result = await verifyInteractionOutput(page);
      expect(result).toBeTruthy();

      // Verify severity
      const severity = page.locator('[data-testid="interaction-severity"]');
      await expect(severity).toBeVisible();
      const severityText = await severity.textContent();
      expect(severityText).toContain(interaction.expectedSeverity);

      console.log(`✓ Verified interaction: ${interaction.drug1} + ${interaction.drug2}`);

      // Clear for next iteration
      const clearButton = page.locator('[data-testid="interactions-clear"]');
      if (await clearButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await clearButton.click();
        // Wait for reset
        await page.waitForTimeout(500);
      }
    }

    console.log("✅ All interaction pairs verified!");
  });

  test("Interaction severity levels are visible", async ({ page }) => {
    await loginUser(page, testUser);
    await navigateToInteractions(page);

    const interaction = getInteractionCase(1);
    await selectDrug(page, interaction.drug1, 1);
    await selectDrug(page, interaction.drug2, 2);

    // Verify severity badge structure
    const severityBadge = page.locator('[data-testid="interaction-severity"]');
    await expect(severityBadge).toBeVisible();

    // Check for severity class/styling
    const classList = await severityBadge.evaluate((el) => el.className);
    expect(classList).toContain("severity");

    console.log("✅ Severity badge is properly styled!");
  });
});
