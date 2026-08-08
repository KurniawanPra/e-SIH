---
description: Update project docs from local changes
agent: build
---

Load the `document-release` skill and execute this documentation update request:

$ARGUMENTS

Rules:

- Stay local to the repository and local git state
- Update only the docs that the request or local diff clearly supports
- If the request explicitly names doc files, update each named file in place
- If the request provides an explicit summary output path, use that exact path
- Write a summary under `.gstack/document-release/` unless the request provides an explicit output path
- Do not commit, push, or use GitHub APIs
