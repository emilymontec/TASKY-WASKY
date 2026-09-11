import { inngest } from "@/lib/jobs/client";
import { getAnalyticsForPeriod } from "@/lib/analytics/service";
import { generateAndPersistInsights } from "@/lib/insights/persist";
import { awardEligibleBadges } from "@/lib/gamification/persist";

// ⚠️ Fase 8: de los badges que puede otorgar `awardEligibleBadges`, solo
// estos tres disparan un email de "milestone de racha" -- el resto
// (polyglot_5, night_shift, century_club, marathon) no son rachas y
// quedan fuera del alcance pedido para esta fase (ver comentario en
// `lib/notifications/service.ts::notifyStreakMilestone`).
const STREAK_BADGE_LENGTHS: Record<string, number> = {
  streak_7: 7,
  streak_30: 30,
  streak_100: 100
};

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

    for (const badge of newBadges) {
      const streakLength = STREAK_BADGE_LENGTHS[badge.type];
      if (streakLength === undefined) continue; // no es un badge de racha -- no notifica

      await step.sendEvent(`notify-streak-milestone-${userId}-${badge.type}`, {
        name: "notifications/streak-milestone.requested",
        data: { userId, badgeType: badge.type, streakLength }
      });
    }

    return { insightsGenerated: generated.length, newBadges: newBadges.map((b) => b.type) };
  }
);
