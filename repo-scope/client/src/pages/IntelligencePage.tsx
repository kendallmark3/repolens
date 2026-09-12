import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Finding } from "../lib/api";
import { Card, PageHeader, SeverityBadge, Loading, EmptyState } from "../components/ui";

export function IntelligencePage() {
  const [data, setData] = useState<{ findings: Finding[]; categoryCounts: { category: string; c: number }[] } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    api.intelligence(activeCategory ?? undefined).then(setData);
  }, [activeCategory]);

  return (
    <div>
      <PageHeader
        title="Intelligence"
        subtitle="Organization-wide findings across the repository estate. Advanced results are simulated for v1 demonstration."
      />

      {!data ? (
        <Loading />
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
            <FilterChip label="All Findings" active={activeCategory === null} onClick={() => setActiveCategory(null)} />
            {data.categoryCounts.map((c) => (
              <FilterChip
                key={c.category}
                label={`${c.category} (${c.c})`}
                active={activeCategory === c.category}
                onClick={() => setActiveCategory(c.category)}
              />
            ))}
          </div>

          {data.findings.length === 0 ? (
            <EmptyState title="No findings in this category" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.findings.map((f) => (
                <Card key={f.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 600 }}>{f.title}</div>
                      <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px", maxWidth: "560px" }}>
                        {f.description}
                      </div>
                    </div>
                    <SeverityBadge severity={f.severity} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                    <span>
                      {f.category} · {f.confidence}% confidence
                      {f.repo_name && (
                        <>
                          {" · "}
                          <Link to={`/repositories/${f.repository_id}`} style={{ color: "var(--color-accent)" }}>
                            {f.repo_name}
                          </Link>
                        </>
                      )}
                    </span>
                    <span>{new Date(f.detected_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px",
        borderRadius: "999px",
        border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
        background: active ? "rgba(0, 113, 227, 0.08)" : "var(--color-surface)",
        color: active ? "var(--color-accent)" : "var(--color-text)",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
