---
description: Run browser-first QA in report-only mode and write a structured report
agent: build
---

Load the `browse` and `qa-only` skills and execute this QA request:

$ARGUMENTS

Rules:

- If the request does not include a target URL or explicit local page path, ask for one
- Prefer a repo-local or localhost target over an external website when both are available
- If the request gives exact report or baseline output paths, use those exact paths
- Use browser evidence, screenshots, and console checks
- Write the report under `.gstack/qa-reports/`
- Do not modify code or suggest fixes in this v1 QA-only command
- If the user wants fixes or regression test generation, tell them to run `/qa` instead
