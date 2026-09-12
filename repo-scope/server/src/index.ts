import express from "express";
import cors from "cors";
import { initSchema } from "./db/index.js";
import { repositoriesRouter } from "./routes/repositories.js";
import { overviewRouter } from "./routes/overview.js";
import { capabilitiesRouter } from "./routes/capabilities.js";
import { intelligenceRouter } from "./routes/intelligence.js";
import { dependenciesRouter } from "./routes/dependencies.js";
import { discoveryRouter } from "./routes/discovery.js";
import { reportsRouter } from "./routes/reports.js";
import { ADAPTER_REGISTRY } from "./adapters/registry.js";

initSchema();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/repositories", repositoriesRouter);
app.use("/api/overview", overviewRouter);
app.use("/api/capabilities", capabilitiesRouter);
app.use("/api/intelligence", intelligenceRouter);
app.use("/api/dependencies", dependenciesRouter);
app.use("/api/discovery", discoveryRouter);
app.use("/api/reports", reportsRouter);

app.get("/api/adapters", (_req, res) => res.json(ADAPTER_REGISTRY));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`Repo Scope API listening on http://localhost:${PORT}`);
});
