# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Repo Scope: an enterprise repository discovery/intelligence platform (React client + Node/Express API + SQLite). Read-only by design — see Constraints below before touching anything adapter-related. Full product context is in [`README.md`](../README.md); the authoritative scope/spec for the current build is [`intent/project-intent.md`](../intent/project-intent.md) and [`intent/current-feature.md`](../intent/current-feature.md) — read these before planning nontrivial changes.

## Commands

There is no root-level package.json — `server/` and `client/` are independent npm projects, each run from its own directory.

```bash
# Backend (server/) — Express API on :4000
npm install
npm run seed    # creates + seeds server/data/repo-scope.db (idempotent: skips if repository table is non-empty)
npm run dev     # tsx watch, live reload
npm run build   # tsc -p tsconfig.json -> dist/
npm start       # node dist/index.js (run build first)

# Frontend (client/) — Vite dev server on :5173, proxies /api -> localhost:4000
npm install
npm run dev
npm run build   # tsc -b && vite build -> client/dist/
npm run lint    # oxlint
npm run preview
```

To reseed from scratch: delete `server/data/repo-scope.db` (and `-wal`/`-shm` siblings), then `npm run seed` again.

**There is no test suite in either package** (no test script, no test framework installed) and CI (`.github/workflows/ci.yml`) is currently a placeholder (`echo "Add build/test steps"`). Don't invent test commands — if you add tests, you'll need to choose and wire up a framework first.

## Architecture

**Data flow:** `RepositoryProvider` adapters -> Discovery pipeline -> normalized `repository` table -> Repository Intent (separate model) -> Intelligence findings -> React console. See the diagram in [`README.md`](../README.md#architecture).

- **Provider adapters** (`server/src/adapters/`): every source-control integration implements the read-only `RepositoryProvider` interface (`RepositoryProvider.ts` — `listRepositories`, `getRepositoryMetadata`, `getRepositoryStructure`, `getRepositoryDocumentation`, `getRepositoryDependencies`, `getRepositoryActivity`, `getRepositoryOwnership`). There is intentionally no write/create/delete method on this contract — don't add one. `SimulatedProvider.ts` is the only adapter with a real implementation in v1; GitHub/GitLab/Azure DevOps/Bitbucket exist only as status entries in `registry.ts` (`ADAPTER_REGISTRY`) so the Discovery screen can show them without credentials.
- **Repository Intent is a separate entity from observed metadata** — modeled as its own `repository_intent` table (+ child tables for inputs/outputs/success criteria/constraints/observed risks), not columns bolted onto `repository`. This split is deliberate: it's what lets a later phase compare *declared intent* vs *observed reality*. Keep that separation when touching this area.
- **Database** (`server/src/db/`): SQLite via `better-sqlite3`, file at `server/data/repo-scope.db` (gitignored, created on first run). Full DDL lives in one file, `schema.sql`, using only `TEXT`/`INTEGER`/`REAL` and explicit PK/FK (no SQLite-only types) so it stays Postgres-portable. `initSchema()` runs the whole file with `CREATE TABLE IF NOT EXISTS` on every server startup — schema changes go in `schema.sql`, not in ad hoc migrations. Core tables: `repository`, `repository_intent` (+5 child tables), `team`, `business_domain`, `technology`, `repository_technology` (M:N), `repository_dependency`, `api`, `repository_scan`, `intelligence_finding`.
- **Seeding** (`server/src/seed/`): `run.ts` is the entry point (`npm run seed`), generates ~50-72 realistic repositories across 8 teams / 7 business domains / 15-20 technologies plus dependencies, intents, and reference data. It's idempotent — checks `isSeeded()` before writing.
- **API** (`server/src/routes/`): one router file per resource area, each mounted under `/api/<name>` in `index.ts` (`repositories`, `overview`, `capabilities`, `intelligence`, `dependencies`, `discovery`, `reports`), plus `/api/health` and `/api/adapters`. Follow this one-router-per-domain convention for new endpoints.
- **Client** (`client/src/`): React 19 + TypeScript + Vite + React Router + Recharts. `App.tsx` is the route table — one page component per nav item (`pages/`), matching the server's resource areas 1:1 (Overview, Repositories, Repository Detail, Capabilities, Intelligence, Dependencies, Archive Candidates, Discovery, Reports, Settings). `lib/api.ts` is the fetch layer talking to the proxied `/api` routes; `components/Layout.tsx` and `components/ui.tsx` hold shared chrome/primitives.

## Constraints that shape design decisions

- **Read-only, forever, by architecture, not just policy**: no code path anywhere may create branches, open PRs, write files to, or archive/delete a source-control repository. "Archive Candidates" is a recommendation-only list. When adding adapter or discovery functionality, do not add a write method to `RepositoryProvider` or its implementations.
- **Capability search is plain text matching** in v1 (`GET /api/capabilities?q=`) — the API shape is deliberately generic so a semantic/embedding backend could replace the matching logic later without changing callers.
- **Intelligence findings are heuristics over seeded data**, not ML — keep new findings labeled as such in the UI (v1/simulated) rather than implying real classification.
- **No auth/RBAC/multi-tenancy** in v1 — don't add partial/half-built auth; it's explicitly out of scope until a later phase.
- **UI styling** follows the "LTM Design System": white backgrounds, generous whitespace, crisp sans-serif, subtle grays, minimal color accents — no dark headers, no amber accents, no cream backgrounds, no placeholder/lorem-ipsum screens.
- `context/architecture.md`, `context/business-rules.md`, `context/integrations.md`, `context/glossary.md`, `context/security.md` are currently unfilled stubs from the project template — don't treat their emptiness as "nothing to know here," check `README.md` and the code instead.
