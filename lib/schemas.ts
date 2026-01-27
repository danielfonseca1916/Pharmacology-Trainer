import { z } from "zod";

const i18nText = z.object({ en: z.string(), cs: z.string() });

export const courseBlockSchema = z.object({
  id: z.string(),
  title: i18nText,
  description: i18nText,
});

export const drugSchema = z.object({
  id: z.string(),
  name: i18nText,
  class: i18nText,
  indications: i18nText,
  mechanism: i18nText,
  adverseEffects: i18nText,
  contraindications: i18nText,
  monitoring: i18nText,
  interactionsSummary: i18nText,
  typicalDoseText: i18nText,
  tags: z.array(z.string()),
  courseBlockId: z.string(),
});

export const questionSchema = z.object({
  id: z.string(),
  stem: i18nText,
  options: z.array(
    z.object({
      id: z.string(),
      text: i18nText,
      correct: z.boolean(),
    })
  ),
  explanation: i18nText,
  tags: z.array(z.string()),
  courseBlockId: z.string(),
});

export const caseSchema = z.object({
  id: z.string(),
  stem: i18nText,
  patient: z.object({
    age: z.number().optional(),
    sex: z.string().optional(),
    weightKg: z.number().optional(),
  }),
  vitals: z.record(z.string().or(z.number())),
  labs: z.record(z.number()).optional(),
  choices: z.array(
    z.object({
      id: z.string(),
      option: i18nText,
      explanation: i18nText,
    })
  ),
  rubric: z.object({
    correctChoiceId: z.string(),
    contraindicationsMissed: z.array(z.string()),
    interactionsMissed: z.array(z.string()),
    monitoringMissing: z.array(z.string()),
    scoring: z.object({ correct: z.number(), safety: z.number(), monitoring: z.number() }),
  }),
  courseBlockId: z.string(),
  tags: z.array(z.string()),
});

export const interactionRuleSchema = z.object({
  id: z.string(),
  appliesWhen: z.object({
    drugIds: z.array(z.string()).optional(),
    classes: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
  severity: z.enum(["low", "moderate", "high"]),
  mechanism: i18nText,
  recommendation: i18nText,
  rationale: i18nText,
});

export const doseTemplateSchema = z.object({
  id: z.string(),
  title: i18nText,
  inputs: z.array(
    z.object({
      name: z.string(),
      label: i18nText,
      type: z.enum(["number", "text"]),
    })
  ),
  formula: i18nText,
  example: i18nText,
  tags: z.array(z.string()),
});

export type CourseBlock = z.infer<typeof courseBlockSchema>;
export type Drug = z.infer<typeof drugSchema>;
export type Question = z.infer<typeof questionSchema>;
export type CaseStudy = z.infer<typeof caseSchema>;
export type InteractionRule = z.infer<typeof interactionRuleSchema>;
export type DoseTemplate = z.infer<typeof doseTemplateSchema>;

export const datasetSchema = {
  courseBlocks: z.array(courseBlockSchema),
  drugs: z.array(drugSchema),
  questions: z.array(questionSchema),
  cases: z.array(caseSchema),
  interactions: z.array(interactionRuleSchema),
  doseTemplates: z.array(doseTemplateSchema),
};
