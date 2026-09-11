/**
 * Parseo puro de payloads de webhook de GitHub — sin red, sin DB,
 * testeable con fixtures (mismo principio que el resto de las capas de
 * "solo lee/transforma lo que ya tenés" del proyecto).
 *
 * ⚠️ Los commits de un evento `push` ya vienen con mensaje, autor y
 * timestamp EN el payload — no hace falta otra llamada a la API de
 * GitHub para esos datos básicos. Esto es lo que hace que la
 * actualización disparada por webhook sea liviana (sección Fase 7:
 * "actualizar datos casi en tiempo real"), en vez de re-listar el
 * historial completo del repo en cada push.
 */

export interface WebhookPushCommit {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string | null;
  timestamp: string;
}

export interface NormalizedPushEvent {
  type: "push";
  repositoryFullName: string;
  repositoryGithubId: string;
  commits: WebhookPushCommit[];
}

export interface NormalizedRepositoryEvent {
  type: "repository";
  action: string;
  repositoryFullName: string;
  repositoryGithubId: string;
}

export type NormalizedWebhookEvent = NormalizedPushEvent | NormalizedRepositoryEvent | null;

interface GitHubWebhookRepository {
  id: number;
  full_name: string;
}

interface GitHubPushPayload {
  repository?: GitHubWebhookRepository;
  commits?: {
    id: string;
    message: string;
    timestamp: string;
    author?: { name?: string; email?: string };
  }[];
}

interface GitHubRepositoryEventPayload {
  action?: string;
  repository?: GitHubWebhookRepository;
}

export function parseGitHubWebhookPayload(
  eventType: string,
  payload: unknown
): NormalizedWebhookEvent {
  if (eventType === "push") {
    const p = payload as GitHubPushPayload;
    if (!p.repository) return null;

    return {
      type: "push",
      repositoryFullName: p.repository.full_name,
      repositoryGithubId: String(p.repository.id),
      commits: (p.commits ?? []).map((c) => ({
        sha: c.id,
        message: c.message,
        authorName: c.author?.name ?? "unknown",
        authorEmail: c.author?.email ?? null,
        timestamp: c.timestamp
      }))
    };
  }

  if (eventType === "repository") {
    const p = payload as GitHubRepositoryEventPayload;
    if (!p.repository) return null;

    return {
      type: "repository",
      action: p.action ?? "unknown",
      repositoryFullName: p.repository.full_name,
      repositoryGithubId: String(p.repository.id)
    };
  }

  // Cualquier otro tipo de evento (ping, star, issues, etc.) — no nos
  // interesa, se ignora explícitamente en vez de intentar procesarlo.
  return null;
}
