import { inngest } from "@/lib/jobs/client";
import { prisma } from "@/lib/db/prisma";

/**
 * Reconciliación periódica (sección Consideraciones, Fase 7): los
 * webhooks son un canal adicional, no un reemplazo del polling. Este
 * cron corre independientemente de si los webhooks llegaron o no, y
 * encola una sync incremental para cada usuario con la cuenta conectada
 * — cubre exactamente el caso "el webhook se perdió" sin que el usuario
 * tenga que notarlo ni actuar.
 *
 * ⚠️ Fan-out simple sin paginación: itera TODOS los usuarios con
 * GitHubAccount en una sola pasada. Aceptable para el volumen actual;
 * revisar en la Fase 11 (Performance/Escalabilidad) si el número de
 * usuarios crece lo suficiente como para que esto deba paginarse o
 * repartirse en varios crons.
 */
export const reconcileAllUsers = inngest.createFunction(
  { id: "reconcile-all-users" },
  { cron: "0 4 * * *" }, // diario, 4am UTC — fuera de horas pico esperadas
  async ({ step }) => {
    const userIds = await step.run("list-connected-users", async (): Promise<string[]> => {
      const accounts = await prisma.gitHubAccount.findMany({ select: { userId: true } });
      return accounts.map((a: { userId: string }) => a.userId);
    });

    for (const userId of userIds) {
      await step.sendEvent(`reconcile-sync-${userId}`, {
        name: "sync/user.requested",
        data: { userId, mode: "incremental" }
      });
    }

    return { usersReconciled: userIds.length };
  }
);
