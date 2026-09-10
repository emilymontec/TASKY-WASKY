import { inngest } from "@/lib/jobs/client";
import { prisma } from "@/lib/db/prisma";

/**
 * ⚠️ Fase 6, Consideraciones: "la purga al revocar no es opcional ni
 * housekeeping eventual: debe ocurrir de forma verificable en el mismo
 * flujo de revocación". Este job es esa purga.
 *
 * No basta con borrar Commit/LanguageStat/Repository de los repos
 * privados — cualquier dato DERIVADO de esos commits puede seguir
 * codificando señal de actividad privada aunque los commits crudos ya no
 * estén:
 *
 * - `Insight`: un insight de "polyglot" o "night owl" pudo haberse
 *   detectado en parte por actividad en un repo privado.
 * - `WrappedReport`: los campos denormalizados (totalCommits,
 *   topLanguage, etc.) de un año que incluyó repos privados quedarían
 *   permanentemente desactualizados — y para un año CERRADO, que
 *   normalmente nunca se regenera, eso significaría que el dato privado
 *   queda fosilizado ahí para siempre. La purga de privacidad es la única
 *   excepción explícita a la regla "un año cerrado nunca se regenera".
 * - `Badge`: un logro como "century_club" pudo haberse alcanzado
 *   parcialmente gracias a commits privados.
 *
 * Se decidió purgar TODO lo derivado (no intentar recalcular
 * quirúrgicamente qué parte de cada insight/reporte/badge vino de un
 * repo privado) — es más simple, y en una función de privacidad, "borrar
 * de más y dejar que se regenere limpio" es la opción segura frente a
 * "borrar de menos por una lógica de recálculo que puede tener un bug".
 * Todo lo purgado se regenera solo, sin datos privados, la próxima vez
 * que se solicite (próxima sync para insights, próxima visita para
 * Wrapped).
 */
export const purgePrivateRepoData = inngest.createFunction(
  { id: "purge-private-repo-data", retries: 2 },
  { event: "privacy/purge-private-repos.requested" },
  async ({ event, step }) => {
    const { userId } = event.data;

    const privateRepoIds = await step.run("find-private-repos", async () => {
      const repos = await prisma.repository.findMany({
        where: { userId, private: true },
        select: { id: true }
      });
      return repos.map((r: { id: string }) => r.id);
    });

    const deletedCommits = await step.run(
      "delete-private-commits",
      async (): Promise<{ count: number }> => {
        const result = await prisma.commit.deleteMany({
          where: { repositoryId: { in: privateRepoIds } }
        });
        return { count: result.count };
      }
    );

    await step.run("delete-private-language-stats", () =>
      prisma.languageStat.deleteMany({ where: { repositoryId: { in: privateRepoIds } } })
    );

    await step.run("delete-private-repositories", () =>
      prisma.repository.deleteMany({ where: { id: { in: privateRepoIds } } })
    );

    // Derivados — se purgan enteros, no selectivamente (ver comentario
    // de arriba). Se regeneran solos en la próxima sync/visita, aunque
    // el usuario nunca haya llegado a sincronizar repos privados (por si
    // quedaron de una purga anterior incompleta).
    await step.run("delete-derived-insights", () =>
      prisma.insight.deleteMany({ where: { userId } })
    );
    await step.run("delete-derived-wrapped-reports", () =>
      prisma.wrappedReport.deleteMany({ where: { userId } })
    );
    await step.run("delete-derived-badges", () => prisma.badge.deleteMany({ where: { userId } }));

    return { purgedRepositories: privateRepoIds.length, purgedCommits: deletedCommits.count };
  }
);
