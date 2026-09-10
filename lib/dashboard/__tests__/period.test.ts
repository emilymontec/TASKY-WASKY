import { describe, expect, it } from "vitest";
import { isPeriodOption, resolvePeriod } from "@/lib/dashboard/period";

describe("resolvePeriod", () => {
  const reference = new Date("2026-06-15T12:00:00Z");
  // end es exclusivo: medianoche UTC del día SIGUIENTE a reference, para
  // que el día de hoy (15 de junio) quede completo dentro del rango.
  const expectedEnd = new Date("2026-06-16T00:00:00Z");

  it("end es la medianoche UTC del día siguiente a referenceDate (exclusivo)", () => {
    const { end } = resolvePeriod("last30", reference);
    expect(end).toEqual(expectedEnd);
  });

  it("last30 cubre exactamente 30 días terminando hoy (hoy incluido)", () => {
    const { start, end } = resolvePeriod("last30", reference);
    expect(end).toEqual(expectedEnd);
    expect(Math.round((end.getTime() - start.getTime()) / 86_400_000)).toBe(30);
    // Con `end` exclusivo, el propio 15 de junio debe caer DENTRO del
    // rango con un filtro `date < end` — este es el bug real que se
    // corrigió: antes `end` era la medianoche de HOY, lo que excluía
    // cualquier commit hecho hoy.
    const todayAt2pm = new Date("2026-06-15T14:00:00Z");
    expect(todayAt2pm.getTime() < end.getTime()).toBe(true);
  });

  it("calendarYear empieza el 1 de enero del año de referenceDate", () => {
    const { start, end } = resolvePeriod("calendarYear", reference);
    expect(start.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(end).toEqual(expectedEnd);
  });

  it("rolling12 retrocede exactamente un año calendario desde el límite exclusivo", () => {
    const { start, end } = resolvePeriod("rolling12", reference);
    expect(start.getUTCFullYear()).toBe(2025);
    expect(start.getUTCMonth()).toBe(end.getUTCMonth());
    expect(start.getUTCDate()).toBe(end.getUTCDate());
  });

  it("es determinista: dos llamadas el mismo día devuelven el mismo período, sin importar la hora exacta", () => {
    const morning = new Date("2026-06-15T02:00:00Z");
    const night = new Date("2026-06-15T23:59:00Z");
    expect(resolvePeriod("rolling12", morning)).toEqual(resolvePeriod("rolling12", night));
  });
});

describe("isPeriodOption", () => {
  it("acepta las tres opciones válidas", () => {
    expect(isPeriodOption("last30")).toBe(true);
    expect(isPeriodOption("calendarYear")).toBe(true);
    expect(isPeriodOption("rolling12")).toBe(true);
  });

  it("rechaza valores inválidos o nulos", () => {
    expect(isPeriodOption("last7")).toBe(false);
    expect(isPeriodOption(null)).toBe(false);
    expect(isPeriodOption("")).toBe(false);
  });
});
