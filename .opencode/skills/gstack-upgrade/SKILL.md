---
name: gstack-upgrade
description: Check local gstack setup health, detect stale build/setup state, and write a bounded upgrade-readiness report.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "12"
  mode: report-first
---

## What This Skill Does

This is the first OpenCode-native `/gstack-upgrade` slice for gstack. It checks whether the local repository is in a healthy, runnable OpenCode state and writes a bounded readiness report.

In this v1 slice:

- inspect whether core local files exist
- compare current git HEAD to `browse/dist/.version` when available
- detect obvious setup or rebuild needs
- write a durable local report

Do not modify code or run automatic sync/upgrade flows in this v1 workflow.

## Execution Contract

- Stay local; do not load unrelated skills
- Do not use background tasks or todo lists for this v1 flow
- Write the report file before returning the final answer
- Keep the result bounded to local readiness checks

## Output

Write the report under `.gstack/gstack-upgrade/`.

Default path:

- `.gstack/gstack-upgrade/gstack-upgrade-{slug}.md`

Honor an explicit output path if the request provides one.

## Fixed Report Sections

The report must include these sections:

- `Inputs Reviewed`
- `Version Check`
- `Setup State`
- `Recommended Action`
- `Status`

Use one of these statuses:

- `CURRENT`
- `NEEDS_BUILD`
- `NEEDS_SETUP`

## Workflow

### 1. Inspect Local Inputs

- read the current git HEAD when available
- inspect `browse/dist/browse`
- inspect `browse/dist/.version`
- inspect `.opencode/`
- inspect `setup`

### 2. Perform Version Check

Compare local HEAD and `browse/dist/.version` when both exist.

### 3. Determine Setup State

Use the local file state to decide whether the repo looks current, needs a rebuild, or needs setup.

### 4. Write The Report

Keep the output concise and operational.

## Rules

- Prefer deterministic local file evidence over speculation
- Do not perform automatic sync, reinstall, or mutation in this v1 slice
- Do not modify repository files other than the requested report output
