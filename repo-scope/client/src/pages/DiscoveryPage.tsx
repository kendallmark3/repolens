import { useEffect, useState } from "react";
import { api, type AdapterDescriptor, type ScanRecord } from "../lib/api";
import { Card, PageHeader, Loading } from "../components/ui";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "simulated-active": { bg: "#e6f4ea", text: "#1e8e3e" },
  "adapter-available": { bg: "#e8f0fe", text: "#1a56db" },
  "not-configured": { bg: "#f1f1f3", text: "#6e6e73" },
};

export function DiscoveryPage() {
  const [adapters, setAdapters] = useState<AdapterDescriptor[] | null>(null);
  const [scans, setScans] = useState<ScanRecord[] | null>(null);
  const [running, setRunning] = useState(false);
  const [stageIndex, setStageIndex] = useState(-1);
  const [stages, setStages] = useState<string[]>([]);
  const [result, setResult] = useState<{ repositoriesDiscovered: number; findingsCount: number; intentsCount: number } | null>(null);

  const loadAll = () => {
    api.discoveryAdapters().then(setAdapters);
    api.discoveryScans().then(setScans);
  };

  useEffect(() => {
    loadAll();
    api.discoveryStages().then(setStages);
  }, []);

  const runDiscovery = async () => {
    setRunning(true);
    setResult(null);
    setStageIndex(0);

    const localStages = stages.length ? stages : await api.discoveryStages();
    for (let i = 0; i < localStages.length - 1; i++) {
      await new Promise((r) => setTimeout(r, 380));
      setStageIndex(i + 1);
    }

    const res = await api.discoveryRun();
    setResult(res);
    setStageIndex(localStages.length - 1);
    setRunning(false);
    loadAll();
  };

  return (
    <div>
      <PageHeader
        title="Discovery"
        subtitle="Connect repository providers and run discovery to refresh the enterprise repository registry."
        actions={
          <button
            onClick={runDiscovery}
            disabled={running}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: running ? "var(--color-neutral-bg)" : "var(--color-accent)",
              color: running ? "var(--color-text-secondary)" : "white",
              fontWeight: 600,
              fontSize: "14px",
              cursor: running ? "default" : "pointer",
            }}
          >
            {running ? "Running…" : "Run Discovery"}
          </button>
        }
      />

      {(running || result) && (
        <Card style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>
            {result ? "Discovery Complete" : "Discovery In Progress"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {stages.map((stage, i) => (
              <div key={stage} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: i <= stageIndex ? "var(--color-accent)" : "var(--color-neutral-bg)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "10px",
                    flexShrink: 0,
                  }}
                >
                  {i < stageIndex || result ? "✓" : ""}
                </span>
                <span style={{ color: i <= stageIndex ? "var(--color-text)" : "var(--color-text-tertiary)" }}>{stage}</span>
              </div>
            ))}
          </div>
          {result && (
            <div style={{ display: "flex", gap: "24px", marginTop: "18px", paddingTop: "16px", borderTop: "1px solid var(--color-border-subtle)" }}>
              <ResultStat label="Repositories" value={result.repositoriesDiscovered} />
              <ResultStat label="Findings" value={result.findingsCount} />
              <ResultStat label="Intents" value={result.intentsCount} />
            </div>
          )}
        </Card>
      )}

      {!adapters ? (
        <Loading />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {adapters.map((a) => {
            const colors = STATUS_COLORS[a.status];
            return (
              <Card key={a.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{a.displayName}</div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: "999px",
                      background: colors.bg,
                      color: colors.text,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.statusLabel}
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{a.description}</div>
              </Card>
            );
          })}
        </div>
      )}

      <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "14px" }}>Scan History</div>
      {!scans ? (
        <Loading />
      ) : (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Provider</th>
                <th style={thStyle}>Repositories</th>
                <th style={thStyle}>Findings</th>
                <th style={thStyle}>Intents Created</th>
                <th style={thStyle}>Duration</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => {
                const durationSec = s.completed_at
                  ? Math.round((new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 1000)
                  : null;
                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <td style={tdStyle}>{new Date(s.started_at).toLocaleString()}</td>
                    <td style={tdStyle}>{s.provider}</td>
                    <td style={tdStyle}>{s.repositories_discovered}</td>
                    <td style={tdStyle}>{s.findings_count}</td>
                    <td style={tdStyle}>{s.intents_created}</td>
                    <td style={tdStyle}>{durationSec !== null ? `${durationSec}s` : "—"}</td>
                    <td style={tdStyle}>
                      <span style={{ color: "var(--color-success)", fontWeight: 600 }}>{s.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 700 }}>{value}</div>
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
