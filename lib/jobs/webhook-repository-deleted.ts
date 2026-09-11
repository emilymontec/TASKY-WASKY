import { inngest } from "@/lib/jobs/client";
import { prisma } from "@/lib/db/prisma";

/**
 * Cuando un repo se borra en GitHub, sus datos acá quedarían "huérfanos"
 * (nunca más se van a actualizar, pero seguirían contando en las
 * estadísticas). Este job los limpia.
 *
 * ⚠️ A diferencia de la purga de privacidad (lib/jobs/purge-private-repos.ts),
 * esto NO dispara una purga de `Insight`/`WrappedReport`/`Badge` — borrar
 * un repo no es un evento de privacidad, es higiene de datos. Los
 * derivados quedan como estaban hasta su próximo ciclo natural de
 * regeneración; una pequeña inconsistencia temporal (un insight que
 * todavía menciona el repo borrado) es aceptable acá, no lo sería en un
 * escenario de privacidad.
 */
export const handleWebhookRepositoryDeleted = inngest.createFunction(
  { id: "handle-webhook-repository-deleted", retries: 2 },
  { event: "webhook/repository-deleted.received" },
  async ({ event, step }) => {
    const { repositoryGithubId } = event.data;

    const repo = await step.run("find-repo", async (): Promise<{ id: string } | null> => {
      const found = await prisma.repository.findUnique({
        where: { githubId: repositoryGithubId },
        select: { id: true }
      });
      return found ? { id: found.id } : null;
    });

    if (!repo) {
      return { skipped: true as const };
    }

    await step.run("delete-commits", () =>
      prisma.commit.deleteMany({ where: { repositoryId: repo.id } })
    );
    await step.run("delete-language-stats", () =>
      prisma.languageStat.deleteMany({ where: { repositoryId: repo.id } })
    );
    await step.run("delete-repository", () => prisma.repository.delete({ where: { id: repo.id } }));

    return { skipped: false as const };
  }
);
