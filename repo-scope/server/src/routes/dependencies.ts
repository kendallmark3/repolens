import { Router } from "express";
import { db } from "../db/index.js";

export const dependenciesRouter = Router();

// Heuristics for v1 — see intelligence_finding for the pattern this follows elsewhere in the app.
const HIGH_DEPENDENCY_THRESHOLD = 3;
const LOW_CONFIDENCE_THRESHOLD = 80;
const AT_RISK_LIFECYCLES = new Set(["Legacy", "Dormant", "Archive Candidate", "Unknown"]);
const AT_RISK_ACTIVITY = new Set(["Low", "Dormant"]);

interface DependentRow {
  id: string;
  name: string;
  slug: string;
  lifecycle_state: string;
  activity_level: string;
  dependent_count: number;
}

interface EdgeRow {
  id: string;
  dependency_type: string;
  confidence: number;
  source_id: string;
  target_id: string;
  target_lifecycle: string;
}

dependenciesRouter.get("/", (_req, res) => {
  const edges = db
    .prepare(
      `SELECT rd.id, rd.dependency_type, rd.confidence,
        rs.id as source_id, rs.name as source_name, rs.slug as source_slug, rs.lifecycle_state as source_lifecycle,
        rt.id as target_id, rt.name as target_name, rt.slug as target_slug, rt.lifecycle_state as target_lifecycle
       FROM repository_dependency rd
       JOIN repository rs ON rs.id = rd.source_repository_id
       JOIN repository rt ON rt.id = rd.target_repository_id`
    )
    .all() as EdgeRow[];

  const dependentCounts = db
    .prepare(
      `SELECT r.id, r.name, r.slug, r.lifecycle_state, r.activity_level, COUNT(*) as dependent_count
       FROM repository_dependency rd JOIN repository r ON r.id = rd.target_repository_id
       GROUP BY r.id ORDER BY dependent_count DESC`
    )
    .all() as DependentRow[];

  const withRisk = dependentCounts.map((r) => {
    const highBlastRadius = r.dependent_count >= HIGH_DEPENDENCY_THRESHOLD;
    const atRisk = highBlastRadius && (AT_RISK_LIFECYCLES.has(r.lifecycle_state) || AT_RISK_ACTIVITY.has(r.activity_level));
    return { ...r, high_blast_radius: highBlastRadius, at_risk: atRisk };
  });

  const mostDependedOn = withRisk.slice(0, 10);

  // Circular relationships: unordered pairs where A depends on B and B also depends on A.
  const circularPairs = db
    .prepare(
      `SELECT DISTINCT a.source_repository_id as a, a.target_repository_id as b
       FROM repository_dependency a
       JOIN repository_dependency b
         ON a.source_repository_id = b.target_repository_id
        AND a.target_repository_id = b.source_repository_id
       WHERE a.source_repository_id < a.target_repository_id`
    )
    .all();

  const summary = {
    highDependencyCount: withRisk.filter((r) => r.high_blast_radius).length,
    highDependencyThreshold: HIGH_DEPENDENCY_THRESHOLD,
    dependenciesOnArchiveCandidates: edges.filter((e) => e.target_lifecycle === "Archive Candidate").length,
    circularCount: circularPairs.length,
    lowConfidenceCount: edges.filter((e) => e.confidence < LOW_CONFIDENCE_THRESHOLD).length,
    lowConfidenceThreshold: LOW_CONFIDENCE_THRESHOLD,
  };

  res.json({ edges, mostDependedOn, summary });
});
