import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card, PageHeader, Loading } from "../components/ui";

const REPORT_TABS = [
  "Repository Portfolio",
  "Technology Landscape",
  "Repository Lifecycle",
  "Ownership Gaps",
  "Archive Candidates",
  "Repository Health",
  "Business Domain Coverage",
  "Repository Intent Coverage",
] as const;

export function ReportsPage() {
  const [tab, setTab] = useState<(typeof REPORT_TABS)[number]>("Repository Portfolio");

  return (
    <div>
      <PageHeader title="Reports" subtitle="Management reporting across the repository portfolio." />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
        {REPORT_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: tab === t ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
              background: tab === t ? "rgba(0,113,227,0.08)" : "var(--color-surface)",
              color: tab === t ? "var(--color-accent)" : "var(--color-text)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Repository Portfolio" && <PortfolioReport />}
      {tab === "Technology Landscape" && <TechLandscapeReport />}
      {tab === "Repository Lifecycle" && <LifecycleReport />}
      {tab === "Ownership Gaps" && <OwnershipGapsReport />}
      {tab === "Archive Candidates" && <ArchiveReport />}
      {tab === "Repository Health" && <HealthReport />}
      {tab === "Business Domain Coverage" && <DomainReport />}
      {tab === "Repository Intent Coverage" && <IntentCoverageReport />}
    </div>
  );
}

function PortfolioReport() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reportsPortfolio>> | null>(null);
  useEffect(() => {
    api.reportsPortfolio().then(setData);
  }, []);
  if (!data) return <Loading />;
  return (
    <Card>
      <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "18px" }}>{data.total} Total Repositories</div>
      <ReportTable title="By Provider" rows={data.byProvider.map((r) => [r.provider, r.c])} />
      <ReportTable title="By Team" rows={data.byTeam.map((r) => [r.team, r.c])} />
    </Card>
  );
}

function TechLandscapeReport() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reportsTechLandscape>> | null>(null);
  useEffect(() => {
    api.reportsTechLandscape().then(setData);
  }, []);
  if (!data) return <Loading />;
  return (
    <Card>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
            <th style={thStyle}>Technology</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Repositories</th>
          </tr>
        </thead>
        <tbody>
          {data.technologies.map((t) => (
            <tr key={t.name} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
              <td style={tdStyle}>{t.name}</td>
              <td style={tdStyle}>{t.category}</td>
              <td style={tdStyle}>
                <span style={{ color: t.lifecycle_status === "Current" ? "var(--color-success)" : "var(--color-warning)" }}>
                  {t.lifecycle_status}
                </span>
              </td>
              <td style={tdStyle}>{t.repo_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function LifecycleReport() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reportsLifecycle>> | null>(null);
  useEffect(() => {
    api.reportsLifecycle().then(setData);
  }, []);
  if (!data) return <Loading />;
  return <Card><ReportTable title="Repositories by Lifecycle State" rows={data.lifecycle.map((r) => [r.lifecycle_state, r.c])} /></Card>;
}

function OwnershipGapsReport() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reportsOwnershipGaps>> | null>(null);
  useEffect(() => {
    api.reportsOwnershipGaps().then(setData);
  }, []);
  if (!data) return <Loading />;
  return (
    <Card>
      <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "14px" }}>
        {data.unowned.length} repositories have no identified owning team.
      </div>
      {data.unowned.map((r) => (
        <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-border-subtle)" }}>
          <Link to={`/repositories/${r.id}`} style={{ color: "var(--color-accent)", fontWeight: 600 }}>
            {r.name}
          </Link>
          <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginLeft: "10px" }}>
            {r.provider} · {r.lifecycle_state}
          </span>
        </div>
      ))}
    </Card>
  );
}

function ArchiveReport() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reportsArchiveCandidates>> | null>(null);
  useEffect(() => {
    api.reportsArchiveCandidates().then(setData);
  }, []);
  if (!data) return <Loading />;
  return (
    <Card>
      <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "14px" }}>
        {data.candidates.length} repositories recommended for archival review.
      </div>
      {data.candidates.map((r) => (
        <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-border-subtle)" }}>
          <Link to={`/repositories/${r.id}`} style={{ color: "var(--color-accent)", fontWeight: 600 }}>
            {r.name}
          </Link>
          <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginLeft: "10px" }}>
            Health {r.health_score} · Docs {r.documentation_score}
          </span>
        </div>
      ))}
    </Card>
  );
}

function HealthReport() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reportsHealth>> | null>(null);
  useEffect(() => {
    api.reportsHealth().then(setData);
  }, []);
  if (!data) return <Loading />;
  return (
    <Card>
      <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
        <Avg label="Avg Health" value={data.averages.avgHealth} />
        <Avg label="Avg Documentation" value={data.averages.avgDocs} />
        <Avg label="Avg Test Coverage" value={data.averages.avgTests} />
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Lowest Health Repositories</div>
      {data.lowestHealth.map((r) => (
        <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-border-subtle)" }}>
          <Link to={`/repositories/${r.id}`} style={{ color: "var(--color-accent)", fontWeight: 600 }}>
            {r.name}
          </Link>
          <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginLeft: "10px" }}>
            Health {r.health_score} · Docs {r.documentation_score} · Tests {r.test_score}
          </span>
        </div>
      ))}
    </Card>
  );
}

function DomainReport() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reportsDomainCoverage>> | null>(null);
  useEffect(() => {
    api.reportsDomainCoverage().then(setData);
  }, []);
  if (!data) return <Loading />;
  return (
    <Card>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
            <th style={thStyle}>Domain</th>
            <th style={thStyle}>Repositories</th>
            <th style={thStyle}>Owned</th>
          </tr>
        </thead>
        <tbody>
          {data.domains.map((d) => (
            <tr key={d.name} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
              <td style={tdStyle}>{d.name}</td>
              <td style={tdStyle}>{d.repo_count}</td>
              <td style={tdStyle}>
                {d.owned_count}/{d.repo_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function IntentCoverageReport() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reportsIntentCoverage>> | null>(null);
  useEffect(() => {
    api.reportsIntentCoverage().then(setData);
  }, []);
  if (!data) return <Loading />;
  const pct = Math.round((data.withIntent / data.total) * 100);
  return (
    <Card>
      <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>{pct}% Intent Coverage</div>
      <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "18px" }}>
        {data.withIntent} of {data.total} repositories have a reviewed Repository Intent record. Average confidence:{" "}
        {Math.round(data.avgConfidence)}%.
      </div>
      <ReportTable title="By Status" rows={data.byStatus.map((s) => [s.intent_status, s.c])} />
    </Card>
  );
}

function Avg({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 700 }}>{Math.round(value)}</div>
    </div>
  );
}

function ReportTable({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>{title}</div>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border-subtle)", fontSize: "13px" }}>
          <span>{label}</span>
          <span style={{ fontWeight: 600 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  color: "var(--color-text-secondary)",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};
const tdStyle: React.CSSProperties = { padding: "10px 12px" };
