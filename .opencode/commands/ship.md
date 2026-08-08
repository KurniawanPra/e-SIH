---
description: Prepare a local branch for shipping and write a readiness report
agent: build
---

Load the `ship` skill and execute this release-prep request:

$ARGUMENTS

Rules:

- Stay local to the repository and local git state
- Write the report under `.gstack/ship-reports/` unless the request gives an explicit output path
- Run an explicit or clearly repo-local test command
- Use local review artifacts if available
- By default keep the command local-only and report-first
- If the request explicitly asks for commit, push, or PR preparation, perform those actions only after readiness checks pass
