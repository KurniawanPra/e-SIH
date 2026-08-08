---
name: plan-design-review
description: Review a product plan like a senior product designer, evaluate information architecture, interaction states, and AI slop risk, and write a durable local report.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "8"
  mode: report-first
---

## What This Skill Does

This is the first OpenCode-native `/plan-design-review` slice for gstack. It reviews an explicit product or strategy brief from a design perspective and writes a bounded planning report.

In this v1 slice:

- read a provided brief or brief file
- evaluate the UI scope
- evaluate the information architecture
- map interaction state coverage
- identify AI slop risk
- identify responsive and accessibility gaps
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

- `.gstack/plan-reports/plan-design-review-{slug}.md`

Honor an explicit output path if the request provides one.

## Fixed Report Sections

The report must include these sections:

- `Inputs Reviewed`
- `UI Scope Decision`
- `Information Architecture`
- `Interaction State Coverage`
- `AI Slop Risk`
- `Responsive & Accessibility Gaps`
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
- `DESIGN.md`
- the specific files named in the brief

### 2. Determine UI Scope Decision

Analyze the plan. If it involves NONE of: new UI screens/pages, changes to existing UI, user-facing interactions, frontend framework changes, or design system changes, note that there is no UI scope and keep the rest of the report sections brief/not applicable.

### 3. Evaluate Information Architecture

Evaluate what the user sees first, second, third.
If the brief doesn't specify, call it out as a gap.
Draw a simple ASCII representation of the screen/page structure.

### 4. Map Interaction State Coverage

Evaluate if the plan considers loading, empty, error, success, and partial states.
Create a simple table showing which states are specified and which are missing.
Remember: "No items found" is not an empty state design.

### 5. Identify AI Slop Risk

Flag generic UI descriptions that risk becoming "AI slop" (e.g., "clean modern UI", "cards with icons", "hero section", "dashboard with widgets"). Suggest more intentional, specific alternatives.

### 6. Identify Responsive & Accessibility Gaps

Check if the plan specifies mobile/tablet behavior (not just "stacked on mobile") and accessibility requirements (keyboard nav, ARIA, touch targets). Call out missing details.

### 7. Produce Scope and Deferrals

`Scope For This Slice` should name only the work that belongs in the immediate first migration slice.

`Deferrals` should capture the meaningful follow-up work that is intentionally excluded.

### 8. Produce Local Validation

Describe how to validate the slice locally.

### 9. Produce Not In Scope

Explicitly list the important things this first design review slice does not do.

## Rules

- Keep the output concrete, strategic, and product-centered
- Do not invent product scope beyond what the brief justifies
- Do not require interactive multi-pass review in this v1 workflow
- Do not modify repository files other than the requested report output
