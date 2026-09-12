-- Repo Scope relational schema
-- Designed for SQLite in v1 local demo, with Postgres portability in mind
-- (explicit PK/FK, no SQLite-only types beyond TEXT/INTEGER/REAL).

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS team (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  business_unit TEXT
);

CREATE TABLE IF NOT EXISTS business_domain (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS technology (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  lifecycle_status TEXT NOT NULL DEFAULT 'Current'
);

CREATE TABLE IF NOT EXISTS repository (
  id TEXT PRIMARY KEY,
  external_repository_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  inferred_purpose TEXT,
  repository_url TEXT,
  provider TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'internal',
  default_branch TEXT NOT NULL DEFAULT 'main',
  lifecycle_state TEXT NOT NULL DEFAULT 'Unknown',
  team_id TEXT REFERENCES team(id) ON DELETE SET NULL,
  business_domain_id TEXT REFERENCES business_domain(id) ON DELETE SET NULL,
  created_date TEXT NOT NULL,
  last_commit_date TEXT,
  last_scan_date TEXT,
  archive_candidate_date TEXT,
  archived_date TEXT,
  activity_level TEXT NOT NULL DEFAULT 'Unknown',
  health_score INTEGER,
  documentation_score INTEGER,
  test_score INTEGER,
  intelligence_confidence INTEGER
);

CREATE INDEX IF NOT EXISTS idx_repository_team ON repository(team_id);
CREATE INDEX IF NOT EXISTS idx_repository_domain ON repository(business_domain_id);
CREATE INDEX IF NOT EXISTS idx_repository_lifecycle ON repository(lifecycle_state);
CREATE INDEX IF NOT EXISTS idx_repository_provider ON repository(provider);

CREATE TABLE IF NOT EXISTS repository_intent (
  id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL UNIQUE REFERENCES repository(id) ON DELETE CASCADE,
  purpose TEXT,
  intent_status TEXT NOT NULL DEFAULT 'Draft',
  confidence INTEGER NOT NULL DEFAULT 0,
  generated_at TEXT NOT NULL,
  reviewed_at TEXT,
  reviewed_by TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS repository_intent_input (
  id TEXT PRIMARY KEY,
  repository_intent_id TEXT NOT NULL REFERENCES repository_intent(id) ON DELETE CASCADE,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS repository_intent_output (
  id TEXT PRIMARY KEY,
  repository_intent_id TEXT NOT NULL REFERENCES repository_intent(id) ON DELETE CASCADE,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS repository_intent_success_criterion (
  id TEXT PRIMARY KEY,
  repository_intent_id TEXT NOT NULL REFERENCES repository_intent(id) ON DELETE CASCADE,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS repository_intent_constraint (
  id TEXT PRIMARY KEY,
  repository_intent_id TEXT NOT NULL REFERENCES repository_intent(id) ON DELETE CASCADE,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS repository_intent_risk (
  id TEXT PRIMARY KEY,
  repository_intent_id TEXT NOT NULL REFERENCES repository_intent(id) ON DELETE CASCADE,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS repository_technology (
  repository_id TEXT NOT NULL REFERENCES repository(id) ON DELETE CASCADE,
  technology_id TEXT NOT NULL REFERENCES technology(id) ON DELETE CASCADE,
  PRIMARY KEY (repository_id, technology_id)
);

CREATE TABLE IF NOT EXISTS repository_dependency (
  id TEXT PRIMARY KEY,
  source_repository_id TEXT NOT NULL REFERENCES repository(id) ON DELETE CASCADE,
  target_repository_id TEXT NOT NULL REFERENCES repository(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'runtime',
  confidence INTEGER NOT NULL DEFAULT 80,
  UNIQUE (source_repository_id, target_repository_id, dependency_type)
);

CREATE INDEX IF NOT EXISTS idx_dep_source ON repository_dependency(source_repository_id);
CREATE INDEX IF NOT EXISTS idx_dep_target ON repository_dependency(target_repository_id);

CREATE TABLE IF NOT EXISTS api (
  id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL REFERENCES repository(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  protocol TEXT NOT NULL DEFAULT 'REST',
  version TEXT NOT NULL DEFAULT 'v1',
  endpoint_count INTEGER NOT NULL DEFAULT 0,
  specification_type TEXT NOT NULL DEFAULT 'OpenAPI'
);

CREATE INDEX IF NOT EXISTS idx_api_repo ON api(repository_id);

CREATE TABLE IF NOT EXISTS repository_scan (
  id TEXT PRIMARY KEY,
  repository_id TEXT REFERENCES repository(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'running',
  files_examined INTEGER NOT NULL DEFAULT 0,
  findings_count INTEGER NOT NULL DEFAULT 0,
  repositories_discovered INTEGER NOT NULL DEFAULT 0,
  intents_created INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS intelligence_finding (
  id TEXT PRIMARY KEY,
  repository_id TEXT REFERENCES repository(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  confidence INTEGER NOT NULL DEFAULT 70,
  detected_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
);

CREATE INDEX IF NOT EXISTS idx_finding_repo ON intelligence_finding(repository_id);
CREATE INDEX IF NOT EXISTS idx_finding_category ON intelligence_finding(category);
