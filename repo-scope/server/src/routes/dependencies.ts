import { Router } from "express";
import { db } from "../db/index.js";

export const dependenciesRouter = Router();

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
    .all();

  const mostDependedOn = db
    .prepare(
      `SELECT r.id, r.name, r.slug, COUNT(*) as dependent_count
       FROM repository_dependency rd JOIN repository r ON r.id = rd.target_repository_id
       GROUP BY r.id ORDER BY dependent_count DESC LIMIT 10`
    )
    .all();

  res.json({ edges, mostDependedOn });
});
