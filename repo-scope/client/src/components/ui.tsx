import type { ReactNode } from "react";

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: "24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "28px",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>{title}</h1>
        {subtitle && (
          <p style={{ color: "var(--color-text-secondary)", marginTop: "6px", fontSize: "15px", maxWidth: "640px" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: "flex", gap: "10px" }}>{actions}</div>}
    </div>
  );
}

const LIFECYCLE_COLORS: Record<string, { bg: string; text: string }> = {
  Active: { bg: "#e6f4ea", text: "#1e8e3e" },
  Maintenance: { bg: "#e8f0fe", text: "#1a56db" },
  Legacy: { bg: "#fef3e2", text: "#b45309" },
  Dormant: { bg: "#f1f1f3", text: "#6e6e73" },
  "Archive Candidate": { bg: "#fce8e6", text: "#c5221f" },
  Archived: { bg: "#f1f1f3", text: "#6e6e73" },
  Unknown: { bg: "#f1f1f3", text: "#6e6e73" },
};

export function LifecycleBadge({ lifecycle }: { lifecycle: string }) {
  const colors = LIFECYCLE_COLORS[lifecycle] ?? LIFECYCLE_COLORS.Unknown;
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
      {lifecycle}
    </span>
  );
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: "#fce8e6", text: "#c5221f" },
  medium: { bg: "#fef3e2", text: "#b45309" },
  low: { bg: "#f1f1f3", text: "#6e6e73" },
  info: { bg: "#e8f0fe", text: "#1a56db" },
};

export function SeverityBadge({ severity }: { severity: string }) {
  const colors = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.info;
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
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {severity}
    </span>
  );
}

export function TechBadge({ name }: { name: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 500,
        background: "var(--color-neutral-bg)",
        color: "var(--color-neutral-text)",
        marginRight: "6px",
        marginBottom: "6px",
      }}
    >
      {name}
    </span>
  );
}

export function StatTile({ label, value, tone }: { label: string; value: string | number; tone?: "default" | "warning" | "danger" }) {
  const color =
    tone === "danger" ? "var(--color-danger)" : tone === "warning" ? "var(--color-warning)" : "var(--color-text)";
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "18px 20px",
        minWidth: "150px",
        flex: "1 1 150px",
      }}
    >
      <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "26px", fontWeight: 600, color, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

export function HealthBar({ label, score }: { label: string; score: number | null }) {
  const val = score ?? 0;
  const color = val >= 75 ? "#1e8e3e" : val >= 50 ? "#b45309" : "#c5221f";
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
        <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{score ?? "—"}</span>
      </div>
      <div style={{ height: "6px", background: "var(--color-neutral-bg)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${val}%`, background: color, borderRadius: "4px" }} />
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "var(--color-text-secondary)",
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>{title}</div>
      {description && <div style={{ fontSize: "14px" }}>{description}</div>}
    </div>
  );
}

export function Loading() {
  return <div style={{ padding: "40px", color: "var(--color-text-secondary)", fontSize: "14px" }}>Loading…</div>;
}
