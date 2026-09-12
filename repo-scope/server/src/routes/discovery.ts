import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "../db/index.js";
import { ADAPTER_REGISTRY } from "../adapters/registry.js";
import { SimulatedProvider } from "../adapters/SimulatedProvider.js";

export const discoveryRouter = Router();

const DISCOVERY_STAGES = [
  "Connecting to repository provider",
  "Enumerating repositories",
  "Reading metadata",
  "Detecting technologies",
  "Discovering dependencies",
  "Updating repository registry",
  "Creating repository intent candidates",
  "Generating findings",
  "Discovery complete",
];

discoveryRouter.get("/adapters", (_req, res) => {
  res.json(ADAPTER_REGISTRY);
});

discoveryRouter.get("/stages", (_req, res) => {
  res.json(DISCOVERY_STAGES);
});

/**
 * Runs a simulated discovery scan against the local SimulatedProvider.
 * This performs read-only queries against already-seeded data and records
 * a new scan history entry — it never writes/creates/deletes repositories,
 * consistent with the read-only security model for v1.
 */
discoveryRouter.post("/run", async (_req, res) => {
  const provider = new SimulatedProvider();
  const startedAt = new Date();

  const repos = await provider.listRepositories();

  const findingsCount = (
    db.prepare("SELECT COUNT(*) c FROM intelligence_finding").get() as any
  ).c;
  const intentsCount = (
    db.prepare("SELECT COUNT(*) c FROM repository_intent").get() as any
  ).c;

  const completedAt = new Date(startedAt.getTime() + 1200 + Math.floor(Math.random() * 800));

  db.prepare(
    `INSERT INTO repository_scan (id, repository_id, provider, started_at, completed_at, status, files_examined, findings_count, repositories_discovered, intents_created)
     VALUES (@id, NULL, @provider, @startedAt, @completedAt, @status, @filesExamined, @findingsCount, @repositoriesDiscovered, @intentsCreated)`
  ).run({
    id: randomUUID(),
    provider: provider.providerName,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    status: "completed",
    filesExamined: repos.length * 340,
    findingsCount,
    repositoriesDiscovered: repos.length,
    intentsCreated: intentsCount,
  });

  res.json({
    stages: DISCOVERY_STAGES,
    repositoriesDiscovered: repos.length,
    findingsCount,
    intentsCount,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
  });
});

discoveryRouter.get("/scans", (_req, res) => {
  const scans = db
    .prepare("SELECT * FROM repository_scan ORDER BY started_at DESC")
    .all();
  res.json(scans);
});
