import { truncateToUtcDate } from "@/lib/dashboard/period";
import type { ResolvedPeriod } from "@/lib/dashboard/period";

/**
 * Wrapped es por naturaleza "tu año en resumen" (sección: Fase 3 del
 * roadmap de producto) — un concepto distinto de los 3 períodos rolling
 * del dashboard (lib/dashboard/period.ts). Un año puede estar:
 *
 * - CERRADO: ya terminó (año < año actual). Su `WrappedReport`, una vez
 *   generado, nunca se regenera — es "el resultado del año", no un
 *   dashboard en vivo.
 * - EN CURSO: es el año actual, todavía no terminó. Su reporte se genera
 *   "bajo demanda" y puede regenerarse (con throttling, ver
 *   `MIN_REGENERATION_INTERVAL_MS`) porque los datos siguen cambiando.
 *
 * Mismo contrato de `end` exclusivo que lib/dashboard/period.ts — ver ahí
 * el razonamiento completo sobre por qué `end` es un límite exclusivo.
 */
export interface YearPeriod {
  year: number;
  period: ResolvedPeriod;
  isClosed: boolean;
}

export const MIN_REGENERATION_INTERVAL_MS = 15 * 60 * 1000; // 15 minutos

export function resolveYearPeriod(year: number, referenceDate: Date = new Date()): YearPeriod {
  const today = truncateToUtcDate(referenceDate);
  const currentYear = today.getUTCFullYear();

  const start = new Date(Date.UTC(year, 0, 1));
  const isClosed = year < currentYear;

  // Año cerrado: el rango completo, hasta el 1 de enero del año
  // siguiente (exclusivo). Año en curso: el rango se corta en "hoy +1"
  // (exclusivo), igual que el resto de los períodos del dashboard.
  const end = isClosed
    ? new Date(Date.UTC(year + 1, 0, 1))
    : (() => {
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        return tomorrow;
      })();

  return { year, period: { start, end }, isClosed };
}

/**
 * Si un reporte ya existe para el año en curso, decide si vale la pena
 * regenerarlo o si es lo bastante reciente como para servir el cacheado.
 * Los años cerrados nunca llegan a esta función — se sirven siempre tal
 * cual están, sin excepción (ver lib/wrapped/service.ts).
 */
export function isStale(generatedAt: Date, referenceDate: Date = new Date()): boolean {
  return referenceDate.getTime() - generatedAt.getTime() > MIN_REGENERATION_INTERVAL_MS;
}
