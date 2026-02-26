# claudemd-lint

Lint your `CLAUDE.md` files. Catch vague rules, bloated configs, and instructions that should be [hooks](https://docs.anthropic.com/en/docs/claude-code/hooks).

```
npx claudemd-lint
```

## What it checks

- **Size** — line count, character count, token estimate
- **Structure** — headings, wall-of-text, bullet usage
- **Content** — vague language, missing build commands, file-listing bloat, passive voice
- **Hooks** — detects "never modify X" / "always run prettier" and suggests concrete hook configs
- **Security** — hardcoded secrets, dangerous commands

## The hook thing

Other CLAUDE.md linters exist. This one detects instructions that should be enforced as hooks, not written as advisory text. It gives you the config to copy-paste.

```
⚠ hooks/file-protection   Line 12: "Never modify the .env file." — make this a hook:
                           { "type": "PreToolUse", "matcher": "Edit|Write",
                             "command": "if echo $FILE | grep -q '.env'; then exit 1; fi" }
```

## Scoring

Starts at 10. Errors: -2. Warning categories: -1 each. Info: free.

## License

MIT
