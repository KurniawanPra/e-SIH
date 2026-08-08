---
description: Audit a local rendered page from a design perspective and write a bounded report
agent: build
---

Load the `browse` and `design-review` skills and execute this design audit request:

$ARGUMENTS

Rules:
- Require one explicit localhost URL or repo-local page path for this v1 slice
- Audit only the single target page
- If the request gives an explicit output path, use that exact path
- Write the report under `.gstack/design-reports/` unless the request gives an explicit output path
- Include exactly these sections in order: Browser Evidence, First Impression, Inferred Design System, High-Confidence Findings, AI Slop Signals, Responsive & Accessibility Observations, Deferrals, Local Validation, Not In Scope
- Record exactly 3 findings labeled FINDING-001, FINDING-002, FINDING-003
- If the request explicitly asks for fixes and local editable source exists, you may apply bounded local UI fixes and attach before/after evidence
- If the request says `do not modify code` or `report only`, stay audit-only
