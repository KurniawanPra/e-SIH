---
name: qa-only
description: Run browser-first QA in OpenCode, capture evidence, and write a structured report without modifying source code or suggesting fixes.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "11"
  mode: report-only
---

## What This Skill Does

This is the first OpenCode-native `/qa-only` slice for gstack. It runs browser-driven QA, captures evidence, and writes a structured report.

In this v1 slice:

- test the target like a user
- capture screenshots and console evidence
- classify issues by severity and category
- compute a health score
- write outputs under `.gstack/qa-reports/`

Do not modify source code in this v1 QA workflow. Do not run a fix loop. Do not create commits. Do not suggest fixes in the report. Use `/qa` when the user wants the test-fix-verify loop.

## Required Inputs

You need an explicit target URL or local page path for this version.

- Good: `http://localhost:3000`
- Good: `http://127.0.0.1:4173/qa-eval.html --quick`
- Good: `https://staging.example.com/settings`

If no target is provided, ask for one using the host's normal user-question tool.

## Prerequisites

Load the `browse` skill first and use it to determine the local browser binary setup.

Use these shared repo assets:

- report template: `qa/templates/qa-report-template.md`
- issue taxonomy: `qa/references/issue-taxonomy.md`

Write outputs here:

- report: `.gstack/qa-reports/qa-report-{slug}.md`
- screenshots: `.gstack/qa-reports/screenshots/`
- baseline: `.gstack/qa-reports/baseline.json`

## Execution Contract

- stay local and do not load unrelated skills
- in this v1 slice, write reports only; do not modify source code
- if the request gives exact report or baseline output paths, use those exact paths instead of generating alternate filenames
- create screenshot artifacts under `.gstack/qa-reports/screenshots/`
- in quick mode, keep the report bounded to 2-4 high-confidence issues

## Modes

### Quick

Use when the request includes `--quick`.

- verify the page loads
- capture an annotated screenshot
- check `console --errors`
- inspect top navigation and obvious actions
- report only the highest-confidence issues

For this v1 slice, keep quick mode bounded. Run this exact sequence unless one command clearly fails:

```bash
mkdir -p .gstack/qa-reports/screenshots
$B goto <target-url>
$B snapshot -i -a -o .gstack/qa-reports/screenshots/initial.png
$B console --errors
$B links
$B viewport 375x812
$B snapshot -a -o .gstack/qa-reports/screenshots/mobile.png
```

If the mobile capture step fails, continue with the annotated screenshot and state that mobile capture was skipped.

### Full

Default when `--quick` is not present.

- orient on the target page
- inspect interactive elements with `snapshot -i`
- test core links, controls, and forms
- check console and visible page state after interactions
- use responsive checks when the page appears user-facing
- document 3-10 high-confidence issues with evidence

## Workflow

### 1. Initialize

- ensure `.gstack/qa-reports/screenshots` exists
- copy the structure of `qa/templates/qa-report-template.md`
- record target URL, mode, timestamp, branch, and commit if available
- if the request gives explicit report or baseline output paths, use those exact paths

### 2. Orient

- navigate to the target
- run an annotated snapshot for the landing page
- run `console --errors`
- map obvious links and interactive elements

### 3. Explore

Use `qa/references/issue-taxonomy.md` as the classification source.

For each page or major state you inspect:

- look for layout breaks, clipped text, missing images, and obvious accessibility issues
- click buttons and links that are visible and safe to test
- test forms with harmless sample values when appropriate
- use `snapshot -D` after meaningful interactions
- re-check console errors after interactions

### 4. Document

Document issues as you find them. Do not batch everything at the end.

Use literal issue IDs in order: `ISSUE-001`, `ISSUE-002`, `ISSUE-003`, and so on.

Each issue needs:

- title
- severity
- category
- page URL
- short expected-vs-actual description
- reproduction steps
- screenshot evidence

Use categories and severity labels from `qa/references/issue-taxonomy.md`.

### 5. Score

Compute a simple health score using the same categories as `qa/templates/qa-report-template.md`.

Minimum categories to score:

- Console
- Links
- Visual
- Functional
- UX
- Performance
- Accessibility

Use conservative scoring. Do not invent precision you cannot support with evidence.

### 6. Write Outputs

Write the final report under `.gstack/qa-reports/` and keep screenshot paths relative to that report.

If the request gives an exact report path, write to that exact file path.

Also write a small `baseline.json` with:

```json
{
  "url": "<target>",
  "healthScore": 0,
  "issues": []
}
```

If the request gives an exact baseline path, write to that exact file path.

If you could not complete the full flow, still write a partial report and clearly mark what was covered versus skipped.
If any browser command fails after partial evidence has already been captured, still write the report and baseline with the evidence you do have.

In quick mode, each issue heading must start with its literal issue ID, for example `### ISSUE-001: Broken link`.

If the repository has no test framework or test directories, note this in the report summary: `No test framework detected. Run /qa to bootstrap one and enable regression test generation.`

## Rules

- Prefer direct browser evidence over speculation
- Re-check console after interactions, not just after first load
- Use `snapshot -D` whenever an interaction should visibly change page state
- After creating screenshots, read them so the user can see the evidence
- Keep the report honest: only include issues you actually observed
- Do not modify code, tests, configs, or docs in this v1 QA workflow
- Do not suggest fixes or implementation changes in the report
- Do not claim regression comparisons unless you actually compared against a baseline
