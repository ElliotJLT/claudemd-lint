import { sizeRules } from "./rules/size.js";
import { structureRules } from "./rules/structure.js";
import { contentRules } from "./rules/content.js";
import { hooksRules } from "./rules/hooks.js";
import { securityRules } from "./rules/security.js";
import type { LintResult, LintRule } from "./types.js";

const allRules: LintRule[] = [
  ...sizeRules,
  ...structureRules,
  ...contentRules,
  ...hooksRules,
  ...securityRules,
];

export interface LintReport {
  file: string;
  lines: number;
  characters: number;
  estimatedTokens: number;
  results: LintResult[];
  score: number;
  counts: {
    errors: number;
    warnings: number;
    info: number;
    passed: number;
  };
}

function computeScore(results: LintResult[]): number {
  let score = 10;

  // Count errors
  const errors = results.filter((r) => r.severity === "error");
  score -= errors.length * 2;

  // Count warnings per rule category (cap at -1 per category)
  const warningCategories = new Set<string>();
  for (const r of results) {
    if (r.severity === "warning") {
      const category = r.rule.split("/")[0];
      warningCategories.add(category);
    }
  }
  score -= warningCategories.size;

  return Math.max(0, Math.min(10, score));
}

export function lint(content: string, filePath: string): LintReport {
  const lines = content.split("\n");
  const results: LintResult[] = [];

  for (const rule of allRules) {
    const ruleResults = rule.run(content, lines);
    results.push(...ruleResults);
  }

  const errors = results.filter((r) => r.severity === "error").length;
  const warnings = results.filter((r) => r.severity === "warning").length;
  const info = results.filter((r) => r.severity === "info").length;

  // Count "passed" as info results that indicate something good
  // (rules that returned info-level positive messages)
  const passed = results.filter(
    (r) =>
      r.severity === "info" &&
      (r.message.includes("good") ||
        r.message.includes("Has ") ||
        r.message.includes("No secrets")),
  ).length;

  return {
    file: filePath,
    lines: lines.length,
    characters: content.length,
    estimatedTokens: Math.round(content.length / 4),
    results,
    score: computeScore(results),
    counts: {
      errors,
      warnings,
      info: info - passed,
      passed,
    },
  };
}
