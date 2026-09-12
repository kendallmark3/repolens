# Current Feature — Repo Scope v1 (Discovery + Intent Foundation)

## Outcome
Ship Repo Scope v1: a runnable, polished React + Node/TypeScript management console for enterprise repository discovery, inventory, and a foundational Repository Intent model, seeded with ~50 realistic repositories.

## Product Positioning
"Connect your repositories. Discover what you own. Understand what it does."
Future: "Know what your company has built before you build it again."

## Core Business Questions Answered
What repos do we own; what does each do; who owns it; which team/domain; what tech; last changed; active/dormant/legacy; archive-candidate; dependencies (in/out); APIs exposed; duplicate capabilities; modernization candidates.

## Repository Intent Model
Separate from observed metadata. Fields: Purpose, Inputs, Outputs, Success Criteria, Dependencies, Consumers, Ownership, Constraints, Lifecycle (Active/Maintenance/Legacy/Dormant/Archive Candidate/Archived/Unknown), Confidence.
Flow: Repository -> Observed Architecture -> Repository Intent -> Comparison -> Gap Analysis -> Recommendation.

## Source Control Adapters
Provider abstraction: listRepositories, getRepositoryMetadata, getRepositoryStructure, getRepositoryDocumentation, getRepositoryDependencies, getRepositoryActivity, getRepositoryOwnership.
Placeholders: GitHub, GitLab, Azure DevOps, Bitbucket. Simulated provider implemented for v1. No tight GitHub coupling.

## Security Model
Read-only by default, forever, in v1. No branch creation, repo modification, PRs, deletion, archival, or admin changes.

## Data Entities
Repository, RepositoryIntent (+ child entities for inputs/outputs/success criteria/constraints), Team, BusinessDomain, Technology, RepositoryTechnology (M:N), RepositoryDependency, Api, RepositoryScan, IntelligenceFinding - fields as specified in the original brief (id, external ids, lifecycle state, activity/health/doc/test scores, confidence, etc).

## Seed Data
~50 repositories, 8 teams, 7 business domains, 15-20 technologies, 40+ dependency edges, APIs, activity, ownership, lifecycle mix, sample Repository Intents, sample Intelligence Findings. Realistic mix: React apps, Java services, .NET apps, Python workers, Node services, infra/Terraform, shared libraries, APIs, data pipelines, legacy/experimental/dormant projects. Enterprise-sounding names.

## Screens
1. Overview (dashboard) - counts (total/active/maintenance/legacy/dormant/archive-candidates/unknown-ownership/recently-changed/needs-review) + charts (lifecycle, technology, domain, age, activity, ownership coverage).
2. Repositories - searchable/sortable/filterable inventory (columns: Repository, Purpose, Owner, Domain, Technology, Lifecycle, Last Activity, Health, Intent Confidence; filters: Provider, Team, Domain, Technology, Lifecycle, Activity, Ownership, Archive Candidate, Health).
3. Repository Detail - Overview, Repository Intent (labeled as inferred), Technology badges, Dependencies (depends-on/used-by), APIs, Health indicators, Findings.
4. Capabilities ("Find Existing Capability") - search a capability (e.g. "customer notifications"), return matching repos with Relevance, Owner, Technology, Lifecycle, Intent Confidence. Text match over seeded metadata/intent for v1.
5. Intelligence - org-wide findings: no owner, dormant, archive candidates, duplicate capabilities, weak docs, legacy tech, missing intent, low-confidence classification. Mark simulated/preview clearly.
6. Dependencies - dependency relationships view.
7. Archive Candidates - recommendations only (triggers: 24+ months no commits, no owner, explicitly legacy, very low activity, duplicate capability). Never destructive.
8. Discovery - provider adapter cards (GitHub/GitLab/Azure DevOps/Bitbucket status), "Run Discovery" using simulated adapter with staged progress (connecting -> enumerating -> metadata -> tech detection -> dependencies -> registry update -> intent candidates -> findings -> complete). Scan history (date, provider, repo count, findings, intents created, duration, status).
9. Reports - Repository Portfolio, Technology Landscape, Lifecycle, Ownership Gaps, Archive Candidates, Repository Health, Business Domain Coverage, Repository Intent Coverage. On-screen for v1.
10. Settings - placeholder for future config.

## Navigation
Overview, Repositories, Capabilities, Intelligence, Dependencies, Archive Candidates, Discovery, Reports, Settings.

## Styling
LTM Design System: clean, Apple-inspired, white background, generous whitespace, crisp sans-serif, subtle grays, minimal color, status badges, polished tables, readable charts, responsive. No dark headers, no amber, no cream, no gimmicks, no lorem ipsum.

## Non-Goals
No source writes, PRs, deletion, auto-archival, production SSO/RBAC, multi-tenant billing, autonomous modernization, production AI integration, automated refactoring. Don't over-build infra for future phases.

## Acceptance Criteria
1. App installs and runs locally (frontend + backend).
2. Polished React console; ~50 seeded repos; relational integrity (SQLite for v1, Postgres-portable schema).
3. Inventory searchable/filterable; detail pages complete; ownership/domains/tech/deps/APIs/activity represented; lifecycle states represented.
4. Repository Intent modeled, displayed, and populated for a realistic subset of repos.
5. Capability discovery works via text match against metadata + intent.
6. Archive candidates reviewable (no destructive action anywhere in the app).
7. Discovery screen demonstrates adapter architecture + simulated run with progress + scan history.
8. Provider-specific code isolated from normalized repository model.
9. Intelligence findings displayed; reports show useful portfolio info.
10. README explains setup, architecture, adapters, Repository Intent, and future phases (next intent: connect to a real GitHub org via read-only discovery).

## Implementation Notes
Work goal-first; make reasonable technical decisions rather than pausing on minor questions; use simulated functionality wherever real external credentials would otherwise block completion; keep simulated boundaries explicit in the UI and code comments.
