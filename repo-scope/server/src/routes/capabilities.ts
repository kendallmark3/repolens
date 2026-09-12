import { Router } from "express";
import { db } from "../db/index.js";

export const capabilitiesRouter = Router();

/**
 * v1 capability search: simple text matching across repository metadata and
 * Repository Intent purpose/inputs/outputs. Architected so a semantic /
 * embedding-based search can be swapped in later (Phase 2 Intelligence)
 * without changing the API contract — same request/response shape.
 */
capabilitiesRouter.get("/", (req, res) => {
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) return res.json({ query: "", results: [] });

  const like = `%${q}%`;

  const rows = db
    .prepare(
      `SELECT DISTINCT
        r.id, r.name, r.slug, r.inferred_purpose, r.lifecycle_state, r.provider,
        t.name as team_name, ri.confidence as intent_confidence,
        (
          (CASE WHEN r.name LIKE @like THEN 3 ELSE 0 END) +
          (CASE WHEN r.description LIKE @like THEN 2 ELSE 0 END) +
          (CASE WHEN r.inferred_purpose LIKE @like THEN 3 ELSE 0 END) +
          (CASE WHEN ri.purpose LIKE @like THEN 3 ELSE 0 END) +
          (CASE WHEN EXISTS (SELECT 1 FROM repository_intent_input rii WHERE rii.repository_intent_id = ri.id AND rii.description LIKE @like) THEN 2 ELSE 0 END) +
          (CASE WHEN EXISTS (SELECT 1 FROM repository_intent_output rio WHERE rio.repository_intent_id = ri.id AND rio.description LIKE @like) THEN 2 ELSE 0 END)
        ) as relevance_raw
       FROM repository r
       LEFT JOIN team t ON t.id = r.team_id
       LEFT JOIN repository_intent ri ON ri.repository_id = r.id
       WHERE
        r.name LIKE @like OR r.description LIKE @like OR r.inferred_purpose LIKE @like
        OR ri.purpose LIKE @like
        OR EXISTS (SELECT 1 FROM repository_intent_input rii WHERE rii.repository_intent_id = ri.id AND rii.description LIKE @like)
        OR EXISTS (SELECT 1 FROM repository_intent_output rio WHERE rio.repository_intent_id = ri.id AND rio.description LIKE @like)
       ORDER BY relevance_raw DESC
       LIMIT 25`
    )
    .all({ like }) as any[];

  const maxRaw = Math.max(1, ...rows.map((r) => r.relevance_raw));

  const techByRepo = new Map<string, string[]>();
  const techRows = db
    .prepare(
      `SELECT rt.repository_id, tech.name FROM repository_technology rt JOIN technology tech ON tech.id = rt.technology_id`
    )
    .all() as { repository_id: string; name: string }[];
  for (const t of techRows) {
    if (!techByRepo.has(t.repository_id)) techByRepo.set(t.repository_id, []);
    techByRepo.get(t.repository_id)!.push(t.name);
  }

  res.json({
    query: q,
    results: rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      purpose: r.inferred_purpose,
      lifecycle: r.lifecycle_state,
      provider: r.provider,
      owner: r.team_name,
      technologies: techByRepo.get(r.id) ?? [],
      intentConfidence: r.intent_confidence,
      relevance: Math.round((r.relevance_raw / maxRaw) * 100),
    })),
  });
});
