---
name: retro
description: Review recent local repository history and write a bounded engineering retrospective.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "12"
  mode: report-first
---

## What This Skill Does

This is the first OpenCode-native `/retro` slice for gstack. It inspects recent local repository history and writes a concise engineering retrospective.

In this v1 slice:

- inspect recent local git history
- summarize what shipped in the selected window
- call out momentum and friction
- note test health signals when visible from local history
- write a durable local report

Do not modify code, docs, or git history in this v1 workflow.

## Required Input

This version can run with no extra arguments.

Optional examples:

- `Retro for the last 7 days`
- `Retro for this branch`
- `Write the report to .gstack/retro/opencode-smoke.md`

## Execution Contract

- Stay local; do not load unrelated skills
- Do not use background tasks or todo lists for this v1 flow
- Use local git only
- Write the report file before returning the final answer
- If history is too shallow, still write a bounded report explaining the limitation

## Output

Write the report under `.gstack/retro/`.

Default path:

- `.gstack/retro/retro-{slug}.md`

Honor an explicit output path if the request provides one.

## Fixed Report Sections

The report must include these sections:

- `Inputs Reviewed`
- `Shipping Summary`
- `Wins`
- `Friction`
- `Test Health Signals`
- `Next Focus`

## Workflow

### 1. Gather Local History

- inspect recent local commits
- inspect the current branch name
- inspect a short diff summary when helpful

### 2. Summarize Shipping Activity

Describe what kinds of work actually landed in the selected window.

### 3. Call Out Wins

Identify the strongest signs of progress.

### 4. Call Out Friction

Name the main sources of churn, repetition, or uncertainty visible in local history.

### 5. Note Test Health Signals

Use only visible local evidence such as test-related commits, smoke coverage, or validation changes.

### 6. Recommend The Next Focus

State the single most useful next discipline or improvement area.

## Rules

- Keep the output local and evidence-driven
- Prefer observed patterns over motivational language
- Do not invent team/process details you cannot infer locally
- Do not require remote analytics or external services
- Do not modify repository files other than the requested report output
