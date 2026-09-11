import type { Octokit } from "@octokit/rest";
import { withRetry } from "@/lib/github/client";

/**
 * ⚠️ Requiere que el token tenga el scope `admin:repo_hook` (repos
 * públicos) o `repo` (repos privados, ya cubierto por el opt-in de la
 * Fase 6) — nuestro scope base (`public_repo`) NO lo incluye. Por eso
 * esta función es "best-effort": si GitHub rechaza la creación del
 * webhook por falta de permiso, se ignora el error y ese repo
 * simplemente no tiene webhook — el cron de reconciliación
 * (lib/jobs/reconcile.ts) sigue cubriendo la sincronización para esos
 * casos, tal como está pensado (sección Consideraciones: "los webhooks
 * son un canal adicional, no un reemplazo total del polling").
 *
 * ⚠️ Pedir `admin:repo_hook` de forma incremental (mismo patrón que la
 * Fase 6 con `repo`) queda deliberadamente fuera del alcance de esta
 * fase. El roadmap es explícito sobre esto: migrar a GitHub App (donde
 * los webhooks son a nivel de instalación, no por repo, y no requieren
 * este scope en absoluto) es la solución de fondo si el registro de
 * webhooks se vuelve una necesidad real — no vale la pena pedir un
 * scope adicional más como parche intermedio. Esta función deja el
 * camino listo (funciona si el scope está presente) sin forzar esa
 * decisión de infraestructura ahora.
 */
export async function registerRepoWebhookBestEffort(
  client: Octokit,
  params: { owner: string; repo: string; webhookUrl: string; secret: string }
): Promise<boolean> {
  try {
    await withRetry(() =>
      client.rest.repos.createWebhook({
        owner: params.owner,
        repo: params.repo,
        config: { url: params.webhookUrl, content_type: "json", secret: params.secret },
        events: ["push", "repository"]
      })
    );
    return true;
  } catch {
    return false;
  }
}
