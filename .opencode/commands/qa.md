---
description: Run browser-first QA and write a structured report
agent: build
---

Load the `browse` and `qa` skills and execute this QA request:

$ARGUMENTS

Rules:

- If the request does not include a target URL or explicit local page path, ask for one
- Prefer a repo-local or localhost target over an external website when both are available
- If the request gives exact report or baseline output paths, use those exact paths
- If the request says `report only` or `do not modify code`, stay report-only
- If the request explicitly asks to fix issues and local editable source exists, you may enter a bounded fix loop and add regression coverage when practical
- If the request gives exact source files and exact issues to fix, use the shortest fix path that reproduces, edits, and re-verifies only those issues
- If the request also asks for one regression test and a clear local test path exists, add exactly one small regression test tied to those named issues
- If the request gives an exact regression test file path, write that exact file and run the smallest matching test command only
- Use browser evidence, screenshots, and console checks
- Write the report under `.gstack/qa-reports/`
- Even if a browser step fails, still write a partial report and baseline when you already have evidence
- Do not commit, push, or open PRs from this command
