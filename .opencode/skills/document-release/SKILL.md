---
name: document-release
description: Update a small, factual set of project docs from local changes and write a durable summary without committing or using GitHub APIs.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "4"
  mode: local-only
---

## What This Skill Does

This is the first OpenCode-native `/document-release` slice for gstack. It updates a narrow, factual set of Markdown docs from local repository changes and writes a durable summary artifact.

In this v1 slice:

- inspect the local diff when a base branch is available
- update selected Markdown files with factual changes only
- skip risky or narrative rewrites
- write a summary under `.gstack/document-release/`

Do not commit, push, edit PR bodies, or use GitHub APIs in this v1 workflow.

## Execution Contract

- Stay local; do not load unrelated skills
- Do not use background tasks or todo lists for this v1 flow
- Write the summary artifact before returning the final answer
- If a requested update is ambiguous, skip it and record the skip in the summary
- If the user names specific doc files, update each named file in place unless the request explicitly says to skip it
- When the diff introduces a new command, script, file path, or feature name, apply that factual change directly to each named doc that should mention it

## Documents In Scope

Target only these files in v1 unless the user narrows scope further:

- `README.md`
- `README-zh-CN.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `TODOS.md`
- `docs/**/*.md`

Out of scope in v1:

- `CHANGELOG.md`
- `VERSION`
- `README.claude.backup.md`

## Base Branch Detection

Prefer local-only refs in this order:

```bash
if git show-ref --verify --quiet refs/remotes/origin/main; then echo origin/main;
elif git show-ref --verify --quiet refs/remotes/origin/master; then echo origin/master;
elif git show-ref --verify --quiet refs/heads/main; then echo main;
elif git show-ref --verify --quiet refs/heads/master; then echo master;
else echo NO_BASE; fi
```

If there is no usable base branch but the user gave explicit doc targets and local files to compare, continue with that narrower scope.

## What Counts As A Safe Update

Only make factual updates only. Good examples:

- add a new command name to a usage list
- update a setup step or file path
- refresh feature lists to match changed code
- update command examples to match current scripts or entrypoints

Do not do large narrative rewrites, philosophy changes, or speculative documentation cleanup.

## Workflow

### 1. Initialize

- detect the local base branch if available
- determine the output summary path
- create `.gstack/document-release/` if needed

Use `.gstack/document-release/document-release-{slug}.md` unless the user provides an explicit output path.

### 2. Select Candidate Docs

- if the user named specific doc files, use only those
- otherwise, use the v1 allowlist and select docs relevant to the local diff

### 3. Gather Evidence

- read `git diff <base> --name-only` and `git diff <base> --stat` when a base exists
- read the changed code or config files needed to support factual edits
- read each selected Markdown file before editing it

### 4. Apply Updates

Update only what the diff or explicit request clearly supports.

If the user explicitly names target docs, treat those files as required outputs for this run rather than optional candidates.

Examples:

- README feature list
- docs usage commands
- architecture file paths or component names
- contributing setup steps

### 5. Write Summary

Write a summary artifact under `.gstack/document-release/` listing:

- output scope
- docs updated
- docs skipped
- why anything was skipped

If the request provides an explicit summary output path, use that exact path.

## Rules

- Read before editing
- Keep updates factual and minimal
- Skip ambiguity instead of inventing content
- Do not touch `CHANGELOG.md`, `VERSION`, or `README.claude.backup.md` in this workflow unless the user explicitly overrides scope
- Do not commit, stage, or push changes
