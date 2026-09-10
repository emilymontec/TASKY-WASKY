import type { AnalyticsResult } from "@/lib/analytics/engine";

/**
 * ⚠️ Misma regla que las reglas de Insights (lib/insights/rules.ts):
 * estas funciones LEEN métricas ya calculadas por el Analytics Engine,
 * nunca las recalculan. "No inventar un sistema paralelo de reglas"
 * (sección 42, Alcance) significa exactamente esto — los badges se
 * detectan sobre el mismo `AnalyticsResult` que ya usa el Insights
 * Engine, no sobre una lectura de commits aparte.
 *
 * A diferencia de los insights (que reflejan el estado ACTUAL de un
 * período y pueden dejar de aplicar), los badges son logros permanentes:
 * una vez que la métrica cruza el umbral, el badge se otorga y se queda
 * otorgado para siempre (ver comentario en el modelo `Badge` del
 * schema) — aunque la racha se corte o el conteo baje después.
 */

export const BADGE_TYPES = [
  "streak_7",
  "streak_30",
  "streak_100",
  "polyglot_5",
  "night_shift",
  "century_club",
  "marathon"
] as const;

export type BadgeType = (typeof BADGE_TYPES)[number];

export interface BadgeMetadata {
  label: string;
  description: string;
}

export const BADGE_INFO: Record<BadgeType, BadgeMetadata> = {
  streak_7: { label: "Racha de 7 días", description: "Programaste 7 días seguidos." },
  streak_30: { label: "Racha de 30 días", description: "Programaste 30 días seguidos." },
  streak_100: { label: "Racha de 100 días", description: "Programaste 100 días seguidos." },
  polyglot_5: {
    label: "Polyglot",
    description: "Programaste en 5 lenguajes distintos o más."
  },
  night_shift: {
    label: "Night shift",
    description: "Más de la mitad de tus commits fueron de noche."
  },
  century_club: { label: "Century Club", description: "100 commits o más en un año." },
  marathon: { label: "Maratón", description: "1,000 commits o más en un año." }
};

// Mismo umbral de muestra mínima que lib/insights/rules.ts, para no
// otorgar "night shift" con 3 commits de los cuales 2 fueron de noche.
const MIN_SAMPLE_COMMITS = 15;

export interface DetectedBadge {
  type: BadgeType;
  metadata: Record<string, number>;
}

/**
 * Devuelve todos los badges para los que el usuario califica ahora mismo
 * según `analytics`. El caller (lib/jobs/insights.ts) decide cuáles ya
 * estaban otorgados y solo persiste los nuevos — otorgar de más no es
 * un problema porque el upsert en DB es create-only.
 */
export function detectEligibleBadges(analytics: AnalyticsResult): DetectedBadge[] {
  const { streaks, languageStats, temporal, commitStats } = analytics;
  const eligible: DetectedBadge[] = [];

  if (streaks.longestStreak >= 7) {
    eligible.push({ type: "streak_7", metadata: { longestStreak: streaks.longestStreak } });
  }
  if (streaks.longestStreak >= 30) {
    eligible.push({ type: "streak_30", metadata: { longestStreak: streaks.longestStreak } });
  }
  if (streaks.longestStreak >= 100) {
    eligible.push({ type: "streak_100", metadata: { longestStreak: streaks.longestStreak } });
  }

  if (languageStats.languageCount >= 5) {
    eligible.push({ type: "polyglot_5", metadata: { languageCount: languageStats.languageCount } });
  }

  if (commitStats.totalCommits >= MIN_SAMPLE_COMMITS && temporal.nightActivityPercentage > 50) {
    eligible.push({
      type: "night_shift",
      metadata: { nightActivityPercentage: temporal.nightActivityPercentage }
    });
  }

  if (commitStats.totalCommits >= 100) {
    eligible.push({ type: "century_club", metadata: { totalCommits: commitStats.totalCommits } });
  }
  if (commitStats.totalCommits >= 1000) {
    eligible.push({ type: "marathon", metadata: { totalCommits: commitStats.totalCommits } });
  }

  return eligible;
}
