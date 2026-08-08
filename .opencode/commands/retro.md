---
description: Review recent local repo history and write a bounded engineering retrospective
agent: build
---

Load the `retro` skill and execute this retrospective request:

$ARGUMENTS

Rules:

- Stay local to repo history and local artifacts
- Write the report under `.gstack/retro/` unless the request gives an explicit output path
- Keep the result bounded to a local retrospective in this v1 slice
- Do not modify code, docs, or git history in this command
