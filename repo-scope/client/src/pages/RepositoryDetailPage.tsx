import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type RepoDetail } from "../lib/api";
import { Card, LifecycleBadge, TechBadge, SeverityBadge, HealthBar, Loading, EmptyState } from "../components/ui";

export function RepositoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<RepoDetail | null>(null);

  useEffect(() => {
    if (id) api.repository(id).then(setRepo);
  }, [id]);

  if (!repo) return <Loading />;

  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <Link to="/repositories" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
          ← Back to Repositories
        </Link>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 600, margin: 0 }}>{repo.name}</h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "6px", maxWidth: "640px" }}>{repo.description}</p>
        </div>
        <LifecycleBadge lifecycle={repo.lifecycle} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginTop: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Overview */}
          <Card>
            <SectionTitle>Overview</SectionTitle>
            <DetailGrid
              rows={[
                ["Purpose", repo.purpose],
                ["Team", repo.team ?? "Unassigned"],
                ["Domain", repo.domain ?? "Unassigned"],
                ["Provider", repo.provider],
                ["Visibility", repo.visibility],
                ["Default Branch", repo.defaultBranch],
                ["Created", new Date(repo.createdDate).toLocaleDateString()],
                ["Last Commit", new Date(repo.lastCommitDate).toLocaleDateString()],
                ["Last Scanned", new Date(repo.lastScanDate).toLocaleDateString()],
              ]}
            />
          </Card>

          {/* Repository Intent */}
          <Card>
            <SectionTitle>
              Repository Intent
              <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-tertiary)", marginLeft: "10px" }}>
                (inferred — {repo.intent ? `${repo.intent.confidence}% confidence` : "not yet established"})
              </span>
            </SectionTitle>
            {repo.intent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <IntentField label="Purpose" value={repo.intent.purpose} />
                <IntentListField label="Inputs" items={repo.intent.inputs} />
                <IntentListField label="Outputs" items={repo.intent.outputs} />
                <IntentListField label="Success Criteria" items={repo.intent.successCriteria} />
                <IntentListField label="Constraints" items={repo.intent.constraints} />
                <IntentListField label="Observed Risks" items={repo.intent.risks} tone="warning" />
                <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                  Status: {repo.intent.status}
                  {repo.intent.reviewedBy && ` · Reviewed by ${repo.intent.reviewedBy}`}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Repository Intent on file yet"
                description="This repository has not yet been reviewed by Repo Scope discovery. Run a discovery scan to generate a candidate intent."
              />
            )}
          </Card>

          {/* Findings */}
          <Card>
            <SectionTitle>Findings</SectionTitle>
            {repo.findings.length === 0 ? (
              <EmptyState title="No findings" description="Repo Scope has not flagged any issues for this repository." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {repo.findings.map((f) => (
                  <div key={f.id} style={{ borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>{f.title}</span>
                      <SeverityBadge severity={f.severity} />
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{f.description}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                      {f.category} · {f.confidence}% confidence
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Technology */}
          <Card>
            <SectionTitle>Technology</SectionTitle>
            <div>
              {repo.technologies.length ? (
                repo.technologies.map((t: any) => <TechBadge key={t.name} name={t.name} />)
              ) : (
                <span style={{ color: "var(--color-text-tertiary)", fontSize: "13px" }}>None detected</span>
              )}
            </div>
          </Card>

          {/* Health */}
          <Card>
            <SectionTitle>Health</SectionTitle>
            <HealthBar label="Overall Health" score={repo.healthScore} />
            <HealthBar label="Documentation" score={repo.documentationScore} />
            <HealthBar label="Test Coverage" score={repo.testScore} />
            <HealthBar label="Activity" score={repo.activityLevel === "High" ? 90 : repo.activityLevel === "Moderate" ? 60 : repo.activityLevel === "Low" ? 30 : 5} />
            <HealthBar label="Ownership" score={repo.team ? 100 : 0} />
          </Card>

          {/* Dependencies */}
          <Card>
            <SectionTitle>Dependencies</SectionTitle>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Depends On</div>
              {repo.dependsOn.length ? (
                repo.dependsOn.map((d) => (
                  <DependencyRow key={d.id} name={d.name} slug={d.id} lifecycle={d.lifecycle_state} type={d.dependency_type} />
                ))
              ) : (
                <span style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>No known dependencies</span>
              )}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Used By</div>
              {repo.usedBy.length ? (
                repo.usedBy.map((d) => (
                  <DependencyRow key={d.id} name={d.name} slug={d.id} lifecycle={d.lifecycle_state} type={d.dependency_type} />
                ))
              ) : (
                <span style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>No known consumers</span>
              )}
            </div>
          </Card>

          {/* APIs */}
          <Card>
            <SectionTitle>APIs</SectionTitle>
            {repo.apis.length ? (
              repo.apis.map((a) => (
                <div key={a.id} style={{ fontSize: "13px", marginBottom: "8px" }}>
                  <div style={{ fontWeight: 600 }}>{a.name}</div>
                  <div style={{ color: "var(--color-text-secondary)" }}>
                    {a.protocol} · {a.endpoint_count} endpoints · {a.specification_type}
                  </div>
                </div>
              ))
            ) : (
              <span style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>No APIs discovered</span>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px" }}>{children}</div>;
}

function DetailGrid({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "12px", columnGap: "24px" }}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "2px" }}>{label}</div>
          <div style={{ fontSize: "14px" }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function IntentField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px" }}>{value}</div>
    </div>
  );
}

function IntentListField({ label, items, tone }: { label: string; items: string[]; tone?: "warning" }) {
  if (!items.length) return null;
  return (
    <div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
        {label}
      </div>
      <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "14px" }}>
        {items.map((item, i) => (
          <li key={i} style={{ color: tone === "warning" ? "var(--color-warning)" : "var(--color-text)", marginBottom: "2px" }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DependencyRow({ name, slug, lifecycle, type }: { name: string; slug: string; lifecycle: string; type: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: "13px" }}>
      <Link to={`/repositories/${slug}`} style={{ color: "var(--color-accent)", fontWeight: 500 }}>
        {name}
      </Link>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>{type}</span>
        <LifecycleBadge lifecycle={lifecycle} />
      </div>
    </div>
  );
}
