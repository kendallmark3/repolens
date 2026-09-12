# Repo Scope

**Connect your repositories. Discover what you own. Understand what it does.**

Repo Scope is an enterprise repository discovery and intelligence platform. It gives engineering leaders, architects, platform teams, and repository administrators a centralized, management-oriented view of the software repositories an organization owns - read-only, provider-independent, and architected to grow from *discovery* into *intelligence* and *development guidance* without a redesign.

> Future positioning: **Know what your company has built before you build it again.**

This application was built using [Intent-Driven Engineering](https://intent-driven-engineering.com) from the [`intent-drive-starter`](https://github.com/kendallmark3/intent-drive-starter) template (see [`README.starter.md`](README.starter.md) for the methodology this repo follows). The full intent this build satisfies lives in [`intent/project-intent.md`](intent/project-intent.md) and [`intent/current-feature.md`](intent/current-feature.md).

---

## Product direction

```
Discover -> Understand -> Intent -> Reason -> Recommend -> Act
```

**v1 (this release) delivers Discover -> Understand.** It establishes the data model and adapter architecture required for later phases without building the agentic machinery prematurely.

---

## What's in v1

- **Repository inventory** - 72 realistic seeded repositories across 8 teams, 7 business domains, and 20 technologies, searchable, sortable, and filterable.
- **Repository Intent model** - a first-class, separate representation of *why* a repository exists (Purpose, Inputs, Outputs, Success Criteria, Dependencies, Constraints, Lifecycle, Confidence), distinct from observed metadata. 44 of the seeded repositories have a reviewed intent record; the rest intentionally do not, to demonstrate "missing intent" findings.
- **Capability Discovery** ("Find Existing Capability") - text search across repository metadata and Repository Intent so teams can check what already exists before building something new.
- **Intelligence findings** - ownership gaps, dormant repositories, archive candidates, duplicate capabilities, weak documentation, legacy technology, missing intent, and low-confidence classifications, all generated heuristically from the seeded data and clearly labeled as v1/simulated where relevant.
- **Dependency graph** - repository-to-repository dependency edges with type and confidence, plus a "most depended-on" view.
- **Archive Candidates** - recommendations only. Repo Scope never archives, deletes, or modifies a repository.
- **Discovery console** - provider adapter status (GitHub, GitLab, Azure DevOps, Bitbucket placeholders; a working Simulated provider), a staged "Run Discovery" flow, and scan history.
- **Reports** - Repository Portfolio, Technology Landscape, Lifecycle, Ownership Gaps, Archive Candidates, Repository Health, Business Domain Coverage, and Repository Intent Coverage.

## What's explicitly out of scope for v1

Source repository writes, pull requests, automatic archival, repository deletion, production SSO, enterprise RBAC, multi-tenant billing, autonomous modernization, production AI integration, and automated refactoring. Repo Scope is **read-only by default and forever** in this release - there is no code path anywhere in the application that modifies a source-control system.

---

## Architecture

```
GitHub       |
GitLab       |
Azure DevOps |-- Repository Adapters (RepositoryProvider interface)
Bitbucket    |
Simulated    |
                 v
          Discovery Pipeline
                 v
        Normalized Repo Model
                 v
         Repository Registry  ---------->  Repository Intent
                 v                              v
          Intelligence Findings          Comparison / Gap Analysis (future)
                 v
         Management Console (React)
```

### Provider adapters

Every source-control integration implements the same read-only `RepositoryProvider` interface (`server/src/adapters/RepositoryProvider.ts`):

```ts
listRepositories()
getRepositoryMetadata()
getRepositoryStructure()
getRepositoryDocumentation()
getRepositoryDependencies()
getRepositoryActivity()
getRepositoryOwnership()
```

There is intentionally no method for branch creation, writes, PRs, or deletion anywhere on this contract. `server/src/adapters/SimulatedProvider.ts` is the only adapter implemented against real (seeded) data in v1; GitHub, GitLab, Azure DevOps, and Bitbucket are registered as placeholders (`server/src/adapters/registry.ts`) so the Discovery screen can show the intended architecture without requiring credentials yet.

### Repository Intent model

Repository Intent is modeled as its own entity (`repository_intent`, with child tables for inputs, outputs, success criteria, constraints, and observed risks) - deliberately separate from the `repository` table's observed metadata. This is what will eventually let Repo Scope compare *declared intent* against *observed reality* and surface gaps (duplicate capability, drifted purpose, missing ownership, etc.) in a later phase.

### Data model

SQLite in v1 for zero-friction local setup, with a schema written to be Postgres-portable (explicit primary/foreign keys, no SQLite-only types). Core entities: `repository`, `repository_intent` (+ 5 child tables), `team`, `business_domain`, `technology`, `repository_technology` (M:N), `repository_dependency`, `api`, `repository_scan`, `intelligence_finding`. Full DDL: `server/src/db/schema.sql`.

### Stack

- **Frontend:** React 19 + TypeScript + Vite, React Router, Recharts. Styled to the LTM Design System (clean, Apple-inspired, white background, generous whitespace, minimal color).
- **Backend:** Node.js + TypeScript + Express, `better-sqlite3`.
- **Database:** SQLite (file at `server/data/repo-scope.db`, created and seeded on first run).

---

## Running it locally

Requires Node.js 20+.

```bash
# 1. Install and seed the backend
cd server
npm install
npm run seed        # creates + seeds server/data/repo-scope.db (idempotent - skips if already seeded)
npm run dev          # starts the API on http://localhost:4000

# 2. In a second terminal, install and start the frontend
cd client
npm install
npm run dev          # starts the app on http://localhost:5173 (proxies /api to :4000)
```

Open **http://localhost:5173**.

To reseed from scratch, delete `server/data/repo-scope.db` (and its `-wal`/`-shm` files) and re-run `npm run seed`.

### Production build

```bash
cd server && npm run build && npm start   # compiles to dist/, serves API on :4000
cd client && npm run build                # outputs static assets to client/dist/
```

---

## Known limitations (v1)

- Capability search is text matching, not semantic search. The API shape (`GET /api/capabilities?q=`) is designed so a semantic/embedding backend can be swapped in later without a contract change.
- Real GitHub/GitLab/Azure DevOps/Bitbucket adapters are not implemented - only their interface and registry entries exist. Connecting a real provider requires read-only, least-privilege credentials that are intentionally not part of this release.
- Intelligence findings (duplicate capability, dormancy, etc.) are generated by straightforward heuristics over the seeded data, not machine learning. They're clearly a v1/demonstration mechanism, not a production classifier.
- No authentication, RBAC, or multi-tenancy. Anyone who can reach the app can see everything - appropriate for a local demo, not for shared enterprise deployment as-is.
- Reports are on-screen only; no export (CSV/PDF) yet.

## Recommended next intent

**Connect Repo Scope to a real GitHub organization using read-only discovery.**

This would mean implementing `GitHubProvider` against the existing `RepositoryProvider` interface using a read-only GitHub App or fine-grained PAT scoped to repository metadata, wiring it into the Discovery screen alongside the Simulated provider, and validating the same downstream pipeline (registry -> intent candidates -> findings) against real repository data instead of seeded data.
