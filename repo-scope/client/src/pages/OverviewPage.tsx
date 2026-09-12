import { useEffect, useState } from "react";
import { api, type OverviewData } from "../lib/api";
import { Card, PageHeader, StatTile, Loading } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

const PIE_COLORS = ["#0071e3", "#34c759", "#ff9500", "#af52de", "#ff3b30", "#5ac8fa", "#8e8e93"];

export function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    api.overview().then(setData);
  }, []);

  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Your repositories are your real architecture. Know what you own. Understand what it does."
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "28px" }}>
        <StatTile label="Total Repositories" value={data.total} />
        <StatTile label="Active" value={data.active} />
        <StatTile label="Maintenance" value={data.maintenance} />
        <StatTile label="Legacy" value={data.legacy} tone="warning" />
        <StatTile label="Dormant" value={data.dormant} tone="warning" />
        <StatTile label="Archive Candidates" value={data.archiveCandidates} tone="danger" />
        <StatTile label="Unknown Ownership" value={data.unknownOwnership} tone="danger" />
        <StatTile label="Recently Changed" value={data.recentlyChanged} />
        <StatTile label="Needs Review" value={data.needsReview} tone="warning" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <Card>
          <ChartTitle>Lifecycle Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.charts.lifecycle} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12, fill: "#1d1d1f" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e7", fontSize: 13 }} />
              <Bar dataKey="value" fill="#0071e3" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle>Ownership Coverage</ChartTitle>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={[
                  { name: "Owned", value: data.charts.ownershipCoverage.owned },
                  { name: "Unowned", value: data.charts.ownershipCoverage.unowned },
                ]}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                <Cell fill="#0071e3" />
                <Cell fill="#fce8e6" />
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e7", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <Card>
          <ChartTitle>Top Technologies</ChartTitle>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.charts.technology}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 12, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e7", fontSize: 13 }} />
              <Bar dataKey="value" fill="#34c759" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle>Business Domain Coverage</ChartTitle>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.charts.domain} dataKey="value" nameKey="name" outerRadius={95} label={(e) => e.name}>
                {data.charts.domain.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e7", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <Card>
          <ChartTitle>Repository Age</ChartTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.charts.age}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e7", fontSize: 13 }} />
              <Bar dataKey="value" fill="#af52de" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <ChartTitle>Activity Level</ChartTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.charts.activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e7", fontSize: 13 }} />
              <Bar dataKey="value" fill="#ff9500" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>{children}</div>;
}
