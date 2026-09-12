import { Router } from "express";
import { db } from "../db/index.js";

export const intelligenceRouter = Router();

intelligenceRouter.get("/", (req, res) => {
  const category = req.query.category as string | undefined;

  let sql = `
    SELECT f.*, r.name as repo_name, r.slug as repo_slug
    FROM intelligence_finding f
    LEFT JOIN repository r ON r.id = f.repository_id
  `;
  const params: any = {};
  if (category) {
    sql += " WHERE f.category = @category";
    params.category = category;
  }
  sql += " ORDER BY CASE f.severity WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, f.detected_at DESC";

  const findings = db.prepare(sql).all(params);

  const categoryCounts = db
    .prepare("SELECT category, COUNT(*) c FROM intelligence_finding GROUP BY category ORDER BY c DESC")
    .all();

  res.json({ findings, categoryCounts });
});
