export type LintIssue = {
  type: "schema" | "duplicate-id" | "missing-translation" | "broken-ref" | "empty-field" | "tag-format";
  severity: "error" | "warning";
  message: string;
  file?: string;
  path?: string;
  id?: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: LintIssue[];
  warnings: LintIssue[];
};

export type FileValidationResult = {
  file: string;
  valid: boolean;
  errors: LintIssue[];
  warnings: LintIssue[];
};
