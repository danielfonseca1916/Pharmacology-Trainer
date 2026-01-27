import type { DatasetBundle } from "./schemas";
import { datasetBundleSchema } from "./schemas";
import type { LintIssue, ValidationResult } from "./types";

export function validateDataset(bundle: unknown): ValidationResult {
  const issues: LintIssue[] = [];
  
  const parsed = datasetBundleSchema.safeParse(bundle);
  
  if (!parsed.success) {
    const zodErrors = parsed.error.format();
    
    // Convert Zod errors to LintIssues
    function extractZodErrors(obj: Record<string, unknown>, prefix = ""): void {
      for (const key in obj) {
        if (key === "_errors" && Array.isArray(obj[key])) {
          for (const err of obj[key]) {
            issues.push({
              type: "schema",
              severity: "error",
              message: err,
              path: prefix,
            });
          }
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          extractZodErrors(obj[key] as Record<string, unknown>, prefix ? `${prefix}.${key}` : key);
        }
      }
    }
    
    extractZodErrors(zodErrors);
    
    return {
      valid: false,
      errors: issues.filter((i) => i.severity === "error"),
      warnings: issues.filter((i) => i.severity === "warning"),
    };
  }

  // Run additional linting on valid data
  const lintIssues = lintDataset(parsed.data);
  issues.push(...lintIssues);

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    errors: issues.filter((i) => i.severity === "error"),
    warnings: issues.filter((i) => i.severity === "warning"),
  };
}

