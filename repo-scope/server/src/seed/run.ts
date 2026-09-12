import { randomUUID } from "node:crypto";
import { db, initSchema, isSeeded } from "../db/index.js";
import { TEAMS, DOMAINS, TECHNOLOGIES } from "./reference-data.js";
import { REPOSITORIES } from "./repositories.js";
import { DEPENDENCIES } from "./dependencies.js";
import { INTENTS } from "./intents.js";

function isoMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
}

function isoYearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString();
}

function run() {
  initSchema();

  if (isSeeded()) {
    console.log("Database already seeded. Skipping. (Delete server/data/repo-scope.db to reseed.)");
    return;
  }

  const insertTeam = db.prepare(
    "INSERT INTO team (id, name, description, business_unit) VALUES (@id, @name, @description, @businessUnit)"
  );
  const insertDomain = db.prepare(
    "INSERT INTO business_domain (id, name, description) VALUES (@id, @name, @description)"
  );
  const insertTech = db.prepare(
    "INSERT INTO technology (id, name, category, lifecycle_status) VALUES (@id, @name, @category, @lifecycleStatus)"
  );
  const insertRepo = db.prepare(`
    INSERT INTO repository (
      id, external_repository_id, name, slug, description, inferred_purpose,
      repository_url, provider, visibility, default_branch, lifecycle_state,
      team_id, business_domain_id, created_date, last_commit_date, last_scan_date,
      archive_candidate_date, archived_date, activity_level, health_score,
      documentation_score, test_score, intelligence_confidence
    ) VALUES (
      @id, @externalId, @name, @slug, @description, @inferredPurpose,
      @repositoryUrl, @provider, @visibility, @defaultBranch, @lifecycleState,
      @teamId, @domainId, @createdDate, @lastCommitDate, @lastScanDate,
      @archiveCandidateDate, @archivedDate, @activityLevel, @healthScore,
      @documentationScore, @testScore, @intelligenceConfidence
    )
  `);
  const insertRepoTech = db.prepare(
    "INSERT INTO repository_technology (repository_id, technology_id) VALUES (?, ?)"
  );
  const insertApi = db.prepare(`
    INSERT INTO api (id, repository_id, name, protocol, version, endpoint_count, specification_type)
    VALUES (@id, @repositoryId, @name, @protocol, @version, @endpointCount, @specificationType)
  `);
  const insertDependency = db.prepare(`
    INSERT INTO repository_dependency (id, source_repository_id, target_repository_id, dependency_type, confidence)
    VALUES (@id, @sourceId, @targetId, @dependencyType, @confidence)
  `);
  const insertIntent = db.prepare(`
    INSERT INTO repository_intent (id, repository_id, purpose, intent_status, confidence, generated_at, reviewed_at, reviewed_by, version)
    VALUES (@id, @repositoryId, @purpose, @intentStatus, @confidence, @generatedAt, @reviewedAt, @reviewedBy, @version)
  `);
  const insertIntentInput = db.prepare(
    "INSERT INTO repository_intent_input (id, repository_intent_id, description) VALUES (?, ?, ?)"
  );
  const insertIntentOutput = db.prepare(
    "INSERT INTO repository_intent_output (id, repository_intent_id, description) VALUES (?, ?, ?)"
  );
  const insertIntentSuccess = db.prepare(
    "INSERT INTO repository_intent_success_criterion (id, repository_intent_id, description) VALUES (?, ?, ?)"
  );
  const insertIntentConstraint = db.prepare(
    "INSERT INTO repository_intent_constraint (id, repository_intent_id, description) VALUES (?, ?, ?)"
  );
  const insertIntentRisk = db.prepare(
    "INSERT INTO repository_intent_risk (id, repository_intent_id, description) VALUES (?, ?, ?)"
  );
  const insertFinding = db.prepare(`
    INSERT INTO intelligence_finding (id, repository_id, category, severity, title, description, confidence, detected_at, status)
    VALUES (@id, @repositoryId, @category, @severity, @title, @description, @confidence, @detectedAt, @status)
  `);
  const insertScan = db.prepare(`
    INSERT INTO repository_scan (id, repository_id, provider, started_at, completed_at, status, files_examined, findings_count, repositories_discovered, intents_created)
    VALUES (@id, @repositoryId, @provider, @startedAt, @completedAt, @status, @filesExamined, @findingsCount, @repositoriesDiscovered, @intentsCreated)
  `);

  const seedAll = db.transaction(() => {
    for (const t of TEAMS) insertTeam.run(t);
    for (const d of DOMAINS) insertDomain.run(d);
    for (const t of TECHNOLOGIES) insertTech.run(t);

    const slugToId = new Map<string, string>();

    for (const repo of REPOSITORIES) {
      const id = randomUUID();
      slugToId.set(repo.slug, id);

      insertRepo.run({
        id,
        externalId: `ext-${repo.slug}`,
        name: repo.name,
        slug: repo.slug,
        description: repo.description,
        inferredPurpose: repo.inferredPurpose,
        repositoryUrl: `https://${repo.provider === "azure-devops" ? "dev.azure.com" : repo.provider + ".com"}/enterprise/${repo.slug}`,
        provider: repo.provider,
        visibility: repo.visibility,
        defaultBranch: "main",
        lifecycleState: repo.lifecycle,
        teamId: repo.team,
        domainId: repo.domain,
        createdDate: isoYearsAgo(repo.ageYears),
        lastCommitDate: isoMonthsAgo(repo.monthsSinceLastCommit),
        lastScanDate: isoMonthsAgo(0),
        archiveCandidateDate:
          repo.lifecycle === "Archive Candidate" ? isoMonthsAgo(1) : null,
        archivedDate: repo.lifecycle === "Archived" ? isoMonthsAgo(1) : null,
        activityLevel: repo.activityLevel,
        healthScore: repo.healthScore,
        documentationScore: repo.documentationScore,
        testScore: repo.testScore,
        intelligenceConfidence: repo.intelligenceConfidence,
      });

      for (const techId of repo.technologies) {
        insertRepoTech.run(id, techId);
      }

      for (const api of repo.apis ?? []) {
        insertApi.run({
          id: randomUUID(),
          repositoryId: id,
          name: api.name,
          protocol: api.protocol,
          version: "v1",
          endpointCount: api.endpointCount,
          specificationType: "OpenAPI",
        });
      }
    }

    // Dependencies
    for (const dep of DEPENDENCIES) {
      const sourceId = slugToId.get(dep.source);
      const targetId = slugToId.get(dep.target);
      if (!sourceId || !targetId) continue;
      insertDependency.run({
        id: randomUUID(),
        sourceId,
        targetId,
        dependencyType: dep.type,
        confidence: 75 + Math.floor(Math.random() * 20),
      });
    }

    // Repository Intents
    for (const repo of REPOSITORIES) {
      if (!repo.hasIntent) continue;
      const repoId = slugToId.get(repo.slug)!;
      const intentDef = INTENTS[repo.slug];
      const intentId = randomUUID();

      insertIntent.run({
        id: intentId,
        repositoryId: repoId,
        purpose: intentDef?.purpose ?? repo.inferredPurpose,
        intentStatus: intentDef ? "Reviewed" : "Draft",
        confidence: repo.intelligenceConfidence,
        generatedAt: isoMonthsAgo(0),
        reviewedAt: intentDef ? isoMonthsAgo(1) : null,
        reviewedBy: intentDef ? "Repo Scope Discovery" : null,
        version: 1,
      });

      if (intentDef) {
        for (const desc of intentDef.inputs) insertIntentInput.run(randomUUID(), intentId, desc);
        for (const desc of intentDef.outputs) insertIntentOutput.run(randomUUID(), intentId, desc);
        for (const desc of intentDef.successCriteria) insertIntentSuccess.run(randomUUID(), intentId, desc);
        for (const desc of intentDef.constraints) insertIntentConstraint.run(randomUUID(), intentId, desc);
        for (const desc of intentDef.risks) insertIntentRisk.run(randomUUID(), intentId, desc);
      }
    }

    // Intelligence findings — generated heuristically from repo attributes
    for (const repo of REPOSITORIES) {
      const repoId = slugToId.get(repo.slug)!;

      if (!repo.team) {
        insertFinding.run({
          id: randomUUID(), repositoryId: repoId, category: "Ownership Gap", severity: "high",
          title: "No owning team identified",
          description: `${repo.name} has no associated team. Ownership should be established or the repository should be reviewed for archival.`,
          confidence: 90, detectedAt: isoMonthsAgo(0), status: "open",
        });
      }
      if (repo.documentationScore < 40) {
        insertFinding.run({
          id: randomUUID(), repositoryId: repoId, category: "Documentation Quality", severity: "medium",
          title: "Weak or missing documentation",
          description: `${repo.name} has a documentation score of ${repo.documentationScore}/100. Consider a README and architecture overview.`,
          confidence: 85, detectedAt: isoMonthsAgo(0), status: "open",
        });
      }
      if (repo.lifecycle === "Dormant" || repo.lifecycle === "Archive Candidate") {
        insertFinding.run({
          id: randomUUID(), repositoryId: repoId, category: "Dormant Repository", severity: repo.lifecycle === "Archive Candidate" ? "high" : "medium",
          title: repo.lifecycle === "Archive Candidate" ? "Archive candidate" : "Dormant repository",
          description: `${repo.name} has had no commits in ${repo.monthsSinceLastCommit} months and shows ${repo.activityLevel.toLowerCase()} activity.`,
          confidence: 88, detectedAt: isoMonthsAgo(0), status: "open",
        });
      }
      if (repo.technologies.some((t) => ["tech-angularjs", "tech-jquery", "tech-struts", "tech-cobol", "tech-oracle-db"].includes(t))) {
        insertFinding.run({
          id: randomUUID(), repositoryId: repoId, category: "Legacy Technology", severity: "medium",
          title: "Legacy or deprecated technology in use",
          description: `${repo.name} depends on one or more deprecated or legacy technologies that may carry security or maintainability risk.`,
          confidence: 92, detectedAt: isoMonthsAgo(0), status: "open",
        });
      }
      if (!repo.hasIntent) {
        insertFinding.run({
          id: randomUUID(), repositoryId: repoId, category: "Missing Intent", severity: "low",
          title: "Repository Intent not yet established",
          description: `${repo.name} does not yet have a reviewed Repository Intent record.`,
          confidence: 100, detectedAt: isoMonthsAgo(0), status: "open",
        });
      }
      if (repo.intelligenceConfidence < 55) {
        insertFinding.run({
          id: randomUUID(), repositoryId: repoId, category: "Low Confidence Classification", severity: "low",
          title: "Low-confidence repository classification",
          description: `${repo.name}'s purpose and lifecycle classification carries low confidence (${repo.intelligenceConfidence}%). Manual review recommended.`,
          confidence: repo.intelligenceConfidence, detectedAt: isoMonthsAgo(0), status: "open",
        });
      }
    }

    // Duplicate capability findings (hand-identified overlapping pairs)
    const duplicatePairs: [string, string, string][] = [
      ["notification-service", "email-alert-dispatcher-v1", "Both repositories provide customer email notification capability."],
      ["payment-gateway-service", "legacy-payment-processor", "Both repositories process merchant payment authorizations."],
      ["customer-web-portal", "legacy-customer-portal", "Both repositories serve customer account management web experiences."],
      ["campaign-management-service", "legacy-marketing-automation-tool", "Both repositories automate marketing campaign delivery."],
      ["ci-cd-pipeline-templates", "legacy-jenkins-pipeline-scripts", "Both repositories provide CI/CD pipeline definitions for engineering teams."],
    ];
    for (const [slugA, slugB, desc] of duplicatePairs) {
      const idA = slugToId.get(slugA);
      const idB = slugToId.get(slugB);
      if (!idA || !idB) continue;
      insertFinding.run({
        id: randomUUID(), repositoryId: idA, category: "Duplicate Capability", severity: "medium",
        title: `Possible duplicate capability with ${slugB}`,
        description: desc, confidence: 78, detectedAt: isoMonthsAgo(0), status: "open",
      });
      insertFinding.run({
        id: randomUUID(), repositoryId: idB, category: "Duplicate Capability", severity: "medium",
        title: `Possible duplicate capability with ${slugA}`,
        description: desc, confidence: 78, detectedAt: isoMonthsAgo(0), status: "open",
      });
    }

    // Scan history — a handful of prior discovery runs
    const scanRuns = [
      { daysAgo: 30, repos: REPOSITORIES.length - 8, findings: 40, intents: 25, duration: 142 },
      { daysAgo: 21, repos: REPOSITORIES.length - 3, findings: 55, intents: 30, duration: 138 },
      { daysAgo: 14, repos: REPOSITORIES.length - 1, findings: 61, intents: 34, duration: 129 },
      { daysAgo: 7, repos: REPOSITORIES.length, findings: 68, intents: 38, duration: 121 },
    ];
    for (const run of scanRuns) {
      const started = new Date();
      started.setDate(started.getDate() - run.daysAgo);
      const completed = new Date(started.getTime() + run.duration * 1000);
      insertScan.run({
        id: randomUUID(),
        repositoryId: null,
        provider: "simulated",
        startedAt: started.toISOString(),
        completedAt: completed.toISOString(),
        status: "completed",
        filesExamined: run.repos * 340,
        findingsCount: run.findings,
        repositoriesDiscovered: run.repos,
        intentsCreated: run.intents,
      });
    }
  });

  seedAll();

  console.log(`Seeded ${REPOSITORIES.length} repositories, ${TEAMS.length} teams, ${DOMAINS.length} domains, ${TECHNOLOGIES.length} technologies, ${DEPENDENCIES.length} dependencies.`);
}

run();
