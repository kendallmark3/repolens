import { Router } from "express";
import { db } from "../db/index.js";

export const repositoriesRouter = Router();

interface RepoRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  inferred_purpose: string;
  provider: string;
  visibility: string;
  lifecycle_state: string;
  last_commit_date: string;
  activity_level: string;
  health_score: number;
  documentation_score: number;
  test_score: number;
  intelligence_confidence: number;
  created_date: string;
  team_name: string | null;
  domain_name: string | null;
  intent_confidence: number | null;
}

const LIST_BASE_SQL = `
  SELECT
    r.id, r.name, r.slug, r.description, r.inferred_purpose, r.provider,
    r.visibility, r.lifecycle_state, r.last_commit_date, r.activity_level,
    r.health_score, r.documentation_score, r.test_score, r.intelligence_confidence,
    r.created_date,
    t.name as team_name, bd.name as domain_name,
    ri.confidence as intent_confidence
  FROM repository r
  LEFT JOIN team t ON t.id = r.team_id
  LEFT JOIN business_domain bd ON bd.id = r.business_domain_id
  LEFT JOIN repository_intent ri ON ri.repository_id = r.id
`;

repositoriesRouter.get("/", (req, res) => {
  const { search, provider, team, domain, lifecycle, technology, ownership, archiveCandidate, sortBy, sortDir } =
    req.query as Record<string, string | undefined>;

  const clauses: string[] = [];
  const params: Record<string, string> = {};

  if (search) {
    clauses.push("(r.name LIKE @search OR r.description LIKE @search OR r.inferred_purpose LIKE @search)");
    params.search = `%${search}%`;
  }
  if (provider) {
    clauses.push("r.provider = @provider");
    params.provider = provider;
  }
  if (team) {
    clauses.push("t.name = @team");
    params.team = team;
  }
  if (domain) {
    clauses.push("bd.name = @domain");
    params.domain = domain;
  }
  if (lifecycle) {
    clauses.push("r.lifecycle_state = @lifecycle");
    params.lifecycle = lifecycle;
  }
  if (ownership === "unowned") {
    clauses.push("r.team_id IS NULL");
  }
  if (archiveCandidate === "true") {
    clauses.push("r.lifecycle_state = 'Archive Candidate'");
  }
  if (technology) {
    clauses.push(
      "r.id IN (SELECT rt.repository_id FROM repository_technology rt JOIN technology tech ON tech.id = rt.technology_id WHERE tech.name = @technology)"
    );
    params.technology = technology;
  }

  let sql = LIST_BASE_SQL;
  if (clauses.length) sql += " WHERE " + clauses.join(" AND ");

  const sortColumns: Record<string, string> = {
    name: "r.name",
    lifecycle: "r.lifecycle_state",
    lastActivity: "r.last_commit_date",
    health: "r.health_score",
    confidence: "ri.confidence",
  };
  const sortCol = sortColumns[sortBy ?? ""] ?? "r.name";
  const dir = sortDir === "desc" ? "DESC" : "ASC";
  sql += ` ORDER BY ${sortCol} ${dir}`;

  const rows = db.prepare(sql).all(params) as RepoRow[];

  // Fetch technologies per repo in bulk
  const techRows = db
    .prepare(
      `SELECT rt.repository_id, tech.name FROM repository_technology rt JOIN technology tech ON tech.id = rt.technology_id`
    )
    .all() as { repository_id: string; name: string }[];
  const techByRepo = new Map<string, string[]>();
  for (const t of techRows) {
    if (!techByRepo.has(t.repository_id)) techByRepo.set(t.repository_id, []);
    techByRepo.get(t.repository_id)!.push(t.name);
  }

  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      purpose: r.inferred_purpose,
      provider: r.provider,
      visibility: r.visibility,
      lifecycle: r.lifecycle_state,
      lastActivity: r.last_commit_date,
      activityLevel: r.activity_level,
      healthScore: r.health_score,
      documentationScore: r.documentation_score,
      testScore: r.test_score,
      intelligenceConfidence: r.intelligence_confidence,
      intentConfidence: r.intent_confidence,
      createdDate: r.created_date,
      team: r.team_name,
      domain: r.domain_name,
      technologies: techByRepo.get(r.id) ?? [],
    }))
  );
});

