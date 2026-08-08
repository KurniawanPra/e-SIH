---
name: debug
description: Investigate a local reproducible bug, trace the likely root cause, and write a durable debug report without modifying code.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "5"
  mode: report-first
---

## What This Skill Does

This is the first OpenCode-native `/debug` slice for gstack. It performs local root-cause investigation for an explicit reproducible bug and writes a durable report.

Do not modify code in this v1 debug workflow. Do not add temporary logging, do not patch files, and do not write tests.

## Iron Law

No fixes without root cause investigation first.

This v1 slice stops at investigation and reporting.

## Required Inputs

You need an explicit local reproduction command for this version.

Examples:

- `bun test test/retry-count.test.js`
- `python -m pytest tests/test_config.py`
- `node src/run-bug.js`

If the request does not include an explicit local reproduction command, ask for one using the host's normal question tool.

## Execution Contract

- Stay local; do not load unrelated skills
- Do not use background tasks or todo lists for this v1 flow
- Run the reproduction command before making any root-cause claim
- Write the report file before returning the final answer
- If the reproduction does not fail or context is insufficient, still write a blocked report

## Outputs

Write the report under `.gstack/debug-reports/`.

Default path:

- `.gstack/debug-reports/debug-{slug}.md`

If the user provides an explicit output path, honor it.

## Workflow

### 1. Reproduce

- run the provided local reproduction command
- capture the failing output
- identify the failing test, stack trace, or observed mismatch

### 2. Trace

- read the files directly involved in the failure
- trace the value flow from symptom back to likely cause
- use local search to find related functions, conditionals, or defaults

### 3. Hypothesize

- produce one concrete root-cause hypothesis
- include the specific file and line range area that most likely causes the bug
- keep confidence honest

### 4. Write Report

Write a structured report with:

- symptom
- reproduction command
- observed output
- traced code path
- root-cause hypothesis
- likely fix area
- status

Use one of these statuses:

- `ROOT_CAUSE_FOUND`
- `NEEDS_CONTEXT`
- `BLOCKED`

## Rules

- Prefer direct evidence over speculation
- Do not claim the bug is fixed
- Do not edit source files, tests, configs, or docs
- Do not use external services or browsers in this v1 workflow
