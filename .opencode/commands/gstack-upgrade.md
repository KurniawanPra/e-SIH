---
description: Check local gstack setup health and write a bounded upgrade-readiness report
agent: build
---

Load the `gstack-upgrade` skill and execute this upgrade-readiness request:

$ARGUMENTS

Rules:

- Stay local to the current repo and local files
- Write the report under `.gstack/gstack-upgrade/` unless the request gives an explicit output path
- Check setup/build consistency instead of performing automatic destructive changes in this v1 slice
- Do not modify code in this command
