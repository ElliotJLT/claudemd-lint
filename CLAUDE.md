# CLAUDE.md

## Build & Run
- `npm run build` — compile TypeScript to `dist/`
- `npm run dev` — run CLI via tsx during development
- `npm test` — run vitest

## Architecture
- `src/cli.ts` — entry point, commander setup, output formatting
- `src/lint.ts` — core linter, runs all rules against file content
- `src/types.ts` — shared types (LintResult, LintRule, Severity)
- `src/rules/*.ts` — one file per rule category (size, structure, content, hooks, security)

## Conventions
- ESM-only (`"type": "module"` in package.json)
- Each rule file exports an array of `LintRule` objects
- Rules are pure functions: `(content: string, lines: string[]) => LintResult[]`
- Use chalk for terminal colours, never raw ANSI codes
- Keep dependencies minimal — only commander and chalk at runtime
