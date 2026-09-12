# Intent v2 — Repository Relationship Intelligence

> Progressive intent. Extends [`project-intent.md`](project-intent.md) and [`current-feature.md`](current-feature.md) — does not replace them. v1 delivered Discover → Understand (inventory, capability search, intelligence findings, dependency graph). v2 pushes Dependencies specifically from a relationship *list* into a relationship *intelligence* layer, per the product direction: Discover → Understand → Intent → Reason → Recommend → Act.

## Intent / Goal
Evolve the Dependencies screen so it answers "what depends on what, why, and what breaks if this changes" — not just "here are the edges." This intent covers the three capabilities that need new data or new views to get there. It does **not** cover blast-radius/risk flags or the four summary tiles (high-dependency repos, deps on archive candidates, circular relationships, low-confidence relationships) — those already shipped (commit `5b8a2ef`) and are out of scope here; reuse them, don't rebuild them.

## Inputs / Context
- Shipped and reusable as-is: `server/src/routes/dependencies.ts` (risk-flagged `mostDependedOn`, `summary` block), `client/src/pages/DependenciesPage.tsx` (tiles, risk badges, edge table).
- Schema gap: `repository_dependency` (`server/src/db/schema.sql`) is `(id, source_repository_id, target_repository_id, dependency_type, confidence)` — no field records *why* an edge exists.
- Seed data: `server/src/seed/dependencies.ts` generates every `repository_dependency` row today; it will need to generate evidence too.
- Source of this intent: a stakeholder review of the live Dependencies page. Explicit feedback: keep the ranked-list/table as the default view — a graph is something to drill into per repository, not a permanent network-spaghetti visualization on the main page.
- Constraint carried forward from `project-intent.md`: read-only forever, no source-control writes.

## Outputs
1. **Evidence on edges** — each `repository_dependency` row records the signal Repo Scope used to infer it (e.g. `package.json`, API URL reference, OpenAPI reference, Maven/NuGet package, Terraform reference, GitHub Actions workflow, import statement), surfaced by expanding/clicking a row in the existing edge table.
2. **Dependency chain endpoint** — a new API endpoint returning one repository's upstream dependencies and downstream dependents.
3. **Chain drill-in view** — a per-repository UI (reached from Repository Detail and/or the Dependencies list) showing upstream → this repo → downstream, opt-in per repo.
4. **"What breaks if I change this?"** — framing on top of the chain view: the downstream set presented as an impact answer, each affected repo shown with its lifecycle and activity level (reusing the v1.x at-risk heuristic).

## Success Criteria
- Every seeded dependency edge has an evidence signal, visible without leaving the Dependencies page.
- From any repository, a user can drill into its dependency chain and see both directions.
- Asking "what breaks if I change this?" for a given repo produces a named list of downstream repositories, not just a count.
- The Dependencies page's default view is unchanged in kind — ranked list + table stay the default; the chain/graph is opt-in per repository.
- No source-control write path is introduced anywhere.

## Constraints
Carried forward from `project-intent.md`: read-only by default, forever; SQLite acceptable for v1, schema stays Postgres-portable (explicit PK/FK, no SQLite-only types); React + TypeScript client, Node + TypeScript server; LTM Design System styling (clean, white background, minimal color, no cartoon styling, no lorem ipsum). Don't over-engineer — ship each of the three capabilities as its own clean vertical slice rather than one large combined change.

## Current State / Repo Assumptions
- v1.x blast-radius flags and summary tiles are live (`server/src/routes/dependencies.ts`, `client/src/pages/DependenciesPage.tsx`) — build alongside, not over.
- No graph-rendering library is installed (`client/package.json` has Recharts for charts only, nothing graph-oriented). A one-repo, few-hop chain does not need a network-graph library — prefer a hand-rolled column/tree layout consistent with the existing design system over adding a new dependency.
- There is no test suite in this repo (`server/` and `client/` have no test script) and CI is a placeholder — validation is build-clean + manual verification against seeded data, matching existing repo convention.

## Acceptance Criteria
1. `schema.sql` gains a way to record evidence per `repository_dependency` row (a new column, or a child table if an edge can have multiple signals) — pick the simplest shape that satisfies "why does this edge exist," and note the choice.
2. `seed/dependencies.ts` populates evidence for every generated edge from a realistic mix of signal types.
3. `GET /api/dependencies` edges include the evidence field; `DependenciesPage` reveals it per row on expand/click.
4. A new endpoint (e.g. `GET /api/repositories/:id/chain`) returns upstream and downstream relationships for one repository.
5. A UI entry point (from Repository Detail and/or the Dependencies list) opens the chain view for that repository.
6. The chain view answers "what breaks if I change this?" — downstream repos listed with name, lifecycle, and activity level.
7. Existing v1.x behavior (tiles, risk badges, flat edge table) is unchanged and still passes a manual smoke check.

## Validation / Evidence
- `npm run build` clean in both `server/` and `client/`.
- Manual verification against the running local dev servers: reseed, `curl` the new endpoint and confirm its shape against real seeded data, then drill into a real high-blast-radius repo (e.g. `identity-auth-service`) in the browser and confirm the chain and evidence render correctly — not placeholder data.

## Stop Conditions
Stop once all three capabilities (evidence, chain drill-in, blast-radius framing) work end-to-end against the seeded dataset. Do not additionally build: a permanent network-graph visualization on the main Dependencies page, multi-hop transitive traversal beyond what's needed to answer "what breaks if I change this," or any editing/write capability for dependency evidence.
