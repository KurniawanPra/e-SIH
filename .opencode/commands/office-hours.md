---
description: Explore an idea like YC office hours and write a bounded local strategy memo
agent: build
---

Load the `office-hours` skill and execute this office-hours request:

$ARGUMENTS

Rules:

- Require an explicit idea, problem statement, or brief file path
- Write the report under `.gstack/office-hours/` unless the request gives an explicit output path
- Keep the result bounded to a local written memo in this v1 slice
- Do not modify code, docs, or plans in this command
