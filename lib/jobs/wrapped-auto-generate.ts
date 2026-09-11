import { inngest } from "@/lib/jobs/client";
import { prisma } from "@/lib/db/prisma";

/**
 * Generación automática del Wrapped anual (sección Alcance, Fase 7): en
 * vez de depender de que el usuario lo pida, este cron revisa a diario
 * si ya empezó un año nuevo y, de ser así, encola la generación del
 * Wrapped del año recién cerrado para cada usuario con actividad.
 *
 * Correr esto a diario (no solo el 1 de enero) es deliberado: si el
 * cron del 1 de enero fallara por cualquier motivo, el chequeo de los
 * días siguientes lo cubre igual, sin esperar a la próxima Nochevieja.
 * `lib/jobs/wrapped.ts` ya es idempotente (nunca regenera un año
 * cerrado que ya tiene reporte), así que encolar esto todos los días
 * del año para el mismo `previousYear` es seguro — la mayoría de los
 * días simplemente no hacen nada porque ya está generado.
 *
 * ⚠️ Fase 8: este cron ya no es "silencioso" -- `lib/jobs/wrapped.ts`
 * dispara `notifications/wrapped-ready.requested` la primera vez que un
 * año cerrado se genera, así que el usuario recibe un email sin tener
 * que visitar `/wrapped/[year]` para enterarse. La idempotencia diaria
 * de este cron (descrita arriba) sigue siendo segura porque el email
 * está deduplicado por `NotificationLog` (userId, "wrapped_ready", year)
 * -- reintentar el mismo `previousYear` en los días siguientes nunca
 * reenvía el aviso.
 */
export const autoGenerateClosedYearWrapped = inngest.createFunction(
  { id: "auto-generate-closed-year-wrapped" },
  { cron: "0 6 * * *" }, // diario, 6am UTC
  async ({ step }) => {
    const previousYear = new Date().getUTCFullYear() - 1;

    const userIds = await step.run("list-users-with-data", async (): Promise<string[]> => {
      const users = await prisma.user.findMany({
        where: { commits: { some: {} } },
        select: { id: true }
      });
      return users.map((u: { id: string }) => u.id);
    });

    for (const userId of userIds) {
      await step.sendEvent(`auto-generate-wrapped-${userId}-${previousYear}`, {
        name: "wrapped/generate.requested",
        data: { userId, year: previousYear }
      });
    }

    return { usersChecked: userIds.length, year: previousYear };
  }
);
