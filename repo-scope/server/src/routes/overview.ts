import { Router } from "express";
import { db } from "../db/index.js";

export const overviewRouter = Router();

overviewRouter.get("/", (_req, res) => {
  const total = (db.prepare("SELECT COUNT(*) c FROM repository").get() as any).c;

  const byLifecycle = db
    .prepare("SELECT lifecycle_state, COUNT(*) c FROM repository GROUP BY lifecycle_state")
    .all() as { lifecycle_state: string; c: number }[];
  const lifecycleMap = Object.fromEntries(byLifecycle.map((r) => [r.lifecycle_state, r.c]));

  const unknownOwnership = (
    db.prepare("SELECT COUNT(*) c FROM repository WHERE team_id IS NULL").get() as any
  ).c;

  const recentlyChanged = (
    db
      .prepare(
        "SELECT COUNT(*) c FROM repository WHERE last_commit_date >= datetime('now', '-30 days')"
      )
      .get() as any
  ).c;

  const needsReview = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT repository_id) c FROM intelligence_finding WHERE severity IN ('high','medium') AND status = 'open'`
      )
      .get() as any
  ).c;

  const byTechCategory = db
    .prepare(
      `SELECT tech.name, COUNT(*) c FROM repository_technology rt
       JOIN technology tech ON tech.id = rt.technology_id
       GROUP BY tech.name ORDER BY c DESC LIMIT 10`
    )
    .all();

  const byDomain = db
    .prepare(
      `SELECT bd.name, COUNT(*) c FROM repository r
       LEFT JOIN business_domain bd ON bd.id = r.business_domain_id
       GROUP BY bd.name ORDER BY c DESC`
    )
    .all();

  const byActivity = db
    .prepare("SELECT activity_level, COUNT(*) c FROM repository GROUP BY activity_level")
    .all();

  const ageDistribution = db
    .prepare(
      `SELECT
        CASE
          WHEN (julianday('now') - julianday(created_date)) / 365 < 1 THEN '0-1 yrs'
          WHEN (julianday('now') - julianday(created_date)) / 365 < 3 THEN '1-3 yrs'
          WHEN (julianday('now') - julianday(created_date)) / 365 < 6 THEN '3-6 yrs'
          ELSE '6+ yrs'
        END as bucket,
        COUNT(*) c
       FROM repository GROUP BY bucket`
    )
    .all();

  const ownershipCoverage = {
    owned: total - unknownOwnership,
    unowned: unknownOwnership,
  };

  res.json({
    total,
    active: lifecycleMap["Active"] ?? 0,
    maintenance: lifecycleMap["Maintenance"] ?? 0,
    legacy: lifecycleMap["Legacy"] ?? 0,
    dormant: lifecycleMap["Dormant"] ?? 0,
    archiveCandidates: lifecycleMap["Archive Candidate"] ?? 0,
    unknownOwnership,
    recentlyChanged,
    needsReview,
    charts: {
      lifecycle: byLifecycle.map((r) => ({ name: r.lifecycle_state, value: r.c })),
      technology: byTechCategory.map((r: any) => ({ name: r.name, value: r.c })),
      domain: byDomain.map((r: any) => ({ name: r.name ?? "Unassigned", value: r.c })),
      age: ageDistribution.map((r: any) => ({ name: r.bucket, value: r.c })),
      activity: byActivity.map((r: any) => ({ name: r.activity_level, value: r.c })),
      ownershipCoverage,
    },
  });
});
