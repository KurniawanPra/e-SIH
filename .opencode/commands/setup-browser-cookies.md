---
description: Prepare authenticated browser sessions for local OpenCode QA and design flows
agent: build
---

Load the `browse` and `setup-browser-cookies` skills and execute this browser session setup request:

$ARGUMENTS

Rules:

- Stay local and use the repo-local `browse` workflow
- If the request gives a browser and domain, prefer direct import
- Otherwise open the browser cookie picker and write a local setup summary
- Write the report under `.gstack/browser-session/` unless the request gives an explicit output path
- Do not modify code in this command
