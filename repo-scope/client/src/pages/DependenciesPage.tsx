import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card, PageHeader, LifecycleBadge, StatTile, Loading } from "../components/ui";

export function DependenciesPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.dependencies>> | null>(null);

  useEffect(() => {
    api.dependencies().then(setData);
  }, []);

  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Dependencies"
        subtitle="Relationships discovered between repositories — what depends on what across the enterprise estate."
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
        <StatTile
          label={`High-Dependency Repos (${data.summary.highDependencyThreshold}+ dependents)`}
          value={data.summary.highDependencyCount}
        />
        <StatTile
          label="Deps on Archive Candidates"
          value={data.summary.dependenciesOnArchiveCandidates}
          tone={data.summary.dependenciesOnArchiveCandidates > 0 ? "danger" : "default"}
        />
        <StatTile
          label="Circular Relationships"
          value={data.summary.circularCount}
          tone={data.summary.circularCount > 0 ? "warning" : "default"}
        />
        <StatTile
          label={`Low-Confidence (<${data.summary.lowConfidenceThreshold}%)`}
          value={data.summary.lowConfidenceCount}
          tone={data.summary.lowConfidenceCount > 0 ? "warning" : "default"}
        />
      </div>

      <Card style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>Most Depended-On Repositories</div>
        <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "14px" }}>
          Blast radius — how many other repositories would be affected by a change or outage here.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.mostDependedOn.map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "22px", color: "var(--color-text-tertiary)", fontSize: "13px" }}>{i + 1}</span>
              <Link to={`/repositories/${r.id}`} style={{ color: "var(--color-accent)", fontWeight: 600, flex: 1 }}>
                {r.name}
              </Link>
              {r.at_risk ? (
                <RiskTag label="High blast radius · at risk" tone="danger" />
              ) : r.high_blast_radius ? (
                <RiskTag label="High blast radius" tone="warning" />
              ) : null}
              <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                {r.dependent_count} dependents
              </span>
              <div style={{ width: "160px", height: "6px", background: "var(--color-neutral-bg)", borderRadius: "4px" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(r.dependent_count / data.mostDependedOn[0].dependent_count) * 100}%`,
                    background: "var(--color-accent)",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px" }}>All Dependency Relationships</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Target</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {data.edges.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <td style={tdStyle}>
                    <Link to={`/repositories/${e.source_id}`} style={{ color: "var(--color-accent)" }}>
                      {e.source_name}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <Link to={`/repositories/${e.target_id}`} style={{ color: "var(--color-accent)" }}>
                      {e.target_name}
                    </Link>
                    {" "}
                    <LifecycleBadge lifecycle={e.target_lifecycle} />
                  </td>
                  <td style={tdStyle}>{e.dependency_type}</td>
                  <td
                    style={{
                      ...tdStyle,
                      color: e.confidence < data.summary.lowConfidenceThreshold ? "var(--color-warning)" : undefined,
                      fontWeight: e.confidence < data.summary.lowConfidenceThreshold ? 600 : undefined,
                    }}
                  >
                    {e.confidence}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function RiskTag({ label, tone }: { label: string; tone: "warning" | "danger" }) {
  const colors = tone === "danger" ? { bg: "#fce8e6", text: "#c5221f" } : { bg: "#fef3e2", text: "#b45309" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        background: colors.bg,
        color: colors.text,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
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
