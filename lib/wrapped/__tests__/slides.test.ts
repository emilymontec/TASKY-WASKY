import { describe, expect, it } from "vitest";
import { buildWrappedSlides } from "@/lib/wrapped/slides";
import { buildAnalyticsFixture } from "@/lib/insights/__tests__/fixtures";
import type { PersistedInsight } from "@/lib/insights/types";

function insight(overrides: Partial<PersistedInsight> = {}): PersistedInsight {
  return {
    id: "i1",
    type: "night_owl",
    priority: 50,
    data: {},
    narrative: "Programas de noche.",
    source: "TEMPLATE",
    ...overrides
  };
}

describe("buildWrappedSlides", () => {
  it("siempre devuelve los 7 slides en el orden narrativo fijo", () => {
    const slides = buildWrappedSlides({
      year: 2026,
      username: "octocat",
      analytics: buildAnalyticsFixture(),
      insights: []
    });

    expect(slides.map((s) => s.kind)).toEqual([
      "opening",
      "volume",
      "rhythm",
      "languages",
      "repos",
      "streak",
      "closing"
    ]);
  });

  it("funciona sin ningún insight — narrative queda null, pero los stats siguen presentes", () => {
    const analytics = buildAnalyticsFixture({
      commitStats: {
        totalCommits: 40,
        averageCommitsPerDay: 1,
        averageCommitsPerWeek: 7,
        averageCommitsPerMonth: 40,
        activeDays: 20
      }
    });
    const slides = buildWrappedSlides({ year: 2026, username: "octocat", analytics, insights: [] });

    const rhythm = slides.find((s) => s.kind === "rhythm");
    expect(rhythm?.data).toMatchObject({ narrative: null });

    const volume = slides.find((s) => s.kind === "volume");
    expect(volume?.data).toMatchObject({ totalCommits: 40, activeDays: 20 });
  });

  it("asocia el insight de mayor prioridad entre los que aplican a un slide", () => {
    const analytics = buildAnalyticsFixture();
    const insights: PersistedInsight[] = [
      insight({ id: "a", type: "night_owl", priority: 40, narrative: "Baja prioridad" }),
      insight({ id: "b", type: "weekend_warrior", priority: 90, narrative: "Alta prioridad" })
    ];

    const slides = buildWrappedSlides({ year: 2026, username: "octocat", analytics, insights });
    const rhythm = slides.find((s) => s.kind === "rhythm");
    expect(rhythm?.data).toMatchObject({ narrative: "Alta prioridad" });
  });

  it("un insight de un tipo no relacionado no contamina ningún slide", () => {
    const analytics = buildAnalyticsFixture();
    const insights: PersistedInsight[] = [
      insight({ type: "polyglot", narrative: "Insight de lenguajes" })
    ];

    const slides = buildWrappedSlides({ year: 2026, username: "octocat", analytics, insights });
    const rhythm = slides.find((s) => s.kind === "rhythm");
    const languages = slides.find((s) => s.kind === "languages");

    expect(rhythm?.data).toMatchObject({ narrative: null });
    expect(languages?.data).toMatchObject({ narrative: "Insight de lenguajes" });
  });

  it("opening y closing llevan el año y el total de commits, sin depender de insights", () => {
    const analytics = buildAnalyticsFixture({
      commitStats: {
        totalCommits: 123,
        averageCommitsPerDay: 1,
        averageCommitsPerWeek: 1,
        averageCommitsPerMonth: 1,
        activeDays: 1
      }
    });
    const slides = buildWrappedSlides({ year: 2025, username: "octocat", analytics, insights: [] });

    expect(slides[0]).toMatchObject({
      kind: "opening",
      data: { year: 2025, username: "octocat", totalCommits: 123 }
    });
    expect(slides[6]).toMatchObject({ kind: "closing", data: { year: 2025, totalCommits: 123 } });
  });
});
