---
name: browse
description: Use gstack's persistent browser in OpenCode for screenshots, QA flows, console checks, and browser-driven verification.
compatibility: opencode
metadata:
  host: opencode
  migration_phase: "1"
---

## What This Skill Does

This skill gives OpenCode agents a fast persistent browser using gstack's local `browse` binary.

Use it when you need to:

- open a page and verify it loads
- click through a user flow
- inspect console or network failures
- capture screenshots or annotated snapshots
- compare before/after page state
- test responsive layouts

The browser is stateful. Cookies, tabs, and local storage persist across commands.

## Binary Setup

Before any browser action, confirm the binary path:

```bash
if [ -x "./browse/dist/browse" ]; then
  B="./browse/dist/browse"
elif command -v browse >/dev/null 2>&1; then
  B="$(command -v browse)"
else
  echo "NEEDS_SETUP"
fi
```

If the result is `NEEDS_SETUP`, run the repo setup first:

```bash
./setup
```

If you need to do it manually instead, build it from this repo:

```bash
bun install && bun run build && bunx playwright install chromium
```

Then re-run the check and continue.

Prefer the repo-local binary at `./browse/dist/browse` when it exists.

## Core Rules

- Start with `snapshot -i` when you need to discover page elements
- Use `snapshot -D` after important interactions to confirm what changed
- Check `console` after interactions, not just after the first page load
- After writing screenshots, read them back so the user can see the image output
- Re-run `snapshot` after navigation because refs become stale

## Common Patterns

### Verify a page load

```bash
$B goto https://example.com
$B text
$B console
$B network
```

### Explore and click through a flow

```bash
$B goto https://example.com/login
$B snapshot -i
$B fill @e3 "user@example.com"
$B fill @e4 "password"
$B click @e5
$B snapshot -D
```

### Capture evidence

```bash
$B snapshot -i -a -o /tmp/annotated.png
$B screenshot /tmp/page.png
$B console
```

### Test responsive layouts

```bash
$B responsive /tmp/layout
$B viewport 375x812
$B screenshot /tmp/mobile.png
```

### Compare environments

```bash
$B diff https://staging.example.com https://prod.example.com
```

## Snapshot Guidance

Use `snapshot` as the primary inspection tool.

- `snapshot -i` for interactive refs
- `snapshot -a -o <file>` for annotated screenshots
- `snapshot -D` to see what changed after an action
- `snapshot -C` when a UI uses clickable divs or custom components that do not show up cleanly in the accessibility tree

## User-Facing Evidence

When you write screenshots or annotated images, use the file read path afterward so the result is visible to the user. A screenshot that only exists on disk is not enough evidence.