export function lintDataset(data: DatasetBundle): LintIssue[] {
  const issues: LintIssue[] = [];

  // Check for duplicate IDs within each collection
  function checkDuplicateIds<T extends { id: string }>(
    items: T[],
    collectionName: string
  ): void {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) {
        issues.push({
          type: "duplicate-id",
          severity: "error",
          message: `Duplicate ID found: ${item.id}`,
          file: collectionName,
          id: item.id,
        });
      }
      seen.add(item.id);
    }
  }

  checkDuplicateIds(data.courseBlocks, "courseBlocks");
  checkDuplicateIds(data.drugs, "drugs");
  checkDuplicateIds(data.questions, "questions");
  checkDuplicateIds(data.cases, "cases");
  checkDuplicateIds(data.interactions, "interactions");
  checkDuplicateIds(data.doseTemplates, "doseTemplates");

  // Check for missing or empty translations
  function checkI18nField(
    obj: { en: string; cs: string },
    fieldPath: string,
    id: string
  ): void {
    if (!obj.en || !obj.en.trim()) {
      issues.push({
        type: "missing-translation",
        severity: "error",
        message: `Missing English translation`,
        path: `${fieldPath}.en`,
        id,
      });
    }
    if (!obj.cs || !obj.cs.trim()) {
      issues.push({
        type: "missing-translation",
        severity: "warning",
        message: `Missing Czech translation`,
        path: `${fieldPath}.cs`,
        id,
      });
    }
  }

  // Validate courseBlocks
  for (const block of data.courseBlocks) {
    checkI18nField(block.title, "courseBlocks.title", block.id);
    checkI18nField(block.description, "courseBlocks.description", block.id);
  }

  // Validate drugs
  for (const drug of data.drugs) {
    checkI18nField(drug.name, "drugs.name", drug.id);
    checkI18nField(drug.class, "drugs.class", drug.id);
    checkI18nField(drug.indications, "drugs.indications", drug.id);
    checkI18nField(drug.mechanism, "drugs.mechanism", drug.id);
    checkI18nField(drug.adverseEffects, "drugs.adverseEffects", drug.id);
    checkI18nField(drug.contraindications, "drugs.contraindications", drug.id);
    checkI18nField(drug.monitoring, "drugs.monitoring", drug.id);
    checkI18nField(drug.interactionsSummary, "drugs.interactionsSummary", drug.id);
    checkI18nField(drug.typicalDoseText, "drugs.typicalDoseText", drug.id);

    // Check tags format
    for (const tag of drug.tags) {
      if (tag !== tag.toLowerCase().trim()) {
        issues.push({
          type: "tag-format",
          severity: "warning",
          message: `Tag should be lowercase and trimmed: "${tag}"`,
          path: "drugs.tags",
          id: drug.id,
        });
      }
    }
  }

  // Validate questions
  for (const question of data.questions) {
    checkI18nField(question.stem, "questions.stem", question.id);
    checkI18nField(question.explanation, "questions.explanation", question.id);
    
    for (let i = 0; i < question.options.length; i++) {
      checkI18nField(
        question.options[i].text,
        `questions.options[${i}].text`,
        question.id
      );
    }

    // Check that at least one option is correct
    const hasCorrect = question.options.some((opt) => opt.correct);
    if (!hasCorrect) {
      issues.push({
        type: "schema",
        severity: "error",
        message: "No correct option marked",
        path: "questions.options",
        id: question.id,
      });
    }
  }

  // Validate cases
  for (const caseStudy of data.cases) {
    checkI18nField(caseStudy.stem, "cases.stem", caseStudy.id);
    
    for (let i = 0; i < caseStudy.choices.length; i++) {
      checkI18nField(
        caseStudy.choices[i].option,
        `cases.choices[${i}].option`,
        caseStudy.id
      );
      checkI18nField(
        caseStudy.choices[i].explanation,
        `cases.choices[${i}].explanation`,
        caseStudy.id
      );
    }

    // Validate rubric references
    const choiceIds = new Set(caseStudy.choices.map((c) => c.id));
    if (!choiceIds.has(caseStudy.rubric.correctChoiceId)) {
      issues.push({
        type: "broken-ref",
        severity: "error",
        message: `Rubric references non-existent choice: ${caseStudy.rubric.correctChoiceId}`,
        path: "cases.rubric.correctChoiceId",
        id: caseStudy.id,
      });
    }
  }

  // Validate interactions
  for (const interaction of data.interactions) {
    checkI18nField(interaction.mechanism, "interactions.mechanism", interaction.id);
    checkI18nField(interaction.recommendation, "interactions.recommendation", interaction.id);
    checkI18nField(interaction.rationale, "interactions.rationale", interaction.id);
  }

  // Validate dose templates
  for (const template of data.doseTemplates) {
    checkI18nField(template.title, "doseTemplates.title", template.id);
    checkI18nField(template.formula, "doseTemplates.formula", template.id);
    checkI18nField(template.example, "doseTemplates.example", template.id);
    
    for (let i = 0; i < template.inputs.length; i++) {
      checkI18nField(
        template.inputs[i].label,
        `doseTemplates.inputs[${i}].label`,
        template.id
      );
    }
  }

  // Check for broken references
  const blockIds = new Set(data.courseBlocks.map((b) => b.id));
  const drugIds = new Set(data.drugs.map((d) => d.id));

  // Check drugs reference valid course blocks
  for (const drug of data.drugs) {
    if (!blockIds.has(drug.courseBlockId)) {
      issues.push({
        type: "broken-ref",
        severity: "error",
        message: `References non-existent course block: ${drug.courseBlockId}`,
        path: "drugs.courseBlockId",
        id: drug.id,
      });
    }
  }

  // Check questions reference valid course blocks
  for (const question of data.questions) {
    if (!blockIds.has(question.courseBlockId)) {
      issues.push({
        type: "broken-ref",
        severity: "error",
        message: `References non-existent course block: ${question.courseBlockId}`,
        path: "questions.courseBlockId",
        id: question.id,
      });
    }
  }

  // Check cases reference valid course blocks
  for (const caseStudy of data.cases) {
    if (!blockIds.has(caseStudy.courseBlockId)) {
      issues.push({
        type: "broken-ref",
        severity: "error",
        message: `References non-existent course block: ${caseStudy.courseBlockId}`,
        path: "cases.courseBlockId",
        id: caseStudy.id,
      });
    }
  }

  // Check interactions reference valid drugs
  for (const interaction of data.interactions) {
    if (interaction.appliesWhen.drugIds) {
      for (const drugId of interaction.appliesWhen.drugIds) {
        if (!drugIds.has(drugId)) {
          issues.push({
            type: "broken-ref",
            severity: "error",
            message: `References non-existent drug: ${drugId}`,
            path: "interactions.appliesWhen.drugIds",
            id: interaction.id,
          });
        }
      }
    }
  }

  return issues;
}
