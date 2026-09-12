import { Card, PageHeader } from "../components/ui";

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Configuration for Repo Scope. Authentication and enterprise RBAC are planned for a future phase." />
      <Card>
        <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          <p style={{ marginTop: 0 }}>
            v1 runs without authentication or multi-tenant configuration by design — see the project intent for the
            full non-goals list. This screen is a placeholder for future settings such as:
          </p>
          <ul>
            <li>Provider credential management (read-only, least-privilege tokens)</li>
            <li>Discovery scan scheduling</li>
            <li>Enterprise SSO / RBAC configuration</li>
            <li>Notification preferences for new findings</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
