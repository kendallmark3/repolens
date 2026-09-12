import type {
  RepositoryProvider,
  DiscoveredRepository,
  RepositoryMetadata,
  RepositoryStructureSummary,
  RepositoryDocumentationSummary,
  DiscoveredDependency,
  RepositoryActivitySummary,
  RepositoryOwnershipInfo,
} from "./RepositoryProvider.js";
import { db } from "../db/index.js";

/**
 * SimulatedProvider implements RepositoryProvider against the already-seeded
 * local database rather than a real network call. It exists so the
 * Discovery screen can demonstrate the full adapter contract and pipeline
 * shape without requiring real source-control credentials in v1.
 *
 * A real adapter (GitHubProvider, GitLabProvider, etc.) would implement this
 * exact interface against the provider's REST/GraphQL API instead.
 */
export class SimulatedProvider implements RepositoryProvider {
  readonly providerName = "simulated";

  async listRepositories(): Promise<DiscoveredRepository[]> {
    const rows = db
      .prepare("SELECT external_repository_id, name, description, repository_url, default_branch, visibility, created_date FROM repository")
      .all() as any[];
    return rows.map((r) => ({
      externalId: r.external_repository_id,
      name: r.name,
      description: r.description,
      url: r.repository_url,
      defaultBranch: r.default_branch,
      visibility: r.visibility,
      createdDate: r.created_date,
    }));
  }

  async getRepositoryMetadata(externalId: string): Promise<RepositoryMetadata> {
    const row = db
      .prepare("SELECT external_repository_id, last_commit_date FROM repository WHERE external_repository_id = ?")
      .get(externalId) as any;
    return { externalId, lastCommitDate: row?.last_commit_date };
  }

  async getRepositoryStructure(externalId: string): Promise<RepositoryStructureSummary> {
    return { externalId, fileCount: 0, topLevelDirectories: [] };
  }

  async getRepositoryDocumentation(externalId: string): Promise<RepositoryDocumentationSummary> {
    const row = db
      .prepare("SELECT documentation_score FROM repository WHERE external_repository_id = ?")
      .get(externalId) as any;
    return {
      externalId,
      hasReadme: (row?.documentation_score ?? 0) > 20,
      readmeQualityScore: row?.documentation_score ?? 0,
    };
  }

  async getRepositoryDependencies(_externalId: string): Promise<DiscoveredDependency[]> {
    return [];
  }

  async getRepositoryActivity(externalId: string): Promise<RepositoryActivitySummary> {
    const row = db
      .prepare("SELECT activity_level FROM repository WHERE external_repository_id = ?")
      .get(externalId) as any;
    return {
      externalId,
      commitsLast90Days: 0,
      activityLevel: row?.activity_level ?? "Dormant",
    };
  }

  async getRepositoryOwnership(externalId: string): Promise<RepositoryOwnershipInfo> {
    const row = db
      .prepare(
        `SELECT t.name as team_name FROM repository r LEFT JOIN team t ON t.id = r.team_id
         WHERE r.external_repository_id = ?`
      )
      .get(externalId) as any;
    return { externalId, teamName: row?.team_name };
  }
}
