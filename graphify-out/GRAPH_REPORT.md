# Graph Report - e-SIH  (2026-08-10)

## Corpus Check
- 386 files · ~365,665 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2657 nodes · 3866 edges · 194 communities (171 shown, 23 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `687be242`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- plugins/auth.ts
- browse/src/server.ts
- dashboard/page.tsx
- dashboard/layout.tsx
- Model Queries
- Driver Adapters
- compilerOptions
- api.ts
- frontend/package.json
- Upgrade to Prisma ORM 7
- What You Must Do When Invoked
- cookie-import-browser.ts
- cdp-bridge.ts
- scripts
- activities/page.tsx
- Relation Queries
- Removed Features
- programs/page.tsx
- PortalLoginGate.tsx
- BrowseClient
- browser-skill-commands.ts
- Quick Rules
- browser-manager.ts
- Prisma CLI Reference
- Raw Queries
- Troubleshooting Prisma Compute
- opencode.json
- Core QA Patterns
- commands.ts
- cli.ts
- domain-skill-commands.ts
- token-registry.ts
- Client Methods
- Filter Conditions and Operators
- Query Options
- security-classifier.ts
- security.ts
- BrowserManager
- meta-commands.ts
- Model Queries
- Driver Adapters
- Model Queries
- Driver Adapters
- Upgrade to Prisma ORM 7
- Upgrade to Prisma ORM 7
- terminal-agent.ts
- Relation Queries
- prisma db push
- prisma dev
- prisma generate
- prisma studio
- Prisma Client API Reference
- Prisma Config
- getCurrentUser
- Removed Features
- terminal-agent-control.ts
- prisma migrate dev
- extractToken
- react-chartjs-2
- read-commands.ts
- Prisma CLI Reference
- prisma db seed
- Environment Variables
- dependencies
- Raw Queries
- prisma db pull
- prisma init
- prisma migrate deploy
- Constructor Options
- Prisma Database Setup
- Prisma Accelerate Users
- ESM and CommonJS Support
- devDependencies
- Schema Changes
- compilerOptions
- Transactions
- Workflow
- network-capture.ts
- Prisma Compute Framework Readiness
- MongoDB Setup
- Prisma SQL Driver Adapter Implementation
- Core Workflows
- prisma db execute
- Prisma Platform CLI App Deploy
- MySQL Setup
- management-api
- prisma migrate diff
- prisma migrate reset
- PostgreSQL Setup
- Prisma Postgres Setup
- SQLite Setup
- file-permissions.ts
- security-sidecar-client.ts
- SQL Server Setup
- create-db-cli
- api-basics
- xvfb.ts
- config.ts
- prisma format
- prisma migrate resolve
- prisma validate
- CockroachDB Setup
- decision-stay-or-migrate
- console-and-connections
- management-api-sdk
- browse/package.json
- pty-session-cookie.ts
- prisma migrate status
- Prisma Compute Config
- create-prisma Compute Flow
- SDK and API Automation
- migrations-mapping
- schema-contract-mapping
- Prisma MongoDB Upgrade Path
- endpoints
- graphify reference: extra exports and benchmark
- security-bunnative.ts
- prisma mcp
- client-api-mapping
- Service Tokens
- prisma debug
- Prisma Client Setup
- verify-cutover-checklist
- Prisma 7 Client Instantiation
- Panduan Cara Pasang & Deploy Web App e-SIH di Google Apps Script (GAS)
- .launchHeaded
- graphify reference: query, path, explain
- e-SIH
- AI safety checkpoint for destructive commands
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- seed.ts
- prisma complete
- .eslintrc.json
- app/layout.tsx
- graphify.js
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AGENTS.md
- docker-entrypoint.sh
- backend/README.md
- next.config.mjs
- next-env.d.ts
- postcss.config.mjs
- frontend/README.md
- extraction-spec.md
- postman/README.md
- Workflow
- Workflow
- Workflow
- qa-only/SKILL.md
- Workflow
- review/SKILL.md
- ship/SKILL.md
- plan-eng-review/SKILL.md
- retro/SKILL.md
- document-release/SKILL.md
- browse/SKILL.md
- debug/SKILL.md
- setup-browser-cookies/SKILL.md
- gstack-upgrade/SKILL.md
- design-review/SKILL.md
- design-consultation/SKILL.md
- Prisma Compute
- find-browse.ts
- find-browse
- remote-slug
- build-node-server.sh
- setup

## God Nodes (most connected - your core abstractions)
1. `BrowserManager` - 80 edges
2. `buildFetchHandler()` - 60 edges
3. `handleMetaCommand()` - 31 edges
4. `handleCommandInternalImpl()` - 30 edges
5. `handleWriteCommand()` - 29 edges
6. `mkdirSecure()` - 28 edges
7. `TabSession` - 25 edges
8. `BrowseClient` - 22 edges
9. `LazyBrowseClient` - 22 edges
10. `Troubleshooting Prisma Compute` - 22 edges

## Surprising Connections (you probably didn't know these)
- `buildFetchHandler()` --indirect_call--> `subscribe()`  [INFERRED]
  .claude/skills/gstack/browse/src/server.ts → .claude/skills/gstack/browse/src/activity.ts
- `CdpDispatchInput` --references--> `BrowserManager`  [EXTRACTED]
  .claude/skills/gstack/browse/src/cdp-bridge.ts → .claude/skills/gstack/browse/src/browser-manager.ts
- `handleSnapshot()` --indirect_call--> `escapeEnvelopeSentinels()`  [INFERRED]
  .claude/skills/gstack/browse/src/snapshot.ts → .claude/skills/gstack/browse/src/content-security.ts
- `DashboardLayout()` --calls--> `getCurrentUser()`  [EXTRACTED]
  frontend/src/app/dashboard/layout.tsx → frontend/src/lib/api.ts
- `handleMetaCommand()` --references--> `diff`  [EXTRACTED]
  .claude/skills/gstack/browse/src/meta-commands.ts → .claude/skills/gstack/browse/package.json

## Import Cycles
- None detected.

## Communities (194 total, 23 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.04
Nodes (47): dependencies, dotenv, fastify, @fastify/cors, fastify-plugin, @fastify/secure-session, @libsql/client, @prisma/adapter-libsql (+39 more)

### Community 1 - "plugins/auth.ts"
Cohesion: 0.10
Nodes (27): buildApp(), getLocalIpv4s(), config, env, envSchema, EmployeeGrade, fastify, @fastify/secure-session (+19 more)

### Community 2 - "browse/src/server.ts"
Cohesion: 0.07
Nodes (39): AuditEntry, initAuditLog(), writeAuditEntry(), readVersionHash(), BROWSE_PARENT_PID, BROWSE_PORT, browserManager, checkPortAvailable() (+31 more)

### Community 4 - "dashboard/page.tsx"
Cohesion: 0.20
Nodes (8): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES, cn()

### Community 5 - "dashboard/layout.tsx"
Cohesion: 0.13
Nodes (16): DashboardLayout(), HeaderProps, BADGE_COLORS, MarqueeFooter(), Sidebar(), SidebarProps, YearContext, YearContextType (+8 more)

### Community 6 - "Model Queries"
Cohesion: 0.07
Nodes (27): aggregate, Aggregation Operations, Atomic operations, count, create, Create Operations, createMany, createManyAndReturn (+19 more)

### Community 7 - "Driver Adapters"
Cohesion: 0.07
Nodes (27): Accept self-signed certificates, After (v7), Available Adapters, Before (v6), Configuration, Connection Pool Configuration, Driver Adapters, Installation (+19 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 9 - "api.ts"
Cohesion: 0.14
Nodes (14): activeExchanges, CallbackContent(), Header(), accessSteps, getInitials(), PortalLoginGate(), BACKEND_DRIVER, BackendDriver (+6 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.22
Nodes (8): engines, node, name, overrides, glob, postcss, private, version

### Community 11 - "Upgrade to Prisma ORM 7"
Cohesion: 0.08
Nodes (25): 1. Update package.json for ESM-first projects, 2. Update tsconfig.json, 3. Update schema.prisma, 4. Create prisma.config.ts, 5. Install a driver adapter (SQL providers only), 6. Update client instantiation, 7. Replace Prisma.validator with satisfies, 8. Run migrations and generate (+17 more)

### Community 12 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 13 - "cookie-import-browser.ts"
Cohesion: 0.09
Nodes (46): BROWSER_REGISTRY, BrowserInfo, BrowserMatch, BrowserPlatform, CdpCookie, cdpSameSite(), CHROME_PATHS_WIN, chromiumEpochToUnix() (+38 more)

### Community 14 - "cdp-bridge.ts"
Cohesion: 0.07
Nodes (40): CDP_ALLOWLIST, CDP_ALLOWLIST_INDEX, CdpAllowEntry, CdpOutput, CdpScope, isCdpMethodAllowed(), lookupCdpMethod(), NOTE: Tracing.start can capture cross-tab data depending on categories. (+32 more)

### Community 15 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, typecheck

### Community 16 - "activities/page.tsx"
Cohesion: 0.18
Nodes (14): CookieImportError, PlaywrightCookie, corsOrigin(), errorResponse(), getSessionFromCookie(), handleCookiePickerRoute(), hasActivePicker(), importedCounts (+6 more)

### Community 17 - "Relation Queries"
Cohesion: 0.08
Nodes (23): Connect existing, Count Relations, Create or connect, Create with relations, Delete related, Disconnect, every, Filter counted relations (+15 more)

### Community 18 - "Removed Features"
Cohesion: 0.08
Nodes (23): Alternatives, Auto-generate after migrate, Auto-seed after migrate, Automatic Behaviors Removed, CLI Flags Removed, Client Middleware, Common Middleware Patterns, Custom counter with extensions (+15 more)

### Community 19 - "programs/page.tsx"
Cohesion: 0.18
Nodes (11): activityBuffer, ActivityEntry, ActivitySubscriber, emitActivity(), filterArgs(), getActivityAfter(), getActivityHistory(), SENSITIVE_COMMANDS (+3 more)

### Community 20 - "PortalLoginGate.tsx"
Cohesion: 0.09
Nodes (29): buildCommandResponse(), buildFetchHandler(), closeTunnel(), emitInspectorEvent(), extractToken(), getTokenInfo(), grantPtyToken(), handleCommand() (+21 more)

### Community 21 - "BrowseClient"
Cohesion: 0.07
Nodes (9): browse, BrowseClient, BrowseClientError, BrowseClientOptions, defaultStateFile(), LazyBrowseClient, parseIntegerEnvValue(), resolveBrowseAuth() (+1 more)

### Community 22 - "browser-skill-commands.ts"
Cohesion: 0.07
Nodes (54): BuildEnvOptions, buildSpawnEnv(), CappedRead, formatUsage(), handleList(), handleRm(), handleRun(), handleShow() (+46 more)

### Community 23 - "Quick Rules"
Cohesion: 0.22
Nodes (9): 1. Command Verification, 2. Auth and Workspace Selection, 3. Framework Readiness, 4. Runtime Host and Port Binding, 5. Typed Compute Config, 6. Branch, Environment, and Database, 7. Deploy Operations, 8. SDK and API (+1 more)

### Community 24 - "browser-manager.ts"
Cohesion: 0.15
Nodes (21): getSubscriberCount(), BrowserState, consoleBuffer, dialogBuffer, DialogEntry, LogEntry, networkBuffer, NetworkEntry (+13 more)

### Community 25 - "Prisma CLI Reference"
Cohesion: 0.09
Nodes (21): AI Safety Checkpoint, Boundary: Platform and Compute, Bun Runtime, Client Generation, Command Categories, Current Command Behavior, Current Prisma CLI Setup, Database Operations (+13 more)

### Community 26 - "Raw Queries"
Cohesion: 0.09
Nodes (21): BigInt handling, Database-Specific Features, Date handling, Delete example, Dynamic table/column names, $executeRaw, Handling Results, Insert example (+13 more)

### Community 27 - "Troubleshooting Prisma Compute"
Cohesion: 0.09
Nodes (22): Accidental Prisma Postgres Provisioning, Auth Fails, Bun Entrypoint Missing, Compute Config Invalid, `create-prisma --yes` Did Not Deploy, Database Wiring or Schema Did Not Apply, Env Changes Did Not Apply, First Checks (+14 more)

### Community 28 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 29 - "Core QA Patterns"
Cohesion: 0.04
Nodes (48): 10. Compare environments, 11. Show screenshots to the user, 12. Render local HTML (no HTTP server needed), 13. Retina screenshots (deviceScaleFactor), 14. Offline render mode (rasterize your own HTML/JSON, zero network), 1. Verify a page loads correctly, 2. Test a user flow, 3. Verify an action worked (+40 more)

### Community 30 - "commands.ts"
Cohesion: 0.11
Nodes (33): ALL_COMMANDS, allCmds, buildUnknownCommandError(), canonicalizeCommand(), COMMAND_ALIASES, COMMAND_DESCRIPTIONS, descKeys, DOM_CONTENT_COMMANDS (+25 more)

### Community 31 - "cli.ts"
Cohesion: 0.12
Nodes (33): acquireServerLock(), buildRestartEnv(), cleanChromiumProfileLocks(), cleanupLegacyState(), config, ensureServer(), extractGlobalFlags(), extractTabId() (+25 more)

### Community 32 - "domain-skill-commands.ts"
Cohesion: 0.15
Nodes (36): formatSavedOk(), formatSkillListing(), handleDomainSkillCommand(), handleEdit(), handleList(), handlePromoteToGlobal(), handleRm(), handleRollback() (+28 more)

### Community 33 - "token-registry.ts"
Cohesion: 0.09
Nodes (23): checkDomain(), checkRate(), checkRateLimit(), connectAttempts, createSetupKey(), createToken(), CreateTokenOptions, exchangeSetupKey() (+15 more)

### Community 34 - "Client Methods"
Cohesion: 0.10
Nodes (18): Add custom methods, Add model methods, Chain extensions, Client Methods, $connect(), $disconnect(), $extends(), Graceful shutdown (+10 more)

### Community 35 - "Filter Conditions and Operators"
Cohesion: 0.10
Nodes (20): AND (explicit), AND (implicit), Array Field Filters, Combined, Comparison, Equality, every, Filter Conditions and Operators (+12 more)

### Community 36 - "Query Options"
Cohesion: 0.10
Nodes (20): cursor, distinct, Filtered include, include, Include relation count, Multiple distinct fields, Negative take (reverse), Nested include (+12 more)

### Community 38 - "security-classifier.ts"
Cohesion: 0.09
Nodes (33): ClaudeCommand, parseOverrideArgs(), resolveClaudeBinary(), resolveClaudeCommand(), stripWrappingQuotes(), checkHaikuAvailable(), checkTranscript(), ClassifierStatus (+25 more)

### Community 39 - "security.ts"
Cohesion: 0.07
Nodes (33): AttemptRecord, ATTEMPTS_LOG, buildTelemetrySpawnCommand(), classifyTranscript(), clearDecision(), combineVerdict(), CombineVerdictOpts, decisionFileForTab() (+25 more)

### Community 41 - "meta-commands.ts"
Cohesion: 0.11
Nodes (8): handleSnapshot(), INTERACTIVE_ROLES, ParsedNode, parseLine(), parseSnapshotArgs(), SNAPSHOT_FLAGS, SnapshotOptions, TabSession

### Community 42 - "Model Queries"
Cohesion: 0.18
Nodes (4): addConsoleEntry(), addDialogEntry(), addNetworkEntry(), CircularBuffer

### Community 43 - "Driver Adapters"
Cohesion: 0.18
Nodes (18): modifyStyle(), undoModification(), generatePickerCode(), parsePdfFromFile(), SAFE_DIRECTORIES, TEMP_ONLY, validateOutputPath(), validateReadPath() (+10 more)

### Community 44 - "Model Queries"
Cohesion: 0.13
Nodes (8): ActivityItem, emptyActivityForm, ParentProgram, SubProgram, UserOption, ModalPortal(), ModalPortalProps, api

### Community 45 - "Driver Adapters"
Cohesion: 0.11
Nodes (16): ARIA_INJECTION_PATTERNS, BLOCKLIST_DOMAINS, cleanupHiddenMarkers(), ContentFilter, ContentFilterResult, datamarkContent(), ensureMarker(), escapeEnvelopeSentinels() (+8 more)

### Community 46 - "Upgrade to Prisma ORM 7"
Cohesion: 0.29
Nodes (8): applyStealth(), buildStealthScript(), extendedModeEnabled(), HostProfile, isExtendedStealthEnabled(), readHostProfile(), STEALTH_IGNORE_DEFAULT_ARGS, STEALTH_LAUNCH_ARGS

### Community 47 - "Upgrade to Prisma ORM 7"
Cohesion: 0.44
Nodes (9): BLOCKED_IPV6_PREFIXES, BLOCKED_METADATA_HOSTS, isBlockedIpv6(), isMetadataIp(), normalizeFileUrl(), normalizeHostname(), resolvesToBlockedIp(), RFC-3986 (+1 more)

### Community 48 - "terminal-agent.ts"
Cohesion: 0.09
Nodes (38): safeUnlink(), mkdirSecure(), writeSecureFile(), writeDecision(), writeSessionState(), appendToRingBuffer(), BROWSE_SERVER_PORT, buildServer() (+30 more)

### Community 49 - "Relation Queries"
Cohesion: 0.25
Nodes (6): AudioInfo, BackgroundImageInfo, ImageInfo, MediaResult, VideoInfo, VideoSource

### Community 50 - "prisma db push"
Cohesion: 0.10
Nodes (19): Accept data loss, Basic push, Command, Common Patterns, Comparison with migrate dev, Examples, Follow-up Command, Force reset (+11 more)

### Community 51 - "prisma dev"
Cohesion: 0.10
Nodes (19): Background mode, Command, Configuration, Custom ports, Examples, Force remove (stops first), Instance Management, List all instances (+11 more)

### Community 52 - "prisma generate"
Cohesion: 0.10
Nodes (19): After schema changes, Basic generation, Bun Runtime, CI/CD pipeline, Command, Common Patterns, Compiler Build Tuning, Current Generator Behavior (+11 more)

### Community 53 - "prisma studio"
Cohesion: 0.10
Nodes (19): Command, Common Workflow, Custom port, Don't open browser, Edit Records, Examples, Features, Filter Data (+11 more)

### Community 54 - "Prisma Client API Reference"
Cohesion: 0.10
Nodes (19): Client Instantiation, Client Methods, Create records, Delete records, Filter Operators, Find records, How to Use, Model Query Methods (+11 more)

### Community 55 - "Prisma Config"
Cohesion: 0.10
Nodes (19): After (v7) - prisma.config.ts, Basic Configuration, Before (v6) - schema.prisma, Configuration Options, Custom Config Path, datasource.directUrl, datasource.shadowDatabaseUrl, datasource.url (+11 more)

### Community 56 - "getCurrentUser"
Cohesion: 0.16
Nodes (14): ParentPK, ProgramKerjaPage(), SubItem, DaftarProgramKerjaPage(), emptyForm, MONTH_NAMES, MonthlyActivitiesPage(), STATUS_COLORS (+6 more)

### Community 57 - "Removed Features"
Cohesion: 0.31
Nodes (9): formatUploadTime(), getWeekTag(), isSameMonthYear(), MONTH_NAMES, weekLabel(), WeeklyActivitiesPage(), ActivityItem, exportTableToExcel3() (+1 more)

### Community 58 - "terminal-agent-control.ts"
Cohesion: 0.22
Nodes (10): ParsedProxyConfig, ProxyConfigError, toUpstreamConfig(), buildUpstream(), parseConnectRequest(), startSocksBridge(), testUpstream(), UpstreamConfig (+2 more)

### Community 59 - "prisma migrate dev"
Cohesion: 0.11
Nodes (18): After schema changes, Command, Common Patterns, Create and apply migration, Create without applying, Examples, Follow-up Commands, Full workflow (+10 more)

### Community 60 - "extractToken"
Cohesion: 0.22
Nodes (8): Lease, LEASE_TTL_MS, leases, mintLease(), pruneExpired(), refreshLease(), revokeLease(), validateLease()

### Community 62 - "read-commands.ts"
Cohesion: 0.17
Nodes (19): formatInspectorResult(), getModificationHistory(), assertJsOriginAllowed(), getCleanText(), handleReadCommand(), hasAwait(), needsBlockWrapper(), OutArgs (+11 more)

### Community 63 - "Prisma CLI Reference"
Cohesion: 0.50
Nodes (3): @opencode-ai/plugin, dependencies, @opencode-ai/plugin

### Community 64 - "prisma db seed"
Cohesion: 0.11
Nodes (17): Best Practices, Command, Common Patterns, Common seed commands, Conditional seeding, Configuration, Current Workflow, Development reset (+9 more)

### Community 65 - "Environment Variables"
Cohesion: 0.11
Nodes (17): 1. Install dotenv, 2. Import in prisma.config.ts, Application Code, Bun Users, CI/CD Considerations, Entry point, Environment Variables, Multiple .env Files (+9 more)

### Community 66 - "dependencies"
Cohesion: 0.11
Nodes (18): axios, chart.js, exceljs, dependencies, axios, chart.js, exceljs, lucide-react (+10 more)

### Community 81 - "prisma db pull"
Cohesion: 0.12
Nodes (16): Basic introspection, Command, Examples, Force overwrite, Generated Schema Example, MongoDB Introspection, Options, Post-Introspection Cleanup (+8 more)

### Community 82 - "prisma init"
Cohesion: 0.12
Nodes (16): Add an example model, Basic initialization, Bun Runtime, Command, Examples, Generated Config (Bun), Generated Config (Node.js default), Generated Schema (+8 more)

### Community 83 - "prisma migrate deploy"
Cohesion: 0.12
Nodes (16): Basic deployment, Best Practices, Check status first, Command, Comparison with migrate dev, Configuration, Docker deployment, Error Handling (+8 more)

### Community 84 - "Constructor Options"
Cohesion: 0.12
Nodes (16): accelerateUrl (For Accelerate users), adapter (Required for the SQL provider workflow), Basic Instantiation, comments, Constructor Options, errorFormat, log, Log Events (+8 more)

### Community 85 - "Prisma Database Setup"
Cohesion: 0.12
Nodes (16): Bun Runtime, Configuration Files, Driver Adapters, How to Use, MongoDB, MySQL, PostgreSQL, Prisma Client Setup (Required) (+8 more)

### Community 86 - "Prisma Accelerate Users"
Cohesion: 0.12
Nodes (16): 1. Keep your Accelerate URL, 2. Install Accelerate extension, 3. Configure prisma.config.ts, 4. Instantiate client with accelerateUrl, Caching with Accelerate, Correct v7 Setup for Accelerate, Edge Runtime, Important (+8 more)

### Community 87 - "ESM and CommonJS Support"
Cohesion: 0.12
Nodes (16): Browser-Safe Types, Bun, "Cannot use import statement outside a module", CommonJS Projects, "ERR_REQUIRE_ESM", ESM and CommonJS Support, ESM Projects, File Extensions (+8 more)

### Community 88 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, serve, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 91 - "Schema Changes"
Cohesion: 0.12
Nodes (15): 1. Provider name, 2. Output is required, 3. engineType changed, 4. moduleFormat is explicit when needed, After Schema Changes, Datasource Block, Example Output Paths, Generated Entrypoints (+7 more)

### Community 96 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+6 more)

### Community 97 - "Transactions"
Cohesion: 0.13
Nodes (14): All or nothing, Best Practices, Handle errors, Interactive Transactions, Isolation levels, Keep transactions short, Nested Writes, OrThrow in Transactions (+6 more)

### Community 98 - "Workflow"
Cohesion: 0.13
Nodes (14): Error Handling, Prerequisites, Prisma Postgres Setup, Reference Files, Step 1: Authenticate, Step 2: List available regions, Step 3: Create a project with a database, Step 4: Create a named connection (optional) (+6 more)

### Community 106 - "network-capture.ts"
Cohesion: 0.13
Nodes (7): captureBuffer, CapturedResponse, clearCapture(), createResponseListener(), exportCapture(), SizeCappedBuffer, startCapture()

### Community 107 - "Prisma Compute Framework Readiness"
Cohesion: 0.14
Nodes (14): Astro, Bun, Elysia, and Plain Source Servers, CLI-First Model, CLI Matrix, Custom Build Artifacts, Hono, NestJS, Next.js (+6 more)

### Community 108 - "MongoDB Setup"
Cohesion: 0.14
Nodes (13): 1. Schema Configuration, 2. Environment Variable, Common Issues, Current Verification Notes, Driver Adapters, ID Field Requirement, "Invalid ObjectID", Migrations vs Introspection (+5 more)

### Community 109 - "Prisma SQL Driver Adapter Implementation"
Cohesion: 0.14
Nodes (13): Commit and rollback, Contract snapshot, Error mapping, Factory, ownership, and shadow database, Priority rules, Prisma SQL Driver Adapter Implementation, Query implementation, Result mapping (+5 more)

### Community 110 - "Core Workflows"
Cohesion: 0.14
Nodes (13): 1. Console-first workflow, 2. Quick provisioning with create-db, 2b. Persistent databases with the Platform CLI, 3. Link an existing local project, 4. Programmatic provisioning with Management API, 5. Type-safe integration with Management API SDK, Core Workflows, How to Use (+5 more)

### Community 119 - "prisma db execute"
Cohesion: 0.15
Nodes (12): Command, Configuration, Current Option Surface, Examples, Execute from file, Execute from stdin, Execute `migrate diff` output, Limitations (+4 more)

### Community 120 - "Prisma Platform CLI App Deploy"
Cohesion: 0.15
Nodes (13): Agent Skill Installation, Auth and Project Binding, Build and Run Locally, Database and Env, Deploy, Deployment Story: GitHub vs CLI, Operations, Output Handling (+5 more)

### Community 121 - "MySQL Setup"
Cohesion: 0.15
Nodes (12): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, Common Issues, Connection String Format, Driver Adapter, JSON Support, MySQL Setup (+4 more)

### Community 122 - "management-api"
Cohesion: 0.15
Nodes (12): API exploration, Authentication methods, Base URL, Current resource inventory, management-api, Notes, OAuth flow summary, Priority (+4 more)

### Community 133 - "prisma migrate diff"
Cohesion: 0.17
Nodes (11): Check for drift (CI), Command, Create baseline migration, Examples, Generate SQL for a schema change, Options, prisma migrate diff, Review pending migrations (+3 more)

### Community 134 - "prisma migrate reset"
Cohesion: 0.17
Nodes (11): Basic reset, Command, Configuration, Examples, Follow-up Steps, Force reset (CI/Automation), Options, prisma migrate reset (+3 more)

### Community 135 - "PostgreSQL Setup"
Cohesion: 0.17
Nodes (11): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, "Authentication failed", "Can't reach database server", Common Issues, Connection String Format, Driver Adapter (+3 more)

### Community 136 - "Prisma Postgres Setup"
Cohesion: 0.17
Nodes (11): 1. Schema Configuration, 2. Config Configuration, Connection String, Driver Adapter, Edge/serverless option, Features, Overview, Prisma Postgres Setup (+3 more)

### Community 137 - "SQLite Setup"
Cohesion: 0.17
Nodes (11): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, Common Issues, Connection String Format, "Database file not found", Driver Adapter, Limitations (+3 more)

### Community 138 - "file-permissions.ts"
Cohesion: 0.19
Nodes (10): appendSecureFile(), restrictDirectoryPermissions(), restrictFilePermissions(), warnIcaclsFailure(), ensureDir(), LOG_DIR, LOG_PATH, logTunnelDenial() (+2 more)

### Community 139 - "security-sidecar-client.ts"
Cohesion: 0.25
Nodes (15): browseRoot(), findSecuritySidecar(), nodeOnPath(), SidecarLocation, getState(), isSidecarAvailable(), PendingRequest, processBuffer() (+7 more)

### Community 144 - "SQL Server Setup"
Cohesion: 0.18
Nodes (10): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, Common Issues, Connection String Format, Driver Adapter, "Login failed for user", Prerequisites (+2 more)

### Community 145 - "create-db-cli"
Cohesion: 0.18
Nodes (10): Command discovery (`--help`), Commands, Common patterns, create-db-cli, `create` options, Lifecycle and claim flow, Priority, Programmatic usage (library API) (+2 more)

### Community 146 - "api-basics"
Cohesion: 0.18
Nodes (10): api-basics, Base URL, Collection, Error codes by HTTP status, Error Responses, Pagination, Resource ID Prefixes, Response Envelope (+2 more)

### Community 157 - "xvfb.ts"
Cohesion: 0.42
Nodes (8): cleanupXvfb(), isDisplayFree(), isOurXvfb(), pickFreeDisplay(), readPidCmdline(), readPidStartTime(), ShouldSpawnDecision, spawnXvfb()

### Community 158 - "config.ts"
Cohesion: 0.31
Nodes (9): BrowseConfig, cleanSingletonLocks(), getGitRoot(), getRemoteSlug(), resolveChromiumProfile(), resolveConfig(), resolveGstackHome(), safeUnlinkQuiet() (+1 more)

### Community 161 - "prisma format"
Cohesion: 0.20
Nodes (9): Behavior, Command, Examples, Format default schema, Format specific schema, Options, prisma format, Use in Editor (+1 more)

### Community 162 - "prisma migrate resolve"
Cohesion: 0.20
Nodes (9): Command, Examples, Mark as Applied (Baselining), Mark as Rolled Back (Fixing Failures), Options, prisma migrate resolve, References, Use Cases (+1 more)

### Community 163 - "prisma validate"
Cohesion: 0.20
Nodes (9): Command, Common Errors, Examples, Options, prisma validate, Use in CI, Validate default schema, Validate specific schema (+1 more)

### Community 164 - "CockroachDB Setup"
Cohesion: 0.20
Nodes (9): 1. Schema Configuration, 2. Config Configuration, 3. Environment Variable, CockroachDB Setup, Common Issues, Driver Adapter, ID Generation, Prerequisites (+1 more)

### Community 165 - "decision-stay-or-migrate"
Cohesion: 0.20
Nodes (9): Bad, Blocker checks before migrating, decision-stay-or-migrate, Good, Priority, References, Stay-on-v6 hygiene, The facts the decision rests on (+1 more)

### Community 166 - "console-and-connections"
Cohesion: 0.20
Nodes (9): Adapter choices, Connection setup, console-and-connections, Console workflow, Linking an existing project, Local Studio, Priority, References (+1 more)

### Community 167 - "management-api-sdk"
Cohesion: 0.20
Nodes (9): Full SDK (OAuth + refresh), Install, management-api-sdk, OAuth SDK flow, Priority, References, Simple client (existing token), Why It Matters (+1 more)

### Community 186 - "browse/package.json"
Cohesion: 0.17
Nodes (11): dependencies, diff, playwright, socks, name, private, type, version (+3 more)

### Community 187 - "pty-session-cookie.ts"
Cohesion: 0.22
Nodes (7): buildPtySetCookie(), mintPtySessionToken(), pruneExpired(), revokePtySessionToken(), Session, sessions, validatePtySessionToken()

### Community 190 - "prisma migrate status"
Cohesion: 0.22
Nodes (8): Check status, Command, Examples, Exit Codes, Options, prisma migrate status, What It Does, When to Use

### Community 191 - "Prisma Compute Config"
Cohesion: 0.22
Nodes (9): App Fields, Basic Shape, Database Scope, File Names and Discovery, Generating a Config with `init`, Monorepos and Multi-App Repos, Precedence, Prisma Compute Config (+1 more)

### Community 192 - "create-prisma Compute Flow"
Cohesion: 0.22
Nodes (9): Addon Notes, Basic Commands, create-prisma Compute Flow, Failure Handling, Generated Deploy Script, Generated Files to Preserve, PostgreSQL and Database Behavior, Reference (+1 more)

### Community 193 - "SDK and API Automation"
Cohesion: 0.22
Nodes (8): Compute SDK, Management API Concepts, Prefer the CLI for App Workflows, Regions, Repository-snapshot detection, SDK and API Automation, SDK Build Strategies, Secrets and Redaction

### Community 196 - "migrations-mapping"
Cohesion: 0.22
Nodes (8): Bad, Good, migrations-mapping, Priority, Prisma Next: first-class, contract-driven migrations (Mongo included), References, v6: `db push` only, Why It Matters

### Community 197 - "schema-contract-mapping"
Cohesion: 0.22
Nodes (8): Bad, Environment requirements, Good, Priority, References, schema-contract-mapping, The mapping, Why It Matters

### Community 198 - "Prisma MongoDB Upgrade Path"
Cohesion: 0.22
Nodes (8): Decision table, Hand-off rule, If staying on v6: hygiene (a deliberate stay, not neglect), Prisma MongoDB Upgrade Path, Reference files, The decision, up front, The version landscape, Verified against

### Community 199 - "endpoints"
Cohesion: 0.22
Nodes (8): Create connection, Create project (with database), Delete database, Delete project, endpoints, Get database, List projects, List regions

### Community 201 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 204 - "security-bunnative.ts"
Cohesion: 0.27
Nodes (10): benchClassify(), classify(), ClassifyResult, encodeWordPiece(), getCachedTokenizer(), HFTokenizerConfig, LatencyReport, loadHFTokenizer() (+2 more)

### Community 208 - "prisma mcp"
Cohesion: 0.25
Nodes (7): Command, Notes, prisma mcp, References, Typical Use Cases, Usage, What It Does

### Community 209 - "client-api-mapping"
Cohesion: 0.25
Nodes (7): Bad, client-api-mapping, Good, Priority, References, The mapping, Why It Matters

### Community 210 - "Service Tokens"
Cohesion: 0.25
Nodes (7): auth, Creating a service token, OAuth 2.0 (for user-scoped access), Security practices, Service Tokens, Token scope, Using a service token

### Community 219 - "prisma debug"
Cohesion: 0.29
Nodes (6): Command, Example Output, Options, prisma debug, What It Does, When to Use

### Community 220 - "Prisma Client Setup"
Cohesion: 0.29
Nodes (6): 1. Install dependencies, 2. Add generator block, 3. Generate Prisma Client, 4. Instantiate Prisma Client, 5. Use a single instance, Prisma Client Setup

### Community 221 - "verify-cutover-checklist"
Cohesion: 0.29
Nodes (6): Checklist, Ground rules, Priority, References, verify-cutover-checklist, Why It Matters

### Community 222 - "Prisma 7 Client Instantiation"
Cohesion: 0.29
Nodes (6): Basic instantiation, Common mistakes, Key rules, Prisma 7 Client Instantiation, Required packages, Usage in application code

### Community 224 - "Panduan Cara Pasang & Deploy Web App e-SIH di Google Apps Script (GAS)"
Cohesion: 0.29
Nodes (6): 🔐 Cara Kerja Hak Akses (2 Role), 🚀 Langkah 1: Buat Google Sheet & Buka Script Editor, 📂 Langkah 2: Salin File Proyek ke Script Editor, 🛠️ Langkah 3: Inisialisasi Database Google Sheets, 🌐 Langkah 4: Deploy Web App, Panduan Cara Pasang & Deploy Web App e-SIH di Google Apps Script (GAS)

### Community 228 - ".launchHeaded"
Cohesion: 0.18
Nodes (4): handleChromiumDisconnect(), isCustomChromium(), resolveDisconnectCause(), shouldEnableChromiumSandbox()

### Community 229 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 230 - "e-SIH"
Cohesion: 0.40
Nodes (4): Backend, e-SIH, Frontend, Integrasi SSO Otomatis (`Intes.cmd --integrate`)

### Community 233 - "AI safety checkpoint for destructive commands"
Cohesion: 0.50
Nodes (3): AI safety checkpoint for destructive commands, Reference, Required workflow

### Community 236 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 237 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 238 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 262 - "Workflow"
Cohesion: 0.12
Nodes (16): 1. Read Inputs, 2. Determine UI Scope Decision, 3. Evaluate Information Architecture, 4. Map Interaction State Coverage, 5. Identify AI Slop Risk, 6. Identify Responsive & Accessibility Gaps, 7. Produce Scope and Deferrals, 8. Produce Local Validation (+8 more)

### Community 263 - "Workflow"
Cohesion: 0.12
Nodes (16): 1. Initialize, 2. Orient, 3. Explore, 4. Document, 5. Score, 6. Write Outputs, 7. Optional Fix Loop, Execution Contract (+8 more)

### Community 264 - "Workflow"
Cohesion: 0.12
Nodes (15): 1. Read Inputs, 2. Produce Premise Challenge, 3. Produce 10x Check, 4. Produce Alternative Approaches, 5. Produce Recommendation, 6. Produce Scope and Deferrals, 7. Produce Local Validation, 8. Produce Not In Scope (+7 more)

### Community 265 - "qa-only/SKILL.md"
Cohesion: 0.12
Nodes (15): 1. Initialize, 2. Orient, 3. Explore, 4. Document, 5. Score, 6. Write Outputs, Execution Contract, Full (+7 more)

### Community 266 - "Workflow"
Cohesion: 0.13
Nodes (14): 1. Read Inputs, 2. Identify The Core Question, 3. Pressure-Test Demand, 4. Check The Status Quo, 5. Name The Narrowest Wedge, 6. Recommend The Next Step, 7. Write The Memo, Execution Contract (+6 more)

### Community 267 - "review/SKILL.md"
Cohesion: 0.13
Nodes (14): 1. Initialize, 2. Read Inputs, 3. Run Structural Review, 4. Optional Fix Loop, 5. Write Findings, Base Branch Detection, Enum & Value Completeness, Execution Contract (+6 more)

### Community 268 - "ship/SKILL.md"
Cohesion: 0.13
Nodes (14): 1. Gather Branch Context, 2. Run Verification, 3. Check Review Readiness, 4. Write Ship Decision, 5. Optional Shipping Actions, Base Branch Detection, Execution Contract, Fixed Report Sections (+6 more)

### Community 269 - "plan-eng-review/SKILL.md"
Cohesion: 0.14
Nodes (13): 1. Read Inputs, 2. Produce Architecture Summary, 3. Produce Data Flow, 4. Produce Risks, 5. Produce Test Matrix, 6. Produce Not In Scope, Execution Contract, Fixed Report Sections (+5 more)

### Community 270 - "retro/SKILL.md"
Cohesion: 0.14
Nodes (13): 1. Gather Local History, 2. Summarize Shipping Activity, 3. Call Out Wins, 4. Call Out Friction, 5. Note Test Health Signals, 6. Recommend The Next Focus, Execution Contract, Fixed Report Sections (+5 more)

### Community 271 - "document-release/SKILL.md"
Cohesion: 0.15
Nodes (12): 1. Initialize, 2. Select Candidate Docs, 3. Gather Evidence, 4. Apply Updates, 5. Write Summary, Base Branch Detection, Documents In Scope, Execution Contract (+4 more)

### Community 272 - "browse/SKILL.md"
Cohesion: 0.17
Nodes (11): Binary Setup, Capture evidence, Common Patterns, Compare environments, Core Rules, Explore and click through a flow, Snapshot Guidance, Test responsive layouts (+3 more)

### Community 273 - "debug/SKILL.md"
Cohesion: 0.17
Nodes (11): 1. Reproduce, 2. Trace, 3. Hypothesize, 4. Write Report, Execution Contract, Iron Law, Outputs, Required Inputs (+3 more)

### Community 274 - "setup-browser-cookies/SKILL.md"
Cohesion: 0.17
Nodes (11): 1. Verify Browse Setup, 2. Choose Import Mode, 3. Execute The Import, 4. Write The Summary, Execution Contract, Fixed Report Sections, Output, Required Input (+3 more)

### Community 275 - "gstack-upgrade/SKILL.md"
Cohesion: 0.18
Nodes (10): 1. Inspect Local Inputs, 2. Perform Version Check, 3. Determine Setup State, 4. Write The Report, Execution Contract, Fixed Report Sections, Output, Rules (+2 more)

### Community 276 - "design-review/SKILL.md"
Cohesion: 0.20
Nodes (9): Browse Setup, Execution Contract, Optional Fix Loop, Output, Report Contract, Required Command Sequence, Required Input, Required Sections (+1 more)

### Community 277 - "design-consultation/SKILL.md"
Cohesion: 0.29
Nodes (6): Execution Contract, Output, Required Input, Required Sections, Rules, Section Rules

### Community 310 - "Prisma Compute"
Cohesion: 0.22
Nodes (9): Avoid, Decision Tree, Preferred Workflow, Prisma Compute, Prisma Compute CLI Surface, Rules by Priority, Send Feedback and Report CLI Issues, Source-of-Truth Order (+1 more)

### Community 330 - "find-browse.ts"
Cohesion: 0.60
Nodes (5): findExecutable(), getGitRoot(), isExecutable(), locateBinary(), main()

## Knowledge Gaps
- **1363 isolated node(s):** `name`, `version`, `private`, `type`, `diff` (+1358 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BrowserManager` connect `BrowserManager` to `domain-skill-commands.ts`, `browse/src/server.ts`, `.launchHeaded`, `meta-commands.ts`, `Model Queries`, `Driver Adapters`, `cdp-bridge.ts`, `activities/page.tsx`, `programs/page.tsx`, `browser-manager.ts`, `read-commands.ts`, `commands.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `mkdirSecure()` connect `terminal-agent.ts` to `browse/src/server.ts`, `.launchHeaded`, `security-classifier.ts`, `security.ts`, `file-permissions.ts`, `browser-skill-commands.ts`, `commands.ts`, `browser-manager.ts`, `config.ts`, `cli.ts`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `handleWriteCommand()` connect `Driver Adapters` to `browse/src/server.ts`, `.launchHeaded`, `meta-commands.ts`, `cookie-import-browser.ts`, `Upgrade to Prisma ORM 7`, `Relation Queries`, `browser-manager.ts`, `commands.ts`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `buildFetchHandler()` (e.g. with `subscribe()` and `.totalAdded()`) actually correct?**
  _`buildFetchHandler()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _1363 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `plugins/auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09615384615384616 - nodes in this community are weakly interconnected._