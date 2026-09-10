import type { Octokit } from "@octokit/rest";
import { withRetry } from "@/lib/github/client";

export interface CollectedRepository {
  githubId: string;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  url: string;
}

export interface GetRepositoriesOptions {
  /**
   * ⚠️ Fase 6 (repos privados, opt-in). Default `false` — mantiene el
   * comportamiento MVP (sección 5: solo públicos) como el camino seguro
   * por defecto. Solo pasa `true` cuando el caller ya verificó que
   * `User.privateReposEnabled` es true Y el token tiene el scope `repo`
   * (ver lib/jobs/sync.ts) — este filtro es la última línea de defensa,
   * no la única: si el token no tiene el scope, GitHub ni siquiera
   * devuelve los repos privados, pero filtramos explícitamente igual
   * para que el contrato sea legible acá, no implícito en el scope del
   * token.
   */
  includePrivate?: boolean;
}

/**
 * Trae los repositorios del usuario autenticado, paginando hasta agotar
 * resultados.
 */
export async function getRepositories(
  client: Octokit,
  options: GetRepositoriesOptions = {}
): Promise<CollectedRepository[]> {
  const includePrivate = options.includePrivate ?? false;
  const repos: CollectedRepository[] = [];
  let page = 1;
  const perPage = 100;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await withRetry(() =>
      client.rest.repos.listForAuthenticatedUser({
        per_page: perPage,
        page,
        sort: "updated",
        affiliation: "owner,collaborator,organization_member"
      })
    );

    for (const repo of data) {
      if (repo.private && !includePrivate) continue;
      repos.push({
        githubId: String(repo.id),
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private ?? false,
        url: repo.html_url
      });
    }

    if (data.length < perPage) break;
    page += 1;
  }

  return repos;
}
