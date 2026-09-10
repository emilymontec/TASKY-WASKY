import { describe, expect, it } from "vitest";
import {
  calculateDeveloperActivityScore,
  SCORE_WEIGHTS,
  SCORE_CAPS,
  SCORE_VERSION
} from "@/lib/analytics/score";
import { buildAnalyticsFixture } from "@/lib/insights/__tests__/fixtures";

describe("SCORE_WEIGHTS", () => {
  it("suma exactamente 1 — si esto falla, el score puede salir fuera de [0,100]", () => {
    const sum =
      SCORE_WEIGHTS.consistency + SCORE_WEIGHTS.volume + SCORE_WEIGHTS.streak + SCORE_WEIGHTS.diversity;
    expect(sum).toBeCloseTo(1, 10);
  });
});

describe("calculateDeveloperActivityScore", () => {
  it("con cero actividad, el score es 0", () => {
    const result = calculateDeveloperActivityScore(buildAnalyticsFixture(), 30);
    expect(result.score).toBe(0);
    expect(result.breakdown).toEqual({ consistency: 0, volume: 0, streak: 0, diversity: 0 });
  });

  it("con actividad máxima en las 4 dimensiones, el score es 100", () => {
    const analytics = buildAnalyticsFixture({
      commitStats: {
        totalCommits: SCORE_CAPS.volumeCommits * 2, // muy por encima del cap
        averageCommitsPerDay: 0,
        averageCommitsPerWeek: 0,
        averageCommitsPerMonth: 0,
        activeDays: 30 // == periodDays
      },
      streaks: {
        currentStreak: 0,
        longestStreak: SCORE_CAPS.streakDays * 2,
        streakStart: null,
        streakEnd: null
      },
      languageStats: {
        topLanguage: "TS",
        distribution: [],
        languageCount: 5,
        languageDiversity: 1
      }
    });

    const result = calculateDeveloperActivityScore(analytics, 30);
    expect(result.score).toBe(100);
    expect(result.breakdown).toEqual({ consistency: 100, volume: 100, streak: 100, diversity: 100 });
  });

  it("nunca excede 100 ni baja de 0, incluso con valores extremos", () => {
    const analytics = buildAnalyticsFixture({
      commitStats: {
        totalCommits: 999999,
        averageCommitsPerDay: 0,
        averageCommitsPerWeek: 0,
        averageCommitsPerMonth: 0,
        activeDays: 999999
      },
      streaks: { currentStreak: 0, longestStreak: 999999, streakStart: null, streakEnd: null }
    });
    const result = calculateDeveloperActivityScore(analytics, 1);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("periodDays = 0 no revienta (división por cero) y da consistency 0", () => {
    const result = calculateDeveloperActivityScore(buildAnalyticsFixture(), 0);
    expect(result.breakdown.consistency).toBe(0);
    expect(Number.isFinite(result.score)).toBe(true);
  });

  it("incluye la versión de la fórmula en cada resultado", () => {
    const result = calculateDeveloperActivityScore(buildAnalyticsFixture(), 30);
    expect(result.version).toBe(SCORE_VERSION);
  });

  it("un caso intermedio realista produce un breakdown consistente con los caps documentados", () => {
    const analytics = buildAnalyticsFixture({
      commitStats: {
        totalCommits: 182, // mitad de volumeCommits (365) -> volume ~50
        averageCommitsPerDay: 0,
        averageCommitsPerWeek: 0,
        averageCommitsPerMonth: 0,
        activeDays: 15 // mitad de 30 -> consistency 50
      },
      streaks: { currentStreak: 0, longestStreak: 30, streakStart: null, streakEnd: null }, // mitad de 60 -> streak 50
      languageStats: { topLanguage: "TS", distribution: [], languageCount: 3, languageDiversity: 0.5 } // diversity 50
    });

    const result = calculateDeveloperActivityScore(analytics, 30);
    expect(result.breakdown.consistency).toBe(50);
    expect(result.breakdown.volume).toBe(50);
    expect(result.breakdown.streak).toBe(50);
    expect(result.breakdown.diversity).toBe(50);
    expect(result.score).toBe(50); // pesos suman 1, todas las dimensiones en 50 -> score 50
  });
});
