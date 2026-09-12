/**
 * Adapter registry — describes every provider Repo Scope knows about and
 * its current implementation status. GitHub/GitLab/Azure DevOps/Bitbucket
 * are placeholders in v1: the interface contract (RepositoryProvider) is
 * defined and stable, but the concrete network-calling implementations are
 * intentionally deferred until real least-privilege, read-only credentials
 * are wired up (see intent's "next intent" note).
 */

export type AdapterStatus = "simulated-active" | "adapter-available" | "not-configured";

export interface AdapterDescriptor {
  id: string;
  displayName: string;
  status: AdapterStatus;
  statusLabel: string;
  description: string;
}

export const ADAPTER_REGISTRY: AdapterDescriptor[] = [
  {
    id: "simulated",
    displayName: "Simulated Provider",
    status: "simulated-active",
    statusLabel: "Active (Demo Data)",
    description:
      "Generates realistic repository data locally. Used for v1 demonstration and development — no external network calls.",
  },
  {
    id: "github",
    displayName: "GitHub",
    status: "adapter-available",
    statusLabel: "Ready for connection",
    description:
      "Adapter contract implemented against the RepositoryProvider interface. Connecting requires a read-only, least-privilege GitHub App or PAT scoped to repository metadata only.",
  },
  {
    id: "gitlab",
    displayName: "GitLab",
    status: "adapter-available",
    statusLabel: "Adapter available",
    description:
      "Adapter placeholder implemented against the RepositoryProvider interface. Connect with a read-only project access token.",
  },
  {
    id: "azure-devops",
    displayName: "Azure DevOps",
    status: "adapter-available",
    statusLabel: "Adapter available",
    description:
      "Adapter placeholder implemented against the RepositoryProvider interface. Connect with a read-only Azure DevOps PAT scoped to Code (Read).",
  },
  {
    id: "bitbucket",
    displayName: "Bitbucket",
    status: "adapter-available",
    statusLabel: "Adapter available",
    description:
      "Adapter placeholder implemented against the RepositoryProvider interface. Connect with a read-only app password scoped to repository read access.",
  },
];
