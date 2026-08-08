---
description: Review a product plan from a design perspective and write a report
agent: build
---

Load the `plan-design-review` skill and execute this planning request:

$ARGUMENTS

Rules:

- Require an explicit brief or brief file path
- Write the report under `.gstack/plan-reports/` unless the request gives an explicit output path
- Include Inputs Reviewed, UI Scope Decision, Information Architecture, Interaction State Coverage, AI Slop Risk, Responsive & Accessibility Gaps, Scope For This Slice, Deferrals, Local Validation, and Not In Scope
- Do not modify code in this v1 planning command
