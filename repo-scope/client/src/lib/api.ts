const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST" });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export interface RepoSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  purpose: string;
  provider: string;
  visibility: string;
  lifecycle: string;
  lastActivity: string;
  activityLevel: string;
  healthScore: number;
  documentationScore: number;
  testScore: number;
  intelligenceConfidence: number;
  intentConfidence: number | null;
  createdDate: string;
  team: string | null;
  domain: string | null;
  technologies: string[];
}

export interface Facets {
  providers: string[];
  teams: string[];
  domains: string[];
  lifecycles: string[];
  technologies: string[];
}

export interface OverviewData {
  total: number;
  active: number;
  maintenance: number;
  legacy: number;
  dormant: number;
  archiveCandidates: number;
  unknownOwnership: number;
  recentlyChanged: number;
  needsReview: number;
  charts: {
    lifecycle: { name: string; value: number }[];
    technology: { name: string; value: number }[];
    domain: { name: string; value: number }[];
    age: { name: string; value: number }[];
    activity: { name: string; value: number }[];
    ownershipCoverage: { owned: number; unowned: number };
  };
}

export interface RepoDetail extends RepoSummary {
  repositoryUrl: string;
  defaultBranch: string;
  lastCommitDate: string;
  lastScanDate: string;
  technologies_detail?: { name: string; category: string; lifecycle_status: string }[];
  dependsOn: { id: string; name: string; slug: string; lifecycle_state: string; dependency_type: string; confidence: number }[];
  usedBy: { id: string; name: string; slug: string; lifecycle_state: string; dependency_type: string; confidence: number }[];
  apis: { id: string; name: string; protocol: string; version: string; endpoint_count: number; specification_type: string }[];
  intent: {
    id: string;
    purpose: string;
    status: string;
    confidence: number;
    generatedAt: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
    inputs: string[];
    outputs: string[];
    successCriteria: string[];
    constraints: string[];
    risks: string[];
  } | null;
  findings: {
    id: string;
    category: string;
    severity: string;
    title: string;
    description: string;
    confidence: number;
    detected_at: string;
    status: string;
  }[];
}

export interface CapabilityResult {
  id: string;
  name: string;
  slug: string;
  purpose: string;
  lifecycle: string;
  provider: string;
  owner: string | null;
  technologies: string[];
  intentConfidence: number | null;
  relevance: number;
}

export interface Finding {
  id: string;
  repository_id: string | null;
  category: string;
  severity: string;
  title: string;
  description: string;
  confidence: number;
  detected_at: string;
  status: string;
  repo_name: string | null;
  repo_slug: string | null;
}

export interface AdapterDescriptor {
  id: string;
  displayName: string;
  status: string;
  statusLabel: string;
  description: string;
}

export interface ScanRecord {
  id: string;
  repository_id: string | null;
  provider: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  files_examined: number;
  findings_count: number;
  repositories_discovered: number;
  intents_created: number;
}

export const api = {
  overview: () => get<OverviewData>("/overview"),
  repositories: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    ).toString();
    return get<RepoSummary[]>(`/repositories${qs ? `?${qs}` : ""}`);
  },
  repositoryFacets: () => get<Facets>("/repositories/facets"),
  repository: (id: string) => get<RepoDetail>(`/repositories/${id}`),
  capabilities: (q: string) => get<{ query: string; results: CapabilityResult[] }>(`/capabilities?q=${encodeURIComponent(q)}`),
  intelligence: (category?: string) =>
    get<{ findings: Finding[]; categoryCounts: { category: string; c: number }[] }>(
      `/intelligence${category ? `?category=${encodeURIComponent(category)}` : ""}`
    ),
  dependencies: () =>
    get<{
      edges: {
        id: string;
        dependency_type: string;
        confidence: number;
        source_id: string;
        source_name: string;
        source_slug: string;
        source_lifecycle: string;
        target_id: string;
        target_name: string;
        target_slug: string;
        target_lifecycle: string;
      }[];
      mostDependedOn: {
        id: string;
        name: string;
        slug: string;
        lifecycle_state: string;
        activity_level: string;
        dependent_count: number;
        high_blast_radius: boolean;
        at_risk: boolean;
      }[];
      summary: {
        highDependencyCount: number;
        highDependencyThreshold: number;
        dependenciesOnArchiveCandidates: number;
        circularCount: number;
        lowConfidenceCount: number;
        lowConfidenceThreshold: number;
      };
    }>("/dependencies"),
  discoveryAdapters: () => get<AdapterDescriptor[]>("/discovery/adapters"),
  discoveryStages: () => get<string[]>("/discovery/stages"),
  discoveryRun: () =>
    post<{
      stages: string[];
      repositoriesDiscovered: number;
      findingsCount: number;
      intentsCount: number;
      startedAt: string;
      completedAt: string;
    }>("/discovery/run"),
  discoveryScans: () => get<ScanRecord[]>("/discovery/scans"),
  reportsPortfolio: () =>
    get<{ total: number; byProvider: { provider: string; c: number }[]; byTeam: { team: string; c: number }[] }>(
      "/reports/portfolio"
    ),
  reportsTechLandscape: () =>
    get<{ technologies: { name: string; category: string; lifecycle_status: string; repo_count: number }[] }>(
      "/reports/technology-landscape"
    ),
  reportsLifecycle: () => get<{ lifecycle: { lifecycle_state: string; c: number }[] }>("/reports/lifecycle"),
  reportsOwnershipGaps: () =>
    get<{ unowned: { id: string; name: string; slug: string; provider: string; lifecycle_state: string; last_commit_date: string }[] }>(
      "/reports/ownership-gaps"
    ),
  reportsArchiveCandidates: () =>
    get<{
      candidates: {
        id: string;
        name: string;
        slug: string;
        provider: string;
        last_commit_date: string;
        health_score: number;
        documentation_score: number;
      }[];
    }>("/reports/archive-candidates"),
  reportsHealth: () =>
    get<{
      lowestHealth: { id: string; name: string; slug: string; health_score: number; documentation_score: number; test_score: number }[];
      averages: { avgHealth: number; avgDocs: number; avgTests: number };
    }>("/reports/health"),
  reportsDomainCoverage: () =>
    get<{ domains: { name: string; repo_count: number; owned_count: number }[] }>("/reports/domain-coverage"),
  reportsIntentCoverage: () =>
    get<{
      total: number;
      withIntent: number;
      withoutIntent: number;
      byStatus: { intent_status: string; c: number }[];
      avgConfidence: number;
    }>("/reports/intent-coverage"),
};
