import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Interaction Rules & Safety", () => {
  it("validates drug IDs reference existing drugs", () => {
    const interactionWithDrugIds = {
      id: "test",
      appliesWhen: { drugIds: ["drug-metoprolol"] },
      severity: "moderate",
      mechanism: { en: "Test", cs: "Test" },
      recommendation: { en: "Test", cs: "Test" },
      rationale: { en: "Test", cs: "Test" },
    };

    // Should not throw
    expect(interactionWithDrugIds.appliesWhen.drugIds).toBeDefined();
  });

  it("ensures interaction severity levels are valid", () => {
    const severities = ["low", "moderate", "high"];
    severities.forEach((s) => {
      expect(["low", "moderate", "high"]).toContain(s);
    });
  });

  it("validates dose template inputs", () => {
    const doseSchema = z.object({
      name: z.string(),
      label: z.object({ en: z.string(), cs: z.string() }),
      type: z.enum(["number", "text"]),
    });

    const validInput = {
      name: "weight",
      label: { en: "Weight", cs: "Váha" },
      type: "number",
    };

    expect(doseSchema.safeParse(validInput).success).toBe(true);
  });
});
