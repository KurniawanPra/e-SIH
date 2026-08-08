---
description: Use gstack browse for browser tasks and QA
agent: build
---

Load the `browse` skill and use gstack's browser tooling to complete this request:

$ARGUMENTS

Rules:

- Prefer the repo-local binary at `./browse/dist/browse` when present
- If the binary is missing, build or set it up before continuing
- Use snapshots, console checks, and screenshots as evidence
- After creating screenshots, read them so the user can see the result
