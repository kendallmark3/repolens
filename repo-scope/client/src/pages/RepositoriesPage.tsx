import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, type RepoSummary, type Facets } from "../lib/api";
import { PageHeader, LifecycleBadge, TechBadge, Loading, EmptyState } from "../components/ui";

const inputStyle: React.CSSProperties = {
  padding: "9px 12px",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  fontSize: "14px",
  background: "var(--color-surface)",
  color: "var(--color-text)",
};

export function RepositoriesPage() {
  const [repos, setRepos] = useState<RepoSummary[] | null>(null);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    api.repositoryFacets().then(setFacets);
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      api
        .repositories({ search, ...filters, sortBy, sortDir })
        .then(setRepos);
    }, 200);
    return () => clearTimeout(handle);
  }, [search, filters, sortBy, sortDir]);

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const columns: { key: string; label: string; sortKey?: string }[] = useMemo(
    () => [
      { key: "repository", label: "Repository", sortKey: "name" },
      { key: "purpose", label: "Purpose" },
      { key: "owner", label: "Owner" },
      { key: "domain", label: "Domain" },
      { key: "technology", label: "Technology" },
      { key: "lifecycle", label: "Lifecycle", sortKey: "lifecycle" },
      { key: "lastActivity", label: "Last Activity", sortKey: "lastActivity" },
      { key: "health", label: "Health", sortKey: "health" },
      { key: "confidence", label: "Intent Confidence", sortKey: "confidence" },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Repositories"
        subtitle="Search, sort, and filter the full repository inventory across every connected provider."
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Search repositories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: "240px", flex: "1 1 240px" }}
        />
        <select style={inputStyle} value={filters.provider ?? ""} onChange={(e) => updateFilter("provider", e.target.value)}>
          <option value="">All Providers</option>
          {facets?.providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select style={inputStyle} value={filters.team ?? ""} onChange={(e) => updateFilter("team", e.target.value)}>
          <option value="">All Teams</option>
          {facets?.teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select style={inputStyle} value={filters.domain ?? ""} onChange={(e) => updateFilter("domain", e.target.value)}>
          <option value="">All Domains</option>
          {facets?.domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select style={inputStyle} value={filters.technology ?? ""} onChange={(e) => updateFilter("technology", e.target.value)}>
          <option value="">All Technologies</option>
          {facets?.technologies.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select style={inputStyle} value={filters.lifecycle ?? ""} onChange={(e) => updateFilter("lifecycle", e.target.value)}>
          <option value="">All Lifecycles</option>
          {facets?.lifecycles.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          style={inputStyle}
          value={filters.ownership ?? ""}
          onChange={(e) => updateFilter("ownership", e.target.value)}
        >
          <option value="">Any Ownership</option>
          <option value="unowned">Unowned Only</option>
        </select>
        <select
          style={inputStyle}
          value={filters.archiveCandidate ?? ""}
          onChange={(e) => updateFilter("archiveCandidate", e.target.value)}
        >
          <option value="">All Repos</option>
          <option value="true">Archive Candidates Only</option>
        </select>
      </div>

      {!repos ? (
        <Loading />
      ) : repos.length === 0 ? (
        <EmptyState title="No repositories match these filters" description="Try broadening your search or clearing a filter." />
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "var(--color-surface-subtle)", borderBottom: "1px solid var(--color-border)" }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={col.sortKey ? () => toggleSort(col.sortKey!) : undefined}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      cursor: col.sortKey ? "pointer" : "default",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.label}
                    {col.sortKey === sortBy && (sortDir === "asc" ? " ↑" : " ↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repos.map((repo) => (
                <tr key={repo.id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <Link to={`/repositories/${repo.id}`} style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                      {repo.name}
                    </Link>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)", maxWidth: "280px" }}>
                    {repo.purpose}
                  </td>
                  <td style={{ padding: "14px 16px" }}>{repo.team ?? "—"}</td>
                  <td style={{ padding: "14px 16px" }}>{repo.domain ?? "—"}</td>
                  <td style={{ padding: "14px 16px", maxWidth: "220px" }}>
                    {repo.technologies.slice(0, 3).map((t) => (
                      <TechBadge key={t} name={t} />
                    ))}
                    {repo.technologies.length > 3 && (
                      <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                        +{repo.technologies.length - 3}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <LifecycleBadge lifecycle={repo.lifecycle} />
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                    {new Date(repo.lastActivity).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>{repo.healthScore}</td>
                  <td style={{ padding: "14px 16px" }}>{repo.intentConfidence ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
