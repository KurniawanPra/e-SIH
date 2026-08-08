---
description: Run a structural pre-landing code review
agent: build
---

Load the `review` skill and execute this review request:

$ARGUMENTS

Rules:

- Review the current branch against a local base branch
- Use `review/checklist.md` as the review source of truth
- Write the report under `.gstack/review-reports/` unless the request provides an explicit output path
- Focus on high-signal structural findings with evidence
- If the request explicitly asks to fix obvious issues, apply low-risk local fixes for the highest-confidence findings and document them in the report
- If the request says `do not modify code` or `report only`, stay report-only
- Do not load unrelated helper skills or start background exploration
- Write the report file before returning your final answer
- Do not push or call external review services
