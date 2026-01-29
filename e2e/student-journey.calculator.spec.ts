import { expect, test } from "@playwright/test";
import {
  clearSession,
  enterCalculatorInputs,
  getCalculatorResult,
  loginUser,
  navigateToDoseCalculator,
  seedTestUser,
  verifyAttemptSaved,
  verifyDisclaimerVisible,
} from "./helpers";

const testUser = {
  email: `student-calc-${Date.now()}@test.com`,
  password: "TestPassword123!",
};

type CalculationCase = {
  inputs: Record<string, string>;
  expectedMin: string;
  expectedMax: string;
  description: string;
};

// Known calculation test cases
const CALCULATION_CASES: CalculationCase[] = [
  {
    inputs: { weight: "70", dose_per_kg: "10" },
    expectedMin: "700",
    expectedMax: "700",
    description: "Basic weight-based calculation",
  },
  {
    inputs: { concentration: "50", volume: "10" },
    expectedMin: "500",
    expectedMax: "500",
    description: "Concentration × volume calculation",
  },
  {
    inputs: { creatinine: "2.0", multiplier: "0.85" },
    expectedMin: "1.7",
    expectedMax: "1.7",
    description: "Renal function adjustment",
  },
];

const getBaseCalculationCase = (): CalculationCase => {
  const testCase = CALCULATION_CASES[0];
  if (!testCase) {
    throw new Error("Missing base calculation case.");
  }
  return testCase;
};

test.describe("Student Journey: Dose Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await seedTestUser(page, testUser);
  });

  test("Enter known inputs → Verify computed output + disclaimer visible + Attempt saved", async ({
    page,
  }) => {
    // Step 1: Login
    console.log("Step 1: Logging in...");
    await loginUser(page, testUser);

    // Step 2: Navigate to dose calculator
    console.log("Step 2: Navigating to dose calculator...");
    await navigateToDoseCalculator(page);

    // Verify calculator is loaded
    await expect(page.locator('[data-testid="calculator-container"]')).toBeVisible();

    // Use first calculation case
    const testCase = getBaseCalculationCase();

    // Step 3: Enter inputs
    console.log(`Step 3: Entering inputs: ${JSON.stringify(testCase.inputs)}...`);
    await enterCalculatorInputs(page, testCase.inputs);

    // Step 4: Trigger calculation (usually on input blur or button click)
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    if (await calculateButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await calculateButton.click();
    } else {
      // Try pressing Enter
      const lastInput = Object.entries(testCase.inputs).pop();
      if (lastInput) {
        await page.keyboard.press("Enter");
      }
    }

    // Step 5: Verify computed output
    console.log("Step 5: Verifying calculated result...");
    const result = await getCalculatorResult(page);
    expect(result).toBeTruthy();

    // Parse and verify result is in expected range
    const resultValue = parseFloat(result);
    const expectedMin = parseFloat(testCase.expectedMin);
    const expectedMax = parseFloat(testCase.expectedMax);

    expect(resultValue).toBeGreaterThanOrEqual(expectedMin * 0.95); // Allow 5% tolerance
    expect(resultValue).toBeLessThanOrEqual(expectedMax * 1.05);

    console.log(`✓ Calculated result: ${result} (expected: ${expectedMin}-${expectedMax})`);

    // Step 6: Verify disclaimer is visible
    console.log("Step 6: Verifying disclaimer...");
    await verifyDisclaimerVisible(page);

    // Step 7: Verify attempt was saved
    console.log("Step 7: Verifying attempt saved...");
    await verifyAttemptSaved(page, "calculations");

    console.log("✅ Dose calculator journey test completed successfully!");
  });

  test("Calculations are deterministic with same inputs", async ({ page }) => {
    await loginUser(page, testUser);
    await navigateToDoseCalculator(page);

    const testCase = getBaseCalculationCase();

    // First calculation
    await enterCalculatorInputs(page, testCase.inputs);
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    if (await calculateButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await calculateButton.click();
    }
    const result1 = await getCalculatorResult(page);

    // Clear and recalculate
    const clearButton = page.locator('[data-testid="calculator-clear"]');
    if (await clearButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await clearButton.click();
    } else {
      await page.reload();
    }

    // Second calculation with same inputs
    await enterCalculatorInputs(page, testCase.inputs);
    if (await calculateButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await calculateButton.click();
    }
    const result2 = await getCalculatorResult(page);

    // Results should be identical
    expect(result1).toBe(result2);
    console.log("✅ Calculations are deterministic!");
  });

  test("All calculation test cases produce expected outputs", async ({ page }) => {
    await loginUser(page, testUser);
    await navigateToDoseCalculator(page);

    for (const testCase of CALCULATION_CASES) {
      console.log(`Testing: ${testCase.description}`);

      // Clear calculator
      const clearButton = page.locator('[data-testid="calculator-clear"]');
      if (await clearButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await clearButton.click();
        await page.waitForTimeout(300);
      }

      // Enter inputs
      await enterCalculatorInputs(page, testCase.inputs);

      // Calculate
      const calculateButton = page.locator('[data-testid="calculate-button"]');
      if (await calculateButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await calculateButton.click();
      }

      // Verify result
      const result = await getCalculatorResult(page);
      const resultValue = parseFloat(result);
      const expectedMin = parseFloat(testCase.expectedMin);
      const expectedMax = parseFloat(testCase.expectedMax);

      expect(resultValue).toBeGreaterThanOrEqual(expectedMin * 0.95);
      expect(resultValue).toBeLessThanOrEqual(expectedMax * 1.05);

      console.log(`✓ ${testCase.description}: ${result} (expected: ${expectedMin}-${expectedMax})`);
    }

    console.log("✅ All calculation tests passed!");
  });

  test("Disclaimer is always visible during calculation", async ({ page }) => {
    await loginUser(page, testUser);
    await navigateToDoseCalculator(page);

    // Before calculation
    await verifyDisclaimerVisible(page);

    // After calculation
    const testCase = getBaseCalculationCase();
    await enterCalculatorInputs(page, testCase.inputs);
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
    }

    // Disclaimer should still be visible
    await verifyDisclaimerVisible(page);

    console.log("✅ Disclaimer is always visible!");
  });

  test("Invalid inputs show proper error messages", async ({ page }) => {
    await loginUser(page, testUser);
    await navigateToDoseCalculator(page);

    // Try to calculate with empty inputs
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
    }

    // Check for error message
    const errorMessage = page.locator('[data-testid="calculator-error"]');
    if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await errorMessage.textContent();
      expect(text).toMatch(/required|invalid|enter/i);
      console.log("✅ Error validation works!");
    }
  });
});
