---
description: Review an engineering plan and write a technical report
agent: build
---

Load the `plan-eng-review` skill and execute this planning request:

$ARGUMENTS

Rules:

- Require an explicit plan brief or brief file path
- Write the report under `.gstack/plan-reports/` unless the request gives an explicit output path
- Include architecture summary, ASCII data flow, risks, test matrix, and not in scope
- Do not modify code in this v1 planning command
