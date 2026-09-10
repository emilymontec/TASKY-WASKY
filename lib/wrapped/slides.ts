import type { AnalyticsResult } from "@/lib/analytics/engine";
import type { PersistedInsight } from "@/lib/insights/types";
import type { WrappedSlide } from "@/lib/wrapped/types";

/**
 * ⚠️ Igual regla que el Analytics Engine y el Insights Engine (secciones
 * 13/16): esta función solo LEE `analytics` e `insights`, ya calculados
 * y narrados en etapas anteriores. No suma, promedia ni decide qué
 * insight "es más importante" más allá de tomar el de mayor `priority`
 * ya asignado por `lib/insights/rank.ts`.
 */
function pickNarrative(insights: PersistedInsight[], types: string[]): string | null {
  const matches = insights.filter((i) => types.includes(i.type));
  if (matches.length === 0) return null;
  return matches.reduce((best, current) => (current.priority > best.priority ? current : best))
    .narrative;
}

export interface BuildWrappedSlidesInput {
  year: number;
  username: string;
  analytics: AnalyticsResult;
  insights: PersistedInsight[];
}

export function buildWrappedSlides({
  year,
  username,
  analytics,
  insights
}: BuildWrappedSlidesInput): WrappedSlide[] {
  const { commitStats, temporal, languageStats, repositoryStats, streaks } = analytics;

  return [
    {
      kind: "opening",
      data: { year, username, totalCommits: commitStats.totalCommits }
    },
    {
      kind: "volume",
      data: {
        totalCommits: commitStats.totalCommits,
        activeDays: commitStats.activeDays,
        averageCommitsPerWeek: commitStats.averageCommitsPerWeek
      }
    },
    {
      kind: "rhythm",
      data: {
        mostActiveHour: temporal.mostActiveHour,
        mostActiveDay: temporal.mostActiveDay,
        nightActivityPercentage: temporal.nightActivityPercentage,
        weekendActivityPercentage: temporal.weekendActivityPercentage,
        narrative: pickNarrative(insights, [
          "night_owl",
          "early_bird",
          "weekend_warrior",
          "consistent_committer"
        ])
      }
    },
    {
      kind: "languages",
      data: {
        topLanguage: languageStats.topLanguage,
        distribution: languageStats.distribution,
        narrative: pickNarrative(insights, ["language_loyalist", "polyglot"])
      }
    },
    {
      kind: "repos",
      data: {
        topRepository: repositoryStats.topRepository,
        activeRepositories: repositoryStats.activeRepositories,
        narrative: pickNarrative(insights, ["mono_repo_focus", "serial_starter"])
      }
    },
    {
      kind: "streak",
      data: {
        longestStreak: streaks.longestStreak,
        currentStreak: streaks.currentStreak,
        narrative: pickNarrative(insights, ["longest_streak", "active_streak"])
      }
    },
    {
      kind: "closing",
      data: { year, totalCommits: commitStats.totalCommits, topLanguage: languageStats.topLanguage }
    }
  ];
}
