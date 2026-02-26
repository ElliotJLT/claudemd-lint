# claudemd-lint

[![GitHub](https://img.shields.io/github/license/ElliotJLT/claudemd-lint)](https://github.com/ElliotJLT/claudemd-lint)

Lint your `CLAUDE.md` files. Catch vague rules, bloated configs, and instructions that should be hooks.

```
$ npx claudemd-lint

  claudemd-lint v0.1.0

  ./CLAUDE.md (34 lines, ~314 tokens)

  ⚠ content/no-vague-language Line 6: "best practices" — too vague, Claude deprioritises this.
  ⚠ hooks/file-protection   Line 12: "Never modify the .env file." — make this a hook:
                            { "type": "PreToolUse", "matcher": "Edit|Write",
                              "command": "if echo $FILE | grep -q '.env'; then exit 1; fi" }
  ✔ size/lines              34 lines — good length.
  ✔ security/no-secrets     No secrets detected.

  0 errors · 2 warnings · 2 passed · 0 info

  Score: 8/10
```

## Install

```bash
# Run directly
npx claudemd-lint

# Or install globally
npm install -g claudemd-lint
```

## Usage

```bash
# Lint ./CLAUDE.md in current directory
claudemd-lint

# Lint a specific file
claudemd-lint path/to/CLAUDE.md
```

Exit code is `1` if any errors are found, `0` otherwise.

## Rules

### Size (3 rules)

| Rule | Green | Yellow | Red |
|------|-------|--------|-----|
| `size/lines` | <100 | 100–200 | >200 |
| `size/characters` | <5KB | 5–10KB | >10KB |
| `size/estimated-tokens` | <1000 | 1000–2000 | >2000 |

### Structure (3 rules)

- **`structure/has-headings`** — must have at least one heading (error)
- **`structure/no-wall-of-text`** — no paragraphs >5 lines without structure (warning)
- **`structure/uses-bullets`** — rules should use bullet points (info)

### Content (4 rules)

- **`content/no-vague-language`** — detects "properly", "best practices", "clean code", "be careful" (warning)
- **`content/has-build-commands`** — should include build/test/lint commands (warning)
- **`content/no-file-listing`** — detects exhaustive file-by-file descriptions (warning)
- **`content/uses-imperatives`** — instructions should be imperative voice (info)

### Hooks (3 rules)

The differentiator. These detect instructions that **should be [Claude Code hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)** instead of advisory text in CLAUDE.md:

- **`hooks/file-protection`** — "never modify X" → PreToolUse hook (warning)
- **`hooks/format-after-edit`** — "always run prettier" → PostToolUse hook (warning)
- **`hooks/blocked-commands`** — "never run rm -rf" → PreToolUse hook (warning)

Each includes a concrete hook config suggestion you can copy-paste.

### Security (2 rules)

- **`security/no-secrets`** — detects API keys, tokens, passwords (error)
- **`security/no-dangerous-commands`** — detects `rm -rf /`, `curl | bash`, fork bombs (error)

## Scoring

Starts at 10, deducts for issues:

- Each **error**: -2
- Each **warning category**: -1 (capped at -1 per category)
- **Info**: no deduction

## License

MIT
