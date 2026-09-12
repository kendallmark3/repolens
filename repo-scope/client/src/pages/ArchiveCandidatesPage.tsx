import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card, PageHeader, HealthBar, Loading, EmptyState } from "../components/ui";

export function ArchiveCandidatesPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reportsArchiveCandidates>> | null>(null);

  useEffect(() => {
    api.reportsArchiveCandidates().then(setData);
  }, []);

  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Archive Candidates"
        subtitle="Repositories Repo Scope recommends reviewing for archival. Recommendations only — Repo Scope never archives or deletes a repository automatically."
      />

      {data.candidates.length === 0 ? (
        <EmptyState title="No archive candidates" description="Nothing in the current inventory meets the archive-candidate criteria." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {data.candidates.map((c) => (
            <Card key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <Link to={`/repositories/${c.id}`} style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-accent)" }}>
                    {c.name}
                  </Link>
                  <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                    {c.provider} · Last commit {new Date(c.last_commit_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "14px", maxWidth: "420px" }}>
                <HealthBar label="Health" score={c.health_score} />
                <HealthBar label="Documentation" score={c.documentation_score} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: "24px",
          padding: "14px 18px",
          background: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
          color: "var(--color-text-secondary)",
        }}
      >
        Triggers considered: no commits for 24+ months, no owning team, explicitly legacy lifecycle, very low activity, or
        overlapping capability with another active repository.
      </div>
    </div>
  );
}
