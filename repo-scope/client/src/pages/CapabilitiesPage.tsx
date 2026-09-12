import { useState } from "react";
import { Link } from "react-router-dom";
import { api, type CapabilityResult } from "../lib/api";
import { Card, PageHeader, LifecycleBadge, TechBadge, EmptyState, Loading } from "../components/ui";

export function CapabilitiesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CapabilityResult[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await api.capabilities(q);
    setResults(res.results);
    setLoading(false);
  };

  return (
    <div>
      <PageHeader
        title="Find Existing Capability"
        subtitle="Before building something new, discover what the enterprise already owns."
      />

      <Card style={{ marginBottom: "24px" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search for a capability, e.g. "customer notifications"'
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid var(--color-border)",
              fontSize: "15px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px 22px",
              borderRadius: "10px",
              border: "none",
              background: "var(--color-accent)",
              color: "white",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
        <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
          v1 uses text matching across repository metadata and Repository Intent. Semantic capability search is planned
          for a future intelligence phase.
        </div>
      </Card>

      {loading && <Loading />}

      {!loading && searched && results && results.length === 0 && (
        <EmptyState title="No matching capability found" description="Try a different phrase, or this may be a genuinely new capability worth building." />
      )}

      {!loading && results && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {results.map((r) => (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <Link to={`/repositories/${r.id}`} style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-accent)" }}>
                    {r.name}
                  </Link>
                  <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px", maxWidth: "560px" }}>
                    {r.purpose}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Relevance</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-accent)" }}>{r.relevance}%</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" }}>
                <div style={{ display: "flex", gap: "18px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  <span>Owner: {r.owner ?? "Unassigned"}</span>
                  <span>Intent Confidence: {r.intentConfidence ?? "—"}%</span>
                </div>
                <LifecycleBadge lifecycle={r.lifecycle} />
              </div>
              <div style={{ marginTop: "10px" }}>
                {r.technologies.map((t) => (
                  <TechBadge key={t} name={t} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
