import { Router } from "express";
import { db } from "../db/index.js";

export const reportsRouter = Router();

reportsRouter.get("/portfolio", (_req, res) => {
  const total = (db.prepare("SELECT COUNT(*) c FROM repository").get() as any).c;
  const byProvider = db.prepare("SELECT provider, COUNT(*) c FROM repository GROUP BY provider").all();
  const byTeam = db
    .prepare(
      `SELECT COALESCE(t.name, 'Unassigned') as team, COUNT(*) c FROM repository r
       LEFT JOIN team t ON t.id = r.team_id GROUP BY team ORDER BY c DESC`
    )
    .all();
  res.json({ total, byProvider, byTeam });
});

reportsRouter.get("/technology-landscape", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT tech.name, tech.category, tech.lifecycle_status, COUNT(*) as repo_count
       FROM repository_technology rt JOIN technology tech ON tech.id = rt.technology_id
       GROUP BY tech.id ORDER BY repo_count DESC`
    )
    .all();
  res.json({ technologies: rows });
});

reportsRouter.get("/lifecycle", (_req, res) => {
  const rows = db
    .prepare("SELECT lifecycle_state, COUNT(*) c FROM repository GROUP BY lifecycle_state ORDER BY c DESC")
    .all();
  res.json({ lifecycle: rows });
});

reportsRouter.get("/ownership-gaps", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, name, slug, provider, lifecycle_state, last_commit_date
       FROM repository WHERE team_id IS NULL ORDER BY last_commit_date ASC`
    )
    .all();
  res.json({ unowned: rows });
});

reportsRouter.get("/archive-candidates", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, name, slug, provider, last_commit_date, health_score, documentation_score
       FROM repository WHERE lifecycle_state = 'Archive Candidate' ORDER BY last_commit_date ASC`
    )
    .all();
  res.json({ candidates: rows });
});

reportsRouter.get("/health", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, name, slug, health_score, documentation_score, test_score
       FROM repository ORDER BY health_score ASC LIMIT 15`
    )
    .all();
  const avg = db
    .prepare("SELECT AVG(health_score) as avgHealth, AVG(documentation_score) as avgDocs, AVG(test_score) as avgTests FROM repository")
    .get();
  res.json({ lowestHealth: rows, averages: avg });
});

reportsRouter.get("/domain-coverage", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT bd.name, COUNT(r.id) as repo_count,
        SUM(CASE WHEN r.team_id IS NOT NULL THEN 1 ELSE 0 END) as owned_count
       FROM business_domain bd LEFT JOIN repository r ON r.business_domain_id = bd.id
       GROUP BY bd.id ORDER BY repo_count DESC`
    )
    .all();
  res.json({ domains: rows });
});

reportsRouter.get("/intent-coverage", (_req, res) => {
  const total = (db.prepare("SELECT COUNT(*) c FROM repository").get() as any).c;
  const withIntent = (db.prepare("SELECT COUNT(*) c FROM repository_intent").get() as any).c;
  const byStatus = db
    .prepare("SELECT intent_status, COUNT(*) c FROM repository_intent GROUP BY intent_status")
    .all();
  const avgConfidence = (
    db.prepare("SELECT AVG(confidence) as avg FROM repository_intent").get() as any
  ).avg;
  res.json({ total, withIntent, withoutIntent: total - withIntent, byStatus, avgConfidence });
});