repositoriesRouter.get("/facets", (_req, res) => {
  const providers = db.prepare("SELECT DISTINCT provider FROM repository ORDER BY provider").all();
  const teams = db.prepare("SELECT name FROM team ORDER BY name").all();
  const domains = db.prepare("SELECT name FROM business_domain ORDER BY name").all();
  const lifecycles = db.prepare("SELECT DISTINCT lifecycle_state FROM repository ORDER BY lifecycle_state").all();
  const technologies = db.prepare("SELECT name FROM technology ORDER BY name").all();
  res.json({
    providers: providers.map((p: any) => p.provider),
    teams: teams.map((t: any) => t.name),
    domains: domains.map((d: any) => d.name),
    lifecycles: lifecycles.map((l: any) => l.lifecycle_state),
    technologies: technologies.map((t: any) => t.name),
  });
});

repositoriesRouter.get("/:id", (req, res) => {
  const repo = db
    .prepare(
      `SELECT r.*, t.name as team_name, bd.name as domain_name
       FROM repository r
       LEFT JOIN team t ON t.id = r.team_id
       LEFT JOIN business_domain bd ON bd.id = r.business_domain_id
       WHERE r.id = ?`
    )
    .get(req.params.id) as any;

  if (!repo) return res.status(404).json({ error: "Repository not found" });

  const technologies = db
    .prepare(
      `SELECT tech.name, tech.category, tech.lifecycle_status FROM repository_technology rt
       JOIN technology tech ON tech.id = rt.technology_id WHERE rt.repository_id = ?`
    )
    .all(repo.id);

  const dependsOn = db
    .prepare(
      `SELECT r2.id, r2.name, r2.slug, r2.lifecycle_state, rd.dependency_type, rd.confidence
       FROM repository_dependency rd JOIN repository r2 ON r2.id = rd.target_repository_id
       WHERE rd.source_repository_id = ?`
    )
    .all(repo.id);

  const usedBy = db
    .prepare(
      `SELECT r2.id, r2.name, r2.slug, r2.lifecycle_state, rd.dependency_type, rd.confidence
       FROM repository_dependency rd JOIN repository r2 ON r2.id = rd.source_repository_id
       WHERE rd.target_repository_id = ?`
    )
    .all(repo.id);

  const apis = db.prepare("SELECT * FROM api WHERE repository_id = ?").all(repo.id);

  const intent = db
    .prepare("SELECT * FROM repository_intent WHERE repository_id = ?")
    .get(repo.id) as any;

  let intentDetail: any = null;
  if (intent) {
    intentDetail = {
      id: intent.id,
      purpose: intent.purpose,
      status: intent.intent_status,
      confidence: intent.confidence,
      generatedAt: intent.generated_at,
      reviewedAt: intent.reviewed_at,
      reviewedBy: intent.reviewed_by,
      inputs: db.prepare("SELECT description FROM repository_intent_input WHERE repository_intent_id = ?").all(intent.id).map((r: any) => r.description),
      outputs: db.prepare("SELECT description FROM repository_intent_output WHERE repository_intent_id = ?").all(intent.id).map((r: any) => r.description),
      successCriteria: db.prepare("SELECT description FROM repository_intent_success_criterion WHERE repository_intent_id = ?").all(intent.id).map((r: any) => r.description),
      constraints: db.prepare("SELECT description FROM repository_intent_constraint WHERE repository_intent_id = ?").all(intent.id).map((r: any) => r.description),
      risks: db.prepare("SELECT description FROM repository_intent_risk WHERE repository_intent_id = ?").all(intent.id).map((r: any) => r.description),
    };
  }

  const findings = db
    .prepare("SELECT * FROM intelligence_finding WHERE repository_id = ? ORDER BY severity DESC")
    .all(repo.id);

  res.json({
    id: repo.id,
    name: repo.name,
    slug: repo.slug,
    description: repo.description,
    purpose: repo.inferred_purpose,
    repositoryUrl: repo.repository_url,
    provider: repo.provider,
    visibility: repo.visibility,
    defaultBranch: repo.default_branch,
    lifecycle: repo.lifecycle_state,
    team: repo.team_name,
    domain: repo.domain_name,
    createdDate: repo.created_date,
    lastCommitDate: repo.last_commit_date,
    lastScanDate: repo.last_scan_date,
    activityLevel: repo.activity_level,
    healthScore: repo.health_score,
    documentationScore: repo.documentation_score,
    testScore: repo.test_score,
    intelligenceConfidence: repo.intelligence_confidence,
    technologies,
    dependsOn,
    usedBy,
    apis,
    intent: intentDetail,
    findings,
  });
});
