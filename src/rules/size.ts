import type { LintRule } from "../types.js";

export const sizeRules: LintRule[] = [
  {
    name: "size/lines",
    description: "Check total line count",
    run(_content, lines) {
      const count = lines.length;
      if (count > 200) {
        return [
          {
            rule: "size/lines",
            severity: "error",
            message: `File is ${count} lines (max 200). Rules beyond ~150 lines get ignored.`,
          },
        ];
      }
      if (count > 100) {
        return [
          {
            rule: "size/lines",
            severity: "warning",
            message: `File is ${count} lines. Consider trimming to <100 for best results.`,
          },
        ];
      }
      return [
        {
          rule: "size/lines",
          severity: "info",
          message: `${count} lines — good length.`,
        },
      ];
    },
  },
  {
    name: "size/characters",
    description: "Check total character count",
    run(content) {
      const count = content.length;
      const kb = (count / 1024).toFixed(1);
      if (count > 10240) {
        return [
          {
            rule: "size/characters",
            severity: "error",
            message: `File is ${kb}KB (max 10KB). Large files dilute important rules.`,
          },
        ];
      }
      if (count > 5120) {
        return [
          {
            rule: "size/characters",
            severity: "warning",
            message: `File is ${kb}KB. Aim for <5KB to keep rules focused.`,
          },
        ];
      }
      return [];
    },
  },
  {
    name: "size/estimated-tokens",
    description: "Estimate token count (chars / 4)",
    run(content) {
      const tokens = Math.round(content.length / 4);
      if (tokens > 2000) {
        return [
          {
            rule: "size/estimated-tokens",
            severity: "error",
            message: `~${tokens.toLocaleString()} tokens. This eats into context — aim for <1,000.`,
          },
        ];
      }
      if (tokens > 1000) {
        return [
          {
            rule: "size/estimated-tokens",
            severity: "warning",
            message: `~${tokens.toLocaleString()} tokens. Aim for <1,000 to leave room for context.`,
          },
        ];
      }
      return [];
    },
  },
];
