import { describe, expect, it } from "vitest";
import { buildExportContent, getAccent, getGradient } from "@/lib/wrapped/exportImage";
import type { WrappedSlide } from "@/lib/wrapped/types";

describe("buildExportContent", () => {
  it("opening incluye el año, username y total de commits", () => {
    const slide: WrappedSlide = {
      kind: "opening",
      data: { year: 2026, username: "octocat", totalCommits: 500 }
    };
    const content = buildExportContent(slide);
    expect(content.title).toBe("GitHub Wrapped");
    expect(content.big).toBe("2026");
    expect(content.sub).toContain("octocat");
    expect(content.sub).toContain("500");
  });

  it("rhythm combina día y hora cuando ambos existen", () => {
    const slide: WrappedSlide = {
      kind: "rhythm",
      data: {
        mostActiveHour: 23,
        mostActiveDay: "Friday",
        nightActivityPercentage: 60,
        weekendActivityPercentage: 20,
        narrative: null
      }
    };
    expect(buildExportContent(slide).big).toBe("viernes, 23:00");
  });

  it("rhythm cae a guion cuando no hay ni día ni hora", () => {
    const slide: WrappedSlide = {
      kind: "rhythm",
      data: {
        mostActiveHour: null,
        mostActiveDay: null,
        nightActivityPercentage: 0,
        weekendActivityPercentage: 0,
        narrative: null
      }
    };
    expect(buildExportContent(slide).big).toBe("—");
  });

  it("closing menciona el lenguaje solo si existe", () => {
    const withLanguage: WrappedSlide = {
      kind: "closing",
      data: { year: 2026, totalCommits: 42, topLanguage: "Rust" }
    };
    const withoutLanguage: WrappedSlide = {
      kind: "closing",
      data: { year: 2026, totalCommits: 42, topLanguage: null }
    };
    expect(buildExportContent(withLanguage).sub).toContain("Rust");
    expect(buildExportContent(withoutLanguage).sub).toBe("commits");
  });

  it("cada tipo de slide tiene gradiente y color de acento definidos", () => {
    const kinds: WrappedSlide["kind"][] = [
      "opening",
      "volume",
      "rhythm",
      "languages",
      "repos",
      "streak",
      "closing"
    ];
    for (const kind of kinds) {
      expect(getGradient(kind)).toMatch(/^linear-gradient/);
      expect(getAccent(kind)).toMatch(/^#/);
    }
  });
});
