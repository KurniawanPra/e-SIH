---
name: ship
description: Prepare a branch for shipping by checking branch state, local tests, review readiness, and optionally carrying out explicit shipping actions.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "7"
  mode: report-first
---

## What This Skill Does

This is the first OpenCode-native `/ship` slice for gstack. It prepares a local branch for shipping and writes a bounded readiness report.

In this v1 slice:

- detect a local base branch
- inspect branch state and diff scope
- run an explicit or conservative repo-local test command
- inspect a local review artifact if one exists
- classify readiness and write a durable report
- when explicitly requested, prepare commit/push/PR actions after readiness checks pass

By default this workflow is local-only and report-first. If the user explicitly asks for a commit, push, or PR in the same request and the readiness checks pass, you must carry out the requested action and record it in the report.

## Execution Contract

- Stay local; do not load unrelated skills
- Do not use background tasks or todo lists for this v1 flow
- Write the report file before returning the final answer
- If a hard gate fails, still write the report and mark the blocked status clearly
- Do not perform external side effects unless the request explicitly asks for them

## Base Branch Detection

Prefer local-only refs in this order:

```bash
if git show-ref --verify --quiet refs/remotes/origin/main; then echo origin/main;
elif git show-ref --verify --quiet refs/remotes/origin/master; then echo origin/master;
elif git show-ref --verify --quiet refs/heads/main; then echo main;
elif git show-ref --verify --quiet refs/heads/master; then echo master;
else echo NO_BASE; fi
```

## Test Command Resolution

Use the prompt first.

If the prompt includes an explicit test command, use it.

Otherwise only auto-detect an obvious root package test script. If there is no clear repo-local test command, classify the result as `NEEDS_TEST_COMMAND` rather than guessing.

## Review Readiness

Look for a local review artifact path provided by the user.

If none is provided, search `.gstack/review-reports/` for the newest report.

Classify the local report as:

- `REVIEW_READY`
- `REVIEW_BLOCKED`
- `REVIEW_MISSING`

## Output

Write the report under `.gstack/ship-reports/`.

Default path:

- `.gstack/ship-reports/ship-{slug}.md`

Honor an explicit output path if the request provides one.

## Fixed Report Sections

The report must include:

- `Release Prep Status`
- `Inputs Reviewed`
- `Branch State`
- `Verification`
- `Review Readiness`
- `Ship Decision`
- `Deferred For Later Slice`

## Workflow

### 1. Gather Branch Context

- create `.gstack/ship-reports/` immediately
- decide the report path immediately and start the report file before deeper checks
- detect the base branch
- capture current branch
- capture `git status --short`
- capture `git diff <base> --stat`
- capture `git log <base>..HEAD --oneline`

If there is no usable base branch, or if there is no diff against the base branch, still write a report and stop.

### 2. Run Verification

- run the resolved test command if one exists
- capture pass or fail status and short output summary

If there is no clear test command, report `NEEDS_TEST_COMMAND`.

### 3. Check Review Readiness

- read the chosen local review report if present
- classify the review status based on the report content

### 4. Write Ship Decision

Use one of these statuses in the report:

- `READY_LOCAL`
- `BLOCKED_TESTS`
- `BLOCKED_REVIEW`
- `NEEDS_TEST_COMMAND`
- `NO_BASE_BRANCH`
- `NO_DIFF`

Write the report file even for blocked outcomes. Never exit early without a written report.

### 5. Optional Shipping Actions

Only enter this path when the user explicitly asks for the action.

- if the user explicitly asks for a commit and readiness is green, create the local commit
- if the user explicitly asks for push or PR creation and the environment supports it, proceed only after all local gates are green
- record every external-facing step in the report

## Rules

- Keep the report factual and local-only
- Start the report file before running tests or reading review artifacts
- Do not fetch, merge, commit, push, or open PRs unless the user explicitly asks for that action
- Do not modify source code, docs, or changelogs unless the user explicitly requests a shipping step that requires it
- Defer versioning and changelog work unless the user explicitly requests them
