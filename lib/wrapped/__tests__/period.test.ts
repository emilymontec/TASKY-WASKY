import { describe, expect, it } from "vitest";
import { isStale, resolveYearPeriod } from "@/lib/wrapped/period";

describe("resolveYearPeriod", () => {
  const reference = new Date("2026-06-15T12:00:00Z");

  it("un año pasado está cerrado y cubre el año calendario completo", () => {
    const { isClosed, period } = resolveYearPeriod(2025, reference);
    expect(isClosed).toBe(true);
    expect(period.start.toISOString()).toBe("2025-01-01T00:00:00.000Z");
    expect(period.end.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("el año actual está en curso y termina en 'hoy + 1' (exclusivo)", () => {
    const { isClosed, period } = resolveYearPeriod(2026, reference);
    expect(isClosed).toBe(false);
    expect(period.start.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(period.end.toISOString()).toBe("2026-06-16T00:00:00.000Z");
  });

  it("un año futuro también se trata como 'en curso' (no cerrado), aunque no tenga datos", () => {
    const { isClosed } = resolveYearPeriod(2027, reference);
    expect(isClosed).toBe(false);
  });

  it("el mismo día de hoy queda incluido en el año en curso (end exclusivo, no truncado a medianoche de hoy)", () => {
    const { period } = resolveYearPeriod(2026, reference);
    const todayAt2pm = new Date("2026-06-15T14:00:00Z");
    expect(todayAt2pm.getTime() < period.end.getTime()).toBe(true);
  });
});

describe("isStale", () => {
  it("no es stale si se generó hace menos de 15 minutos", () => {
    const generatedAt = new Date("2026-06-15T12:00:00Z");
    const reference = new Date("2026-06-15T12:10:00Z");
    expect(isStale(generatedAt, reference)).toBe(false);
  });

  it("es stale si pasaron más de 15 minutos", () => {
    const generatedAt = new Date("2026-06-15T12:00:00Z");
    const reference = new Date("2026-06-15T12:20:00Z");
    expect(isStale(generatedAt, reference)).toBe(true);
  });
});
