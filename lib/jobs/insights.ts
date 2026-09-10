import { inngest } from "@/lib/jobs/client";
import { getAnalyticsForPeriod } from "@/lib/analytics/service";
import { generateAndPersistInsights } from "@/lib/insights/persist";
import { awardEligibleBadges } from "@/lib/gamification/persist";

/**
 * Corre después de sync-user-data (encolado como evento separado desde
 * lib/jobs/sync.ts). Deliberadamente independiente: si la generación de
 * insights falla o la IA no responde, la sincronización de datos ya se
 * marcó como COMPLETED y el usuario ve sus datos igual — los insights son
 * una capa de presentación encima, no un requisito para tener datos.
 *
 * También otorga badges (Fase 5) sobre el mismo `AnalyticsResult` — sin
 * costo de IA de por medio, así que no hay razón para separarlo en un
 * evento propio como si pasa con Wrapped/insights.
 */
export const generateUserInsights = inngest.createFunction(
  { id: "generate-user-insights", retries: 2 },
  { event: "insights/generate.requested" },
  async ({ event, step }) => {
    const { userId, periodStart, periodEnd } = event.data;
    const period = { start: new Date(periodStart), end: new Date(periodEnd) };

    const analytics = await step.run("compute-analytics", () =>
      getAnalyticsForPeriod(userId, period)
    );

    const generated = await step.run("generate-and-persist-insights", () =>
      generateAndPersistInsights({ userId, period, analytics })
    );

    const newBadges = await step.run("award-badges", () => awardEligibleBadges(userId, analytics));

    return { insightsGenerated: generated.length, newBadges };
  }
);
