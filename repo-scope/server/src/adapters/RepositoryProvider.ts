/**
 * RepositoryProvider is the contract every source-control adapter implements.
 * Repo Scope's core application never talks to GitHub, GitLab, Azure DevOps,
 * or Bitbucket directly — it only talks to this interface. That keeps
 * provider-specific code fully isolated from the normalized repository model
 * (see Success Criteria #14 / Non-Goals in intent/current-feature.md).
 *
 * All methods are read-only by design. There is intentionally no method on
 * this interface for creating branches, opening PRs, writing files, or
 * archiving/deleting repositories. Repo Scope v1 never performs destructive
 * or write operations against a source-control system.
 */

export interface DiscoveredRepository {
  externalId: string;
  name: string;
  description?: string;
  url: string;
  defaultBranch: string;
  visibility: "public" | "internal" | "private";
  createdDate: string;
}

export interface RepositoryMetadata {
  externalId: string;
  lastCommitDate?: string;
  primaryLanguage?: string;
  sizeKb?: number;
}

export interface RepositoryStructureSummary {
  externalId: string;
  fileCount: number;
  topLevelDirectories: string[];
}

export interface RepositoryDocumentationSummary {
  externalId: string;
  hasReadme: boolean;
  readmeQualityScore: number; // 0-100, simulated heuristic in v1
}

export interface DiscoveredDependency {
  externalId: string;
  dependsOnExternalId: string;
  dependencyType: "runtime" | "build" | "api" | "shared-library";
}

export interface RepositoryActivitySummary {
  externalId: string;
  commitsLast90Days: number;
  activityLevel: "High" | "Moderate" | "Low" | "Dormant";
}

export interface RepositoryOwnershipInfo {
  externalId: string;
  teamName?: string;
  ownerName?: string;
}

export interface RepositoryProvider {
  readonly providerName: string;

  listRepositories(): Promise<DiscoveredRepository[]>;
  getRepositoryMetadata(externalId: string): Promise<RepositoryMetadata>;
  getRepositoryStructure(
    externalId: string
  ): Promise<RepositoryStructureSummary>;
  getRepositoryDocumentation(
    externalId: string
  ): Promise<RepositoryDocumentationSummary>;
  getRepositoryDependencies(
    externalId: string
  ): Promise<DiscoveredDependency[]>;
  getRepositoryActivity(externalId: string): Promise<RepositoryActivitySummary>;
  getRepositoryOwnership(externalId: string): Promise<RepositoryOwnershipInfo>;
}
