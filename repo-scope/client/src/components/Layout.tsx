import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Overview", end: true },
  { to: "/repositories", label: "Repositories" },
  { to: "/capabilities", label: "Capabilities" },
  { to: "/intelligence", label: "Intelligence" },
  { to: "/dependencies", label: "Dependencies" },
  { to: "/archive-candidates", label: "Archive Candidates" },
  { to: "/discovery", label: "Discovery" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          borderRight: "1px solid var(--color-border)",
          padding: "24px 16px",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0 12px", marginBottom: "32px" }}>
          <div style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.01em" }}>Repo Scope</div>
          <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
            Repository Intelligence
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--color-accent)" : "var(--color-text)",
                background: isActive ? "rgba(0, 113, 227, 0.08)" : "transparent",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: "36px 44px", maxWidth: "1400px" }}>
        <Outlet />
      </main>
    </div>
  );
}
