---
name: design-review
description: Audit a local rendered page with browser evidence, write a bounded design report, and optionally apply local UI fixes when explicitly requested.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "10"
  mode: report-first
---

## Required Input

Use one explicit local target only.
Examples:
- `http://127.0.0.1:4173/design-review-eval.html`
- `http://localhost:3000/settings`

If no target is provided, ask for exactly one thing: the local URL or local page path.

## Browse Setup

Load the `browse` skill first and use it to determine the local browser binary setup.

Before any browser action, resolve the binary exactly like this:

```bash
if [ -x "./browse/dist/browse" ]; then
  B="./browse/dist/browse"
elif command -v browse >/dev/null 2>&1; then
  B="$(command -v browse)"
else
  echo "NEEDS_SETUP"
fi
```

If the result is `NEEDS_SETUP`, stop and report that the local browse binary is unavailable.

Capture at least one screenshot artifact and keep screenshot paths in the report.

## Execution Contract

- Stay local and do not load unrelated skills
- Audit only the single target page in this v1 slice
- Do not use background tasks or todo lists
- Decide the exact report path early and use it exactly when provided
- Write the report file before returning the final answer
- Create at least one screenshot artifact under `.gstack/design-reports/screenshots/`
- Keep the report bounded to the required sections only
- Keep each section short: 2-5 bullets or 1 short paragraph
- Do not modify code, tests, configs, docs, or design files
- If the request says `do not modify code` or `report only`, stay audit-only
- If the request explicitly asks for fixes and local editable source exists, you may apply bounded local UI fixes and capture after evidence

By default this workflow is report-first. Only enter fix mode when the user explicitly asks for it.

## Output

Write the report under `.gstack/design-reports/`.
Default path: `.gstack/design-reports/design-review-{slug}.md`
Screenshot directory: `.gstack/design-reports/screenshots/`

## Required Sections

Use this exact heading order:
- `Browser Evidence`
- `First Impression`
- `Inferred Design System`
- `High-Confidence Findings`
- `AI Slop Signals`
- `Responsive & Accessibility Observations`
- `Deferrals`
- `Local Validation`
- `Not In Scope`

## Required Command Sequence

Run only this minimal sequence unless one command clearly fails:

```bash
mkdir -p .gstack/design-reports/screenshots
$B goto <target-url>
$B snapshot -i -a -o .gstack/design-reports/screenshots/first-impression.png
$B console --errors
$B viewport 390x844
$B snapshot -a -o .gstack/design-reports/screenshots/mobile.png
```

If the mobile capture step fails, continue with the annotated screenshot and say that mobile capture was not completed.

## Optional Fix Loop

Only enter this path when the user explicitly asks for fixes.

- identify the smallest likely local source files tied to the observed issue
- apply minimal UI/design fixes only
- re-run the relevant screenshots or snapshots using repo-local output paths only
- append before/after evidence to the report

Do not expand beyond the requested page or turn this into a broad redesign.

## Report Contract

- `Browser Evidence`: target reviewed, exact commands run, screenshot paths
- `First Impression`: 2-4 bullets on hierarchy, trust, and visual clarity
- `Inferred Design System`: typography, color, spacing, layout, and interaction patterns inferred from rendering only
- `High-Confidence Findings`: exactly 3 findings labeled `FINDING-001`, `FINDING-002`, `FINDING-003`; each finding must include what was observed, why it matters, and screenshot or viewport evidence
- `AI Slop Signals`: generic patterns or template-like choices visible on the page
- `Responsive & Accessibility Observations`: only direct observations from the rendered page or mobile screenshot
- `Deferrals`: anything needing more pages, product intent, or source context
- `Local Validation`: what commands ran and what did not
- `Not In Scope`: explicit exclusions for this v1 workflow

## Rules

- Use browser evidence over speculation
- Do not navigate beyond the single target page
- Do not pad the report beyond 3 high-confidence findings
- Do not modify code unless the request explicitly asks for fixes
