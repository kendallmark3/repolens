# Project Intent — Repo Scope

## Purpose
Build a polished, professional React application called Repo Scope that gives engineering leaders, architects, platform teams, and repository administrators a centralized view of the software repositories owned by an organization. First release focuses on non-intrusive, read-only repository discovery and inventory, while establishing the data model and architecture needed for later intelligence phases.

Product direction: **Discover → Understand → Intent → Reason → Recommend → Act**
v1 delivers: **Discover → Understand**

## Business Outcomes
- Give leaders a single answer to: "We have hundreds of repositories. What are they, who owns them, what do they do, and what should we do with them?"
- Provide a Repository Intent model (Purpose, Inputs, Outputs, Success Criteria, Dependencies, Consumers, Ownership, Constraints, Lifecycle, Confidence) distinct from observed repository metadata.
- Support future Capability Discovery ("find existing capability before building new") and Intelligence (duplicate detection, obsolescence, modernization) without redesigning v1.
- Demonstrate a provider-independent adapter architecture (GitHub, GitLab, Azure DevOps, Bitbucket placeholders; simulated provider for v1).

## Constraints
- Read-only by default. No source writes, PRs, branch creation, repository deletion/archival, or admin source-control privileges — ever.
- No production AI integration, SSO, enterprise RBAC, or multi-tenant billing in v1.
- Relational data model (PostgreSQL-preferred, SQLite acceptable for local demo) with referential integrity.
- Frontend: React + TypeScript. Backend: Node.js/TypeScript preferred.
- ~50 realistic seeded repositories across 8 teams, 7 business domains, 15-20 technologies, 40+ dependencies, sample intents and findings.
- Enterprise management-console visual style per LTM Design System - no cartoon styling, no lorem ipsum, no empty placeholder screens.
- Do not over-engineer infrastructure for future phases; prefer a clean working vertical slice.

## Design System
Apply the LTM Design System: clean Apple-inspired corporate style - white backgrounds, generous whitespace, crisp sans-serif typography, subtle grays, minimal color accents, no dark headers, no amber accents, no cream backgrounds.

## Non-Goals for v1
Source writes, PRs, automatic archival, repository deletion, production SSO, enterprise RBAC, multi-tenant billing, autonomous modernization, production AI integration, automated refactoring.

## Success Criteria
Full detailed specification (data entities, screens, seed requirements, validation checklist) is preserved verbatim in `intent/current-feature.md` as the working source of truth for this build.
