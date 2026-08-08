---
name: design-consultation
description: Propose a product design direction, separate safe choices from creative risks, and write a durable local report.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "9"
  mode: report-first
---

## Required Input

Use a design brief or brief file such as `DESIGN_BRIEF.md`.
If the prompt names a brief file, treat it as sufficient context and do not ask follow-up questions.

## Execution Contract

- Stay local and do not load unrelated skills
- Do not use background tasks or todo lists
- Do not do browser research, previews, or multi-turn consultation
- Decide the exact output path early and use it exactly when provided
- Write the report file before returning the final answer
- Stop after the required sections only
- Keep each section short: 2-5 bullets or 1 short paragraph
- Do not modify code, docs, plans, or design files

## Output

Write the report under `.gstack/design-reports/`.
Default path: `.gstack/design-reports/design-consultation-{slug}.md`

## Required Sections

Use this exact heading order:

- `Inputs Reviewed`
- `Product Mood`
- `Safe Choices`
- `Creative Risks`
- `Design System Direction`
- `Validation Strategy`
- `Scope For This Slice`
- `Deferrals`
- `Not In Scope`

## Section Rules

- `Inputs Reviewed`: name the brief and any small local context files actually read
- `Product Mood`: 3-5 adjectives, desired first impression, anti-goals
- `Safe Choices`: category-literate defaults that build trust
- `Creative Risks`: 2-3 risks; for each include upside, cost, and fallback
- `Design System Direction`: concise direction for typography, color, spacing, layout, motion, and anti-slop constraints
- `Validation Strategy`: local-only validation steps
- `Scope For This Slice`: what belongs in the immediate first slice
- `Deferrals`: meaningful follow-up work intentionally excluded
- `Not In Scope`: explicit exclusions for this v1 workflow

## Rules

- Use the brief as the primary source of truth
- Keep the output concrete, opinionated, and product-centered
- Do not invent product scope beyond what the brief justifies
- Do not create preview HTML
- Do not write `DESIGN.md`
- Do not update agent instruction docs
