---
name: plan-eng-review
description: Review an engineering plan, produce architecture and test guidance, and write a durable local report.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "6"
  mode: report-first
---

## What This Skill Does

This is the first OpenCode-native `/plan-eng-review` slice for gstack. It reviews an explicit engineering brief and writes a bounded technical planning report.

In this v1 slice:

- read a provided brief or brief file
- summarize the architecture
- draw a simple ASCII data flow
- identify top engineering risks
- write a test matrix
- record what is not in scope

Do not modify code, docs, or plans in this v1 workflow.

## Required Input

You need either:

- an inline engineering brief, or
- a repo-local brief file like `PLAN.md`

If no brief is provided, ask for exactly one thing: the brief text or the brief file path.

## Execution Contract

- Stay local; do not load unrelated skills
- Do not use background tasks or todo lists for this v1 flow
- Write the report file before returning the final answer
- Keep the report bounded to the fixed sections below

## Output

Write the report under `.gstack/plan-reports/`.

Default path:

- `.gstack/plan-reports/plan-eng-review-{slug}.md`

Honor an explicit output path if the request provides one.

## Fixed Report Sections

The report must include these sections:

- `Inputs Reviewed`
- `Architecture Summary`
- `Data Flow`
- `Risks`
- `Test Matrix`
- `Not In Scope`

## Workflow

### 1. Read Inputs

- read the brief first
- read only lightweight local context files if they are named or obviously relevant

Good local context examples:

- `README.md`
- `ARCHITECTURE.md`
- the specific files named in the brief

### 2. Produce Architecture Summary

Write 1-3 short paragraphs describing the main components, boundaries, and key engineering decisions.

### 3. Produce Data Flow

Include one ASCII flow that makes the main path concrete.

Example shape:

```text
Client -> API -> Worker -> Store
```

### 4. Produce Risks

List only the highest-signal engineering risks for the proposed plan.

Prefer risks around:

- trust boundaries
- retries and failure handling
- data consistency
- concurrency
- rollout and reversibility

### 5. Produce Test Matrix

Write a concise table with:

- scenario
- level
- assertion
- failure mode

### 6. Produce Not In Scope

Explicitly list what this first engineering plan does not include.

## Rules

- Keep the output concrete and technical
- Prefer explicit boundaries over clever abstractions
- Do not invent product scope beyond the brief
- Do not require interactive multi-pass review in this v1 workflow
- Do not modify repository files other than the requested report output
