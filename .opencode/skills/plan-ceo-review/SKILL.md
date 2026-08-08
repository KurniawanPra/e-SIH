---
name: plan-ceo-review
description: Review a product plan like a CEO/founder, challenge the premise, compare strategic approaches, and write a durable local report.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "7"
  mode: report-first
---

## What This Skill Does

This is the first OpenCode-native `/plan-ceo-review` slice for gstack. It reviews an explicit product or strategy brief and writes a bounded CEO/founder-style planning report.

In this v1 slice:

- read a provided brief or brief file
- challenge whether the stated feature is the right problem to solve
- describe the 10x version that creates much more value
- compare at least two implementation approaches
- recommend what to build now versus later
- write a durable local report

Do not modify code, docs, or plans in this v1 workflow.

## Required Input

You need either:

- an inline product brief, or
- a repo-local brief file like `PLAN.md`

If no brief is provided, ask for exactly one thing: the brief text or the brief file path.

## Execution Contract

- Stay local; do not load unrelated skills
- Do not use background tasks or todo lists for this v1 flow
- Write the report file before returning the final answer
- Keep the report bounded to the fixed sections below
- Do not require multi-turn interaction
- Do not call external services
- Do not modify repository files other than the requested report output

## Output

Write the report under `.gstack/plan-reports/`.

Default path:

- `.gstack/plan-reports/plan-ceo-review-{slug}.md`

Honor an explicit output path if the request provides one.

## Fixed Report Sections

The report must include these sections:

- `Inputs Reviewed`
- `Premise Challenge`
- `10x Check`
- `Alternative Approaches`
- `Recommendation`
- `Scope For This Slice`
- `Deferrals`
- `Local Validation`
- `Not In Scope`

## Workflow

### 1. Read Inputs

- read the brief first
- read only lightweight local context files if they are named or obviously relevant

Good local context examples:

- `README.md`
- `ARCHITECTURE.md`
- the specific files named in the brief

### 2. Produce Premise Challenge

Challenge the brief directly and concretely.

Answer questions like:

- is this the right problem to solve?
- is the requested feature the real product, or just a proxy?
- what user or business outcome actually matters?
- what happens if we do nothing?

Keep this section concise and specific to the brief.

### 3. Produce 10x Check

Describe the version that creates dramatically more value without turning this into an unlimited-scope fantasy.

The 10x check should:

- stay anchored to the same user problem
- expand ambition, not vagueness
- make the better end state concrete

### 4. Produce Alternative Approaches

Include at least 2 distinct approaches every time:

- one minimal viable path
- one ideal long-term path

For each approach, include:

- summary
- effort
- risk
- pros
- cons

Prefer concrete tradeoffs over abstract architecture language.

### 5. Produce Recommendation

Choose one approach and explain why.

The recommendation must:

- state what to build now
- state what to defer
- explain why this is the right slice
- keep the first implementation credible for a small local OpenCode migration

### 6. Produce Scope and Deferrals

`Scope For This Slice` should name only the work that belongs in the immediate first migration slice.

`Deferrals` should capture the meaningful follow-up work that is intentionally excluded.

### 7. Produce Local Validation

Describe how to validate the slice locally.

Prefer local checks such as:

- temp repo smoke test
- explicit brief file like `PLAN.md`
- `opencode run --command ...`
- targeted Bun test commands

### 8. Produce Not In Scope

Explicitly list the important things this first CEO review slice does not do.

## Rules

- Keep the output concrete, strategic, and product-centered
- Prefer explicit tradeoffs over inspirational language
- Do not invent product scope beyond what the brief justifies
- Do not require interactive multi-pass review in this v1 workflow
- Do not turn this into an engineering design review
- Do not modify repository files other than the requested report output
