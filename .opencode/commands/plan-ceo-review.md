---
description: Review a product plan like a CEO/founder and write a strategy report
agent: build
---

Load the `plan-ceo-review` skill and execute this planning request:

$ARGUMENTS

Rules:

- Require an explicit brief or brief file path
- Write the report under `.gstack/plan-reports/` unless the request gives an explicit output path
- Include Inputs Reviewed, Premise Challenge, 10x Check, Alternative Approaches, Recommendation, Scope For This Slice, Deferrals, Local Validation, and Not In Scope
- Produce at least two approaches: one minimal viable path and one ideal long-term path
- Do not modify code in this v1 planning command
