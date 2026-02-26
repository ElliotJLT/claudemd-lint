export type Severity = "error" | "warning" | "info";

export interface LintResult {
  rule: string;
  severity: Severity;
  message: string;
  line?: number;
  suggestion?: string;
}

export interface LintRule {
  name: string;
  description: string;
  run: (content: string, lines: string[]) => LintResult[];
}
