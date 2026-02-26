import type { LintRule } from "../types.js";

export const structureRules: LintRule[] = [
  {
    name: "structure/has-headings",
    description: "Must have at least one ## heading",
    run(_content, lines) {
      const headings = lines.filter((l) => /^#{1,6}\s/.test(l));
      if (headings.length === 0) {
        return [
          {
            rule: "structure/has-headings",
            severity: "error",
            message:
              "No headings found. Use ## headings to organise rules into sections.",
          },
        ];
      }
      return [
        {
          rule: "structure/has-headings",
          severity: "info",
          message: `Has ${headings.length} heading${headings.length === 1 ? "" : "s"}.`,
        },
      ];
    },
  },
  {
    name: "structure/no-wall-of-text",
    description: "No paragraphs >5 lines without structure",
    run(_content, lines) {
      const results: import("../types.js").LintResult[] = [];
      let runLength = 0;
      let runStart = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const isStructured =
          line === "" ||
          line.startsWith("#") ||
          line.startsWith("-") ||
          line.startsWith("*") ||
          line.startsWith(">") ||
          /^\d+\./.test(line) ||
          line.startsWith("```");

        if (isStructured) {
          if (runLength > 5) {
            results.push({
              rule: "structure/no-wall-of-text",
              severity: "warning",
              message: `Lines ${runStart + 1}–${i}: ${runLength}-line wall of text. Break it up with bullets or headings.`,
              line: runStart + 1,
            });
          }
          runLength = 0;
        } else {
          if (runLength === 0) runStart = i;
          runLength++;
        }
      }

      if (runLength > 5) {
        results.push({
          rule: "structure/no-wall-of-text",
          severity: "warning",
          message: `Lines ${runStart + 1}–${lines.length}: ${runLength}-line wall of text. Break it up with bullets or headings.`,
          line: runStart + 1,
        });
      }

      return results;
    },
  },
  {
    name: "structure/uses-bullets",
    description: "Rules should use bullet points for compliance",
    run(_content, lines) {
      const bullets = lines.filter((l) => /^\s*[-*]\s/.test(l));
      if (bullets.length === 0) {
        return [
          {
            rule: "structure/uses-bullets",
            severity: "info",
            message:
              "No bullet points found. Bulleted rules get ~35% higher compliance than prose.",
          },
        ];
      }
      return [];
    },
  },
];
