---
description: Investigate a local bug and write a root-cause report
agent: build
---

Load the `debug` skill and execute this investigation request:

$ARGUMENTS

Rules:

- Require an explicit local reproduction command
- Run the reproduction command before making claims
- Write the report under `.gstack/debug-reports/` unless the request gives an explicit output path
- Do not modify code in this v1 debug command
