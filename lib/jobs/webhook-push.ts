import { inngest } from "@/lib/jobs/client";
import { prisma } from "@/lib/db/prisma";
import { createGitHubClient, getVerifiedEmails } from "@/lib/github/client";
import { getLanguagesForRepository } from "@/lib/github/languages";
import { resolvePeriod } from "@/lib/dashboard/period";

/**
 * ⚠️ Disparado por un webhook `push` (lib/webhooks/), no por polling.
 * Este es el valor central de la Fase 7: en vez de esperar a la próxima
 * sync completa (manual o del cron de reconciliación), un push real
 * dispara una actualización dirigida a ESE repo en minutos.
 *
 * Deliberadamente acotado a un solo repo — no es una sync completa. La
 * sync de todos los repos sigue siendo responsabilidad de
 * sync/user.requested (manual o del cron de reconciliación,
 * lib/jobs/reconcile.ts), que es el mecanismo de respaldo si este
 * webhook nunca llega (sección Consideraciones: "los webhooks son un
 * canal adicional, no un reemplazo total del polling").
 *
 * Los commits llegan con su metadata completa desde el payload del
 * webhook (ver lib/webhooks/parse.ts) — la única llamada a la API de
 * GitHub que hace este job es para refrescar `LanguageStat` (que no
 * viene en el payload) y para confirmar los emails verificados vigentes
 * (para la resolución de identidad, sección 11).
 */
export const handleWebhookPush = inngest.createFunction(
  { id: "handle-webhook-push", retries: 3 },
  { event: "webhook/push.received" },
  async ({ event, step }) => {
    const { userId, repositoryGithubId, commits } = event.data;

    const context = await step.run(
      "load-context",
      async (): Promise<{
        accessToken: string;
        repoDbId: string;
        repoFullName: string;
        verifiedEmails: string[];
      }> => {
        const account = await prisma.gitHubAccount.findUniqueOrThrow({ where: { userId } });
        const repo = await prisma.repository.findUniqueOrThrow({
          where: { githubId: repositoryGithubId }
        });
        const client = createGitHubClient(account.accessToken);
        const verifiedEmails = await getVerifiedEmails(client);
        return {
          accessToken: account.accessToken,
          repoDbId: repo.id,
          repoFullName: repo.fullName,
          verifiedEmails
        };
      }
    );

    const emailSet = new Set(context.verifiedEmails.map((e) => e.toLowerCase()));
    // Misma resolución de identidad que el collector REST (sección 11):
    // solo se persisten commits del propio usuario, nunca de otros
    // colaboradores que puedan aparecer en el mismo push.
    const ownCommits = commits.filter(
      (c) => c.authorEmail && emailSet.has(c.authorEmail.toLowerCase())
    );

    if (ownCommits.length === 0) {
      return { commitsAdded: 0 };
    }

    await step.run("upsert-commits", async () => {
      for (const commit of ownCommits) {
        await prisma.commit.upsert({
          where: { repositoryId_sha: { repositoryId: context.repoDbId, sha: commit.sha } },
          create: {
            sha: commit.sha,
            message: commit.message,
            date: new Date(commit.timestamp),
            author: commit.authorName,
            authorEmail: commit.authorEmail,
            repositoryId: context.repoDbId,
            userId
          },
          update: {}
        });
      }
    });

    // Barato, y un push puede haber introducido un lenguaje nuevo.
    await step.run("refresh-languages", async () => {
      const client = createGitHubClient(context.accessToken);
      const [owner, repoName] = context.repoFullName.split("/");
      const languages = await getLanguagesForRepository(client, { owner, repo: repoName });
      for (const lang of languages) {
        await prisma.languageStat.create({
          data: {
            language: lang.language,
            bytes: lang.bytes,
            percentage: lang.percentage,
            repositoryId: context.repoDbId,
            userId
          }
        });
      }
    });

    // Dispara regeneración de insights del período canónico, igual que
    // una sync completa — así un push real se refleja en el dashboard
    // sin esperar al próximo sync manual/cron.
    await step.run("trigger-insights-regeneration", async () => {
      const period = resolvePeriod("rolling12");
      await inngest.send({
        name: "insights/generate.requested",
        data: {
          userId,
          periodStart: period.start.toISOString(),
          periodEnd: period.end.toISOString()
        }
      });
    });

    return { commitsAdded: ownCommits.length };
  }
);
