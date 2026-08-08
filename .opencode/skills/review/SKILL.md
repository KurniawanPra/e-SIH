---
name: review
description: Run a structural pre-landing code review in OpenCode, write a durable local report, and optionally apply low-risk fixes when explicitly requested.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "3"
  mode: report-first
---

## What This Skill Does

This is the OpenCode-native `/review` slice for gstack. It reviews the current branch diff against a local base branch, looks for structural issues that tests often miss, and writes a report.

In this v1 slice:

- detect a local base branch
- inspect the current diff
- read `review/checklist.md`
- focus on the highest-signal structural categories
- write findings under `.gstack/review-reports/`
- optionally apply low-risk fixes when the user explicitly requests a fixing pass

By default this workflow is report-first. If the request explicitly says to fix obvious issues, you must apply bounded local fixes for the highest-confidence low-risk findings and re-run the smallest relevant verification. Do not push, comment on PRs, or call external review services.

## Execution Contract

- Stay inside this workflow; do not load unrelated skills
- Do not use background tasks or todo lists for this v1 review flow
- Use local git, file reads, and direct report writing
- Always write the report file before producing the final answer
- If review cannot proceed, still write a short report explaining why
- If the request says `do not modify code` or `report only`, stay report-only
- If the request explicitly asks for fixes, apply directly evidenced, low-risk local fixes for the highest-confidence findings

## Base Branch Detection

Prefer local-only refs in this order:

```bash
if git show-ref --verify --quiet refs/remotes/origin/main; then echo origin/main;
elif git show-ref --verify --quiet refs/remotes/origin/master; then echo origin/master;
elif git show-ref --verify --quiet refs/heads/main; then echo main;
elif git show-ref --verify --quiet refs/heads/master; then echo master;
else echo NO_BASE; fi
```

If the result is `NO_BASE`, report that review cannot continue because no usable base branch was found.

If the current branch is already the base branch, or `git diff <base> --stat` is empty, report that there is nothing to review and stop.

## Required Shared Inputs

Read and use:

- checklist: `review/checklist.md`

Write outputs here:

- report: `.gstack/review-reports/review-{slug}.md`

If the user gives an explicit output file path, honor it.

## Review Focus For v1

Use `review/checklist.md` as the source of truth, but keep the first OpenCode slice focused on these categories:

- SQL & Data Safety
- Race Conditions & Concurrency
- LLM Output Trust Boundary
- Enum & Value Completeness

You may include additional high-confidence findings, but do not pad the report with weak or speculative items.

## Workflow

### 1. Initialize

- detect the base branch
- gather `git branch --show-current`
- capture `git diff <base> --stat`
- create `.gstack/review-reports/` if needed
- decide the output path before doing deeper analysis

### 2. Read Inputs

- read `review/checklist.md`
- read the full diff against the detected base branch

Use commands like:

```bash
git branch --show-current
git diff <base> --stat
git diff <base>
```

If the user requested a specific output file, use that exact path. Otherwise write `.gstack/review-reports/review-{slug}.md`.

### 3. Run Structural Review

Review the diff in two passes.

#### Pass 1

Look for direct structural risks in the changed lines.

#### Enum & Value Completeness

When the diff introduces a new enum value, status string, tier, or sibling constant, read code outside the diff to verify every consumer handles it.

That means:

- search for sibling values
- read each matching consumer file
- verify every `case`, allowlist, filter, and display path handles the new value

This category is not diff-only. It requires follow-through outside the hunk.

### 4. Optional Fix Loop

Only enter this path when the user explicitly asks for fixes.

- choose the highest-confidence low-risk findings
- apply the smallest local fix that resolves each chosen issue
- re-run the smallest relevant verification for each fix
- record exactly what changed

Do not perform broad refactors, speculative rewrites, or external side effects.

### 5. Write Findings

Write a durable report to `.gstack/review-reports/`.

Use this structure:

```text
Pre-Landing Review: N issues (X critical, Y informational)

- [CRITICAL] path/to/file.rb:12 - problem
  Evidence: what you observed in the diff or follow-through read
  Recommended fix: short concrete fix
```

Every finding must include:

- severity
- `file:line`
- why it is a problem
- concrete evidence
- recommended fix

If fixes were applied, append a `Fixes Applied` section with the changed files and verification performed.

If there are no issues, write `Pre-Landing Review: No issues found.` and include the reviewed base branch plus diff summary.

If review cannot proceed because there is no base branch or no diff, still write a short report file with that outcome.

## Rules

- Read the full diff before writing findings
- Cite evidence, not guesses
- Keep findings terse and concrete
- Escalate uncertainty into the report instead of inventing confidence
- Stay local: no GitHub APIs, no external review services, no PR assumptions
- Do not load unrelated helper skills or orchestration flows
- Do not modify code unless the request explicitly asks for fixes
- Do not modify tests, docs, or configs unless they are part of a directly necessary low-risk fix
