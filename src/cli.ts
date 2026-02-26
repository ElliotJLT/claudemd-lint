#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { lint } from "./lint.js";
import type { LintResult } from "./types.js";

const VERSION = "0.1.0";

const RULE_COL_WIDTH = 24;

function pad(text: string, rawLength: number): string {
  const spaces = Math.max(1, RULE_COL_WIDTH - rawLength);
  return text + " ".repeat(spaces);
}

function formatResult(result: LintResult): string {
  const icon =
    result.severity === "error"
      ? chalk.red("✖")
      : result.severity === "warning"
        ? chalk.yellow("⚠")
        : chalk.gray("ℹ");

  const colorFn =
    result.severity === "error"
      ? chalk.red
      : result.severity === "warning"
        ? chalk.yellow
        : chalk.gray;

  const rulePadded = pad(colorFn(result.rule), result.rule.length);
  let line = `  ${icon} ${rulePadded}${result.message}`;

  if (result.suggestion) {
    line += `\n  ${" ".repeat(2 + RULE_COL_WIDTH)}${chalk.dim(result.suggestion)}`;
  }

  return line;
}

function formatPassed(rule: string, message: string): string {
  const rulePadded = pad(chalk.green(rule), rule.length);
  return `  ${chalk.green("✔")} ${rulePadded}${message}`;
}

const program = new Command();

program
  .name("claudemd-lint")
  .description("Lint your CLAUDE.md files")
  .version(VERSION)
  .argument("[file]", "path to CLAUDE.md file", "./CLAUDE.md")
  .action((file: string) => {
    const filePath = resolve(file);

    if (!existsSync(filePath)) {
      console.error(
        chalk.red(`\n  Error: ${file} not found.\n`),
      );
      console.error(
        chalk.dim(
          "  Run this command in a directory with a CLAUDE.md file,\n  or specify a path: claudemd-lint path/to/CLAUDE.md\n",
        ),
      );
      process.exit(1);
    }

    const content = readFileSync(filePath, "utf-8");
    const report = lint(content, file);

    // Header
    console.log();
    console.log(chalk.bold(`  claudemd-lint v${VERSION}`));
    console.log();
    console.log(
      chalk.dim(
        `  ${file} (${report.lines} lines, ~${report.estimatedTokens.toLocaleString()} tokens)`,
      ),
    );
    console.log();

    // Results — errors first, then warnings, then info
    const errors = report.results.filter((r) => r.severity === "error");
    const warnings = report.results.filter((r) => r.severity === "warning");
    const infos = report.results.filter(
      (r) =>
        r.severity === "info" &&
        !r.message.includes("good") &&
        !r.message.includes("Has ") &&
        !r.message.includes("No secrets"),
    );
    const passed = report.results.filter(
      (r) =>
        r.severity === "info" &&
        (r.message.includes("good") ||
          r.message.includes("Has ") ||
          r.message.includes("No secrets")),
    );

    for (const r of errors) {
      console.log(formatResult(r));
    }
    for (const r of warnings) {
      console.log(formatResult(r));
    }
    for (const r of passed) {
      console.log(formatPassed(r.rule, r.message));
    }
    for (const r of infos) {
      console.log(formatResult(r));
    }

    // Summary
    console.log();
    const parts: string[] = [];
    if (report.counts.errors > 0)
      parts.push(chalk.red(`${report.counts.errors} error${report.counts.errors === 1 ? "" : "s"}`));
    if (report.counts.warnings > 0)
      parts.push(chalk.yellow(`${report.counts.warnings} warning${report.counts.warnings === 1 ? "" : "s"}`));
    if (report.counts.passed > 0)
      parts.push(chalk.green(`${report.counts.passed} passed`));
    if (report.counts.info > 0)
      parts.push(chalk.gray(`${report.counts.info} info`));

    console.log(`  ${parts.join(chalk.dim(" · "))}`);
    console.log();

    // Score
    const scoreColor =
      report.score >= 8
        ? chalk.green
        : report.score >= 5
          ? chalk.yellow
          : chalk.red;
    console.log(`  Score: ${scoreColor(`${report.score}/10`)}`);
    console.log();

    // Exit code: 1 if any errors
    if (report.counts.errors > 0) {
      process.exit(1);
    }
  });

program.parse();
