import type { LintRule, LintResult } from "../types.js";

const VAGUE_PATTERNS = [
  { pattern: /\bproperly\b/i, label: "properly" },
  { pattern: /\bbest practices?\b/i, label: "best practices" },
  { pattern: /\bclean code\b/i, label: "clean code" },
  { pattern: /\bbe careful\b/i, label: "be careful" },
  { pattern: /\bas appropriate\b/i, label: "as appropriate" },
  { pattern: /\bwhen necessary\b/i, label: "when necessary" },
  { pattern: /\bif needed\b/i, label: "if needed" },
  { pattern: /\bgood practices?\b/i, label: "good practices" },
  { pattern: /\bmake sure\b/i, label: "make sure" },
  { pattern: /\btry to\b/i, label: "try to" },
];

const BUILD_PATTERNS = [
  /\bnpm (run )?(build|test|lint)\b/,
  /\byarn (run )?(build|test|lint)\b/,
  /\bpnpm (run )?(build|test|lint)\b/,
  /\bbun (run )?(build|test|lint)\b/,
  /\bmake\b/,
  /\bcargo (build|test|clippy)\b/,
  /\bgo (build|test|vet)\b/,
  /\bpytest\b/,
  /\bgradle\b/,
  /\bmvn\b/,
];

const FILE_LISTING_PATTERN =
  /^[-*]\s+`[^`]+\.(ts|js|py|rs|go|java|tsx|jsx|css|html|json|yaml|yml|toml)`\s*([-–—:]|$)/;

export const contentRules: LintRule[] = [
  {
    name: "content/no-vague-language",
    description: 'Detect vague language like "properly", "best practices"',
    run(_content, lines) {
      const results: LintResult[] = [];
      for (let i = 0; i < lines.length; i++) {
        // Skip code blocks
        if (lines[i].trim().startsWith("```")) continue;

        for (const { pattern, label } of VAGUE_PATTERNS) {
          if (pattern.test(lines[i])) {
            results.push({
              rule: "content/no-vague-language",
              severity: "warning",
              message: `Line ${i + 1}: "${label}" — too vague, Claude deprioritises this.`,
              line: i + 1,
              suggestion: `Replace with a specific, actionable instruction.`,
            });
            break; // One warning per line
          }
        }
      }
      return results;
    },
  },
  {
    name: "content/has-build-commands",
    description: "Should include build/test/lint commands",
    run(content) {
      const hasBuildCmd = BUILD_PATTERNS.some((p) => p.test(content));
      if (!hasBuildCmd) {
        return [
          {
            rule: "content/has-build-commands",
            severity: "warning",
            message:
              "No build/test/lint commands found. Include them so Claude knows how to verify changes.",
          },
        ];
      }
      return [];
    },
  },
  {
    name: "content/no-file-listing",
    description: "Detect exhaustive file-by-file descriptions",
    run(_content, lines) {
      let consecutiveFileLines = 0;
      let startLine = 0;

      const results: LintResult[] = [];

      for (let i = 0; i < lines.length; i++) {
        if (FILE_LISTING_PATTERN.test(lines[i].trim())) {
          if (consecutiveFileLines === 0) startLine = i;
          consecutiveFileLines++;
        } else {
          if (consecutiveFileLines >= 8) {
            results.push({
              rule: "content/no-file-listing",
              severity: "warning",
              message: `Lines ${startLine + 1}–${i}: ${consecutiveFileLines} consecutive file descriptions. Claude can read your codebase — focus on conventions, not inventory.`,
              line: startLine + 1,
            });
          }
          consecutiveFileLines = 0;
        }
      }

      if (consecutiveFileLines >= 8) {
        results.push({
          rule: "content/no-file-listing",
          severity: "warning",
          message: `Lines ${startLine + 1}–${lines.length}: ${consecutiveFileLines} consecutive file descriptions. Claude can read your codebase — focus on conventions, not inventory.`,
          line: startLine + 1,
        });
      }

      return results;
    },
  },
  {
    name: "content/uses-imperatives",
    description: "Instructions should be imperative voice",
    run(_content, lines) {
      const results: LintResult[] = [];
      const descriptivePatterns = [
        {
          pattern: /^(?:the|this|our|my)\s+(?:project|app|codebase|repo|system)\s+(?:uses?|is|has)\b/i,
          suggestion: "Rewrite as an imperative instruction",
        },
        {
          pattern: /^we\s+(?:use|prefer|like|want|need)\b/i,
          suggestion: "Rewrite as an imperative: \"Use X\" instead of \"We use X\"",
        },
      ];

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        // Skip headings, bullets, code blocks, empty lines
        if (
          !trimmed ||
          trimmed.startsWith("#") ||
          trimmed.startsWith("-") ||
          trimmed.startsWith("*") ||
          trimmed.startsWith(">") ||
          trimmed.startsWith("`")
        )
          continue;

        // Also check bullet content (after the - or *)
        const bulletContent = trimmed.replace(/^[-*]\s+/, "");

        for (const { pattern, suggestion } of descriptivePatterns) {
          if (pattern.test(trimmed) || pattern.test(bulletContent)) {
            results.push({
              rule: "content/uses-imperatives",
              severity: "info",
              message: `Line ${i + 1}: "${trimmed.slice(0, 50)}${trimmed.length > 50 ? "..." : ""}"`,
              line: i + 1,
              suggestion,
            });
            break;
          }
        }
      }
      return results;
    },
  },
];
