---
description: Propose a product design direction and write a bounded report
agent: build
---

Load the `design-consultation` skill and execute this design request:

$ARGUMENTS

Rules:

- Require an explicit design brief or brief file path
- If the request gives an explicit output path, use that exact path
- Write the report under `.gstack/design-reports/` unless the request gives an explicit output path
- Use the brief file as sufficient context when one is provided
- Include exactly these sections in order: Inputs Reviewed, Product Mood, Safe Choices, Creative Risks, Design System Direction, Validation Strategy, Scope For This Slice, Deferrals, Not In Scope
- Keep the report concise and stop after the required sections
- Do not modify code or write `DESIGN.md`
