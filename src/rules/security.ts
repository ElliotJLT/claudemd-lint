import type { LintRule, LintResult } from "../types.js";

const SECRET_PATTERNS = [
  { pattern: /\b(?:sk|pk)[-_](?:live|test|prod)[-_][a-zA-Z0-9]{20,}/g, label: "API key" },
  { pattern: /\bghp_[a-zA-Z0-9]{36,}\b/g, label: "GitHub personal access token" },
  { pattern: /\bgho_[a-zA-Z0-9]{36,}\b/g, label: "GitHub OAuth token" },
  { pattern: /\bghs_[a-zA-Z0-9]{36,}\b/g, label: "GitHub app token" },
  { pattern: /\bxoxb-[0-9]+-[a-zA-Z0-9]+/g, label: "Slack bot token" },
  { pattern: /\bxoxp-[0-9]+-[a-zA-Z0-9]+/g, label: "Slack user token" },
  { pattern: /\bAKIA[0-9A-Z]{16}\b/g, label: "AWS access key" },
  { pattern: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/gi, label: "hardcoded password" },
  { pattern: /(?:api[_-]?key|apikey|secret[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/gi, label: "hardcoded API key" },
  { pattern: /\bey[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\b/g, label: "JWT token" },
];

const DANGEROUS_PATTERNS = [
  { pattern: /\brm\s+-rf\s+\/(?:\s|$)/, label: "rm -rf /" },
  { pattern: /\brm\s+-rf\s+~(?:\s|$)/, label: "rm -rf ~" },
  { pattern: /\bcurl\s+.*\|\s*(?:sudo\s+)?(?:ba)?sh\b/, label: "curl | bash" },
  { pattern: /\bwget\s+.*\|\s*(?:sudo\s+)?(?:ba)?sh\b/, label: "wget | bash" },
  { pattern: /:\(\)\s*\{\s*:\|:&\s*\}\s*;?\s*:/, label: "fork bomb" },
  { pattern: /\bdd\s+.*of=\/dev\/[sh]d[a-z]\b/, label: "dd to disk device" },
  { pattern: /\bmkfs\b/, label: "mkfs (format disk)" },
  { pattern: /\bchmod\s+-R\s+777\s+\//, label: "chmod -R 777 /" },
];

export const securityRules: LintRule[] = [
  {
    name: "security/no-secrets",
    description: "Detect API keys, tokens, passwords",
    run(_content, lines) {
      const results: LintResult[] = [];

      for (let i = 0; i < lines.length; i++) {
        // Skip lines inside code block markers themselves
        if (lines[i].trim().startsWith("```")) continue;

        for (const { pattern, label } of SECRET_PATTERNS) {
          // Reset regex lastIndex for global patterns
          pattern.lastIndex = 0;
          if (pattern.test(lines[i])) {
            results.push({
              rule: "security/no-secrets",
              severity: "error",
              message: `Line ${i + 1}: Possible ${label} detected. Never put secrets in CLAUDE.md.`,
              line: i + 1,
            });
            break;
          }
        }
      }

      if (results.length === 0) {
        return [
          {
            rule: "security/no-secrets",
            severity: "info",
            message: "No secrets detected.",
          },
        ];
      }
      return results;
    },
  },
  {
    name: "security/no-dangerous-commands",
    description: "Detect dangerous commands in examples",
    run(_content, lines) {
      const results: LintResult[] = [];

      for (let i = 0; i < lines.length; i++) {
        for (const { pattern, label } of DANGEROUS_PATTERNS) {
          if (pattern.test(lines[i])) {
            results.push({
              rule: "security/no-dangerous-commands",
              severity: "error",
              message: `Line ${i + 1}: Dangerous command "${label}" found. Remove or replace with a safer alternative.`,
              line: i + 1,
            });
            break;
          }
        }
      }

      return results;
    },
  },
];
