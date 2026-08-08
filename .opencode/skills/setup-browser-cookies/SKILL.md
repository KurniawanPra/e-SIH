---
name: setup-browser-cookies
description: Prepare a local authenticated browser session for OpenCode QA and design workflows using gstack browse cookie import flows.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "12"
  mode: operational
---

## What This Skill Does

This is the first OpenCode-native `/setup-browser-cookies` slice for gstack. It helps prepare an authenticated browser session for QA or design workflows by using the local `browse` cookie import capabilities.

In this v1 slice:

- verify the local `browse` binary is available
- use the local browser cookie import flow
- write a setup summary under `.gstack/browser-session/`

Do not modify code in this workflow.

## Required Input

This workflow works in either of these modes:

- direct mode: an explicit browser plus one or more domains
- picker mode: no domains provided, so the local picker is opened

Examples:

- `Import Chrome cookies for app.example.com`
- `Use Brave and import cookies for staging.example.com`
- `Open the cookie picker and write the result to .gstack/browser-session/opencode-smoke.md`

## Execution Contract

- Load the `browse` skill first
- Stay local; do not use external services
- Write the setup summary before returning the final answer
- If import cannot complete, still write a bounded report explaining the blocker

## Output

Write the report under `.gstack/browser-session/`.

Default path:

- `.gstack/browser-session/setup-browser-cookies-{slug}.md`

Honor an explicit output path if the request provides one.

## Fixed Report Sections

The report must include these sections:

- `Requested Browser`
- `Requested Domains`
- `Import Mode`
- `Observed Result`
- `Next Step`

## Workflow

### 1. Verify Browse Setup

Use the local `browse` binary setup check from the `browse` skill.

### 2. Choose Import Mode

- If the request provides a browser and domain, prefer direct import with `cookie-import-browser <browser> --domain <domain>`
- Otherwise use picker mode with `cookie-import-browser [browser]`

### 3. Execute The Import

Run the import flow through the local `browse` binary.

### 4. Write The Summary

Write a short report with:

- `Requested Browser`
- `Requested Domains`
- `Import Mode`
- `Observed Result`
- `Next Step`

## Rules

- Prefer direct import when explicit domains are available
- Keep the output operational and concise
- Do not claim authenticated access succeeded unless the import actually succeeded
- Do not modify repository files other than the requested report output
