import type { LintRule, LintResult } from "../types.js";

const FILE_PROTECTION_PATTERNS = [
  /\b(?:never|don'?t|do not|must not|should not|shouldn'?t)\s+(?:modify|edit|touch|change|update|delete|remove|alter)\s+(.+)/i,
  /\b(?:do not|don'?t|never)\s+(?:write to|overwrite)\s+(.+)/i,
  /\b(.+?)\s+(?:is|are)\s+(?:read[- ]?only|immutable|off[- ]?limits)\b/i,
];

const FORMAT_PATTERNS = [
  /\b(?:always|must|should)\s+run\s+(prettier|eslint|biome|dprint|gofmt|rustfmt|black|autopep8|clang-format)\b/i,
  /\b(?:always|must|should)\s+(?:format|lint)\s+(?:after|before|when)\b/i,
  /\brun\s+(prettier|eslint|biome|dprint)\s+(?:after|on|before)\s+(?:every|each|all)?\s*(?:edit|change|save|write)\b/i,
];

const BLOCKED_CMD_PATTERNS = [
  /\b(?:never|don'?t|do not|must not)\s+(?:run|use|execute)\s+(.+)/i,
  /\b(?:never|don'?t|do not)\s+(?:force[- ]?push|rm\s+-rf|sudo)\b/i,
  /\b(?:forbidden|banned|prohibited|blocked)\s*(?:commands?)?\s*:\s*(.+)/i,
];

function extractFileTarget(match: string): string {
  return match
    .replace(/[`"']/g, "")
    .replace(/\b(the|a|an|any|all|this|that|those|these)\b/gi, "")
    .replace(/\b(file|files|directory|directories|folder|folders)\b/gi, "")
    .replace(/[.,;!]+$/, "")
    .trim()
    .split(/\s/)[0];
}

export const hooksRules: LintRule[] = [
  {
    name: "hooks/file-protection",
    description: '"Never modify X" should be a PreToolUse hook',
    run(_content, lines) {
      const results: LintResult[] = [];
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of FILE_PROTECTION_PATTERNS) {
          const match = lines[i].match(pattern);
          if (match) {
            const target = extractFileTarget(match[1] || "");
            const hookExample = target
              ? `{ "type": "PreToolUse", "matcher": "Edit|Write", "command": "if echo $FILE | grep -q '${target}'; then exit 1; fi" }`
              : `{ "type": "PreToolUse", "matcher": "Edit|Write", "command": "..." }`;
            results.push({
              rule: "hooks/file-protection",
              severity: "warning",
              message: `Line ${i + 1}: "${lines[i].trim().slice(0, 60)}${lines[i].trim().length > 60 ? "..." : ""}" — make this a hook:`,
              line: i + 1,
              suggestion: hookExample,
            });
            break;
          }
        }
      }
      return results;
    },
  },
  {
    name: "hooks/format-after-edit",
    description: '"Always run formatter" should be a PostToolUse hook',
    run(_content, lines) {
      const results: LintResult[] = [];
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of FORMAT_PATTERNS) {
          const match = lines[i].match(pattern);
          if (match) {
            const formatter = match[1] || "prettier";
            results.push({
              rule: "hooks/format-after-edit",
              severity: "warning",
              message: `Line ${i + 1}: "${lines[i].trim().slice(0, 60)}${lines[i].trim().length > 60 ? "..." : ""}" — make this a hook:`,
              line: i + 1,
              suggestion: `{ "type": "PostToolUse", "matcher": "Edit|Write", "command": "${formatter.toLowerCase()} --write $FILE" }`,
            });
            break;
          }
        }
      }
      return results;
    },
  },
  {
    name: "hooks/blocked-commands",
    description: '"Never run X" should be a PreToolUse hook',
    run(_content, lines) {
      const results: LintResult[] = [];
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of BLOCKED_CMD_PATTERNS) {
          const match = lines[i].match(pattern);
          if (match) {
            results.push({
              rule: "hooks/blocked-commands",
              severity: "warning",
              message: `Line ${i + 1}: "${lines[i].trim().slice(0, 60)}${lines[i].trim().length > 60 ? "..." : ""}" — make this a hook:`,
              line: i + 1,
              suggestion: `{ "type": "PreToolUse", "matcher": "Bash", "command": "# reject the specific command pattern" }`,
            });
            break;
          }
        }
      }
      return results;
    },
  },
];
