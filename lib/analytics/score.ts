import type { AnalyticsResult } from "@/lib/analytics/engine";

/**
 * ⚠️ "Developer Activity Score", NUNCA "Productivity Score" (convención
 * explícita del roadmap de producto) — más commits no implica más
 * productividad ni mejor código. Es un índice de ACTIVIDAD (consistencia
 * + volumen + rachas + diversidad), no un juicio de valor sobre qué tan
 * buen desarrollador es alguien. El nombre importa: llamarlo
 * "Productivity" invitaría a leerlo como un ranking de mérito.
 *
 * La fórmula es deliberadamente simple y transparente — nada de pesos
 * "ajustados a ojo" ni normalización oculta. Cada dimensión se limita a
 * [0, 100] con un techo (cap) lineal explícito, y se combinan con pesos
 * fijos que suman 1. Todos los caps y pesos son constantes exportadas: la
 * página pública "cómo se calcula" los muestra literalmente, no una
 * aproximación en prosa.
 *
 * `SCORE_VERSION` existe para que, si la fórmula cambia en el futuro, un
 * score guardado o cacheado en algún momento no se confunda
 * silenciosamente con uno calculado con reglas distintas.
 */

export const SCORE_VERSION = 1;

export const SCORE_WEIGHTS = {
  consistency: 0.35,
  volume: 0.3,
  streak: 0.2,
  diversity: 0.15
} as const;

export const SCORE_CAPS = {
  /** Commits en el período para llegar a 100 en la dimensión de volumen. */
  volumeCommits: 365,
  /** Días de racha más larga para llegar a 100 en la dimensión de racha. */
  streakDays: 60
} as const;

export interface DeveloperActivityScore {
  score: number;
  version: number;
  breakdown: {
    consistency: number;
    volume: number;
    streak: number;
    diversity: number;
  };
}

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function calculateDeveloperActivityScore(
  analytics: AnalyticsResult,
  periodDays: number
): DeveloperActivityScore {
  const { commitStats, streaks, languageStats } = analytics;

  const consistency =
    periodDays > 0 ? clamp100((commitStats.activeDays / periodDays) * 100) : 0;
  const volume = clamp100((commitStats.totalCommits / SCORE_CAPS.volumeCommits) * 100);
  const streak = clamp100((streaks.longestStreak / SCORE_CAPS.streakDays) * 100);
  const diversity = clamp100(languageStats.languageDiversity * 100);

  const score = Math.round(
    consistency * SCORE_WEIGHTS.consistency +
      volume * SCORE_WEIGHTS.volume +
      streak * SCORE_WEIGHTS.streak +
      diversity * SCORE_WEIGHTS.diversity
  );

  return {
    score,
    version: SCORE_VERSION,
    breakdown: {
      consistency: Math.round(consistency),
      volume: Math.round(volume),
      streak: Math.round(streak),
      diversity: Math.round(diversity)
    }
  };
}
