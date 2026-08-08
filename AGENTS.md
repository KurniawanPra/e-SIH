## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## gstack

This project includes the gstack workflow stack (OpenCode adaptation of `garrytan/gstack`, MIT) — slash commands and skills that turn the agent into a software startup team: CEO planning, engineering review, design review, QA, and release.

Available commands: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/design-consultation`, `/design-review`, `/review`, `/qa`, `/qa-only`, `/ship`, `/debug`, `/browse`, `/setup-browser-cookies`, `/document-release`, `/retro`, `/gstack-upgrade`.

Rules:
- `/plan-ceo-review`, `/plan-eng-review` and `/plan-design-review` write bounded reports under `.gstack/` — pressure-test plans before implementation.
- `/review` runs a structural pre-landing review (SQL/data safety, race conditions, trust boundaries) and writes to `.gstack/review-reports/`.
- `/qa` and `/qa-only` verify a running URL; `/browse` prefers the repo-local binary at `./browse/dist/browse` when present, otherwise falls back to the agent's own browser tools.
- `/ship` produces a local release-readiness report before shipping.
- Keep all reports local and bounded; never treat gstack reports as unverified facts — they are agent-written artifacts.
