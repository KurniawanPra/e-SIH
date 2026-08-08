---
name: office-hours
description: Interrogate an idea like a bounded YC-style office hours session and write a durable local memo.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "12"
  mode: report-first
---

## What This Skill Does

This is the first OpenCode-native `/office-hours` slice for gstack. It pressure-tests an explicit idea, startup concept, or project direction and writes a bounded memo.

In this v1 slice:

- read the provided idea or brief
- identify the core user/problem being discussed
- challenge the demand and wedge assumptions
- name the sharpest next question or next move
- write a durable local memo

Do not modify code, docs, or plans in this v1 workflow.

## Required Input

You need either:

- an inline idea, problem statement, or product concept
- a repo-local brief file such as `PLAN.md`, `IDEA.md`, or `NOTES.md`

If no explicit input is provided, ask for exactly one thing: the idea text or the local file path.

## Execution Contract

- Stay local; do not load unrelated skills
- Do not use background tasks or todo lists for this v1 flow
- Write the report file before returning the final answer
- Keep the memo bounded to the fixed sections below
- Do not require multi-turn interaction
- Do not call external services

## Output

Write the report under `.gstack/office-hours/`.

Default path:

- `.gstack/office-hours/office-hours-{slug}.md`

Honor an explicit output path if the request provides one.

## Fixed Report Sections

The report must include these sections:

- `Inputs Reviewed`
- `Core Question`
- `Demand Reality`
- `Status Quo`
- `Narrowest Wedge`
- `Recommended Next Step`
- `Not In Scope`

## Workflow

### 1. Read Inputs

- read the idea first
- read only lightweight local context files if they are named or obviously relevant

### 2. Identify The Core Question

State the real question the user seems to be asking beneath the surface request.

### 3. Pressure-Test Demand

Challenge whether the problem is painful, specific, and urgent enough.

### 4. Check The Status Quo

Explain what users likely do today and why they might not switch.

### 5. Name The Narrowest Wedge

Describe the smallest credible starting point that still proves the idea.

### 6. Recommend The Next Step

State the highest-signal next action for this idea.

### 7. Write The Memo

Keep it concise, concrete, and useful for a founder or builder making the next decision.

## Rules

- Keep the output direct and specific
- Prefer concrete pressure-testing over motivational language
- Do not invent business certainty that is not supported by the input
- Do not turn this into an engineering implementation plan
- Do not modify repository files other than the requested report output
