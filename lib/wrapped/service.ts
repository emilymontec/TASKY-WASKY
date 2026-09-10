import { prisma } from "@/lib/db/prisma";
import { getAnalyticsForPeriod } from "@/lib/analytics/service";
import { resolveYearPeriod, isStale } from "@/lib/wrapped/period";
import { buildWrappedSlides } from "@/lib/wrapped/slides";
import type { WrappedSlide } from "@/lib/wrapped/types";
import type { PersistedInsight } from "@/lib/insights/types";

export type WrappedPageData =
  | { status: "not_generated"; year: number; isClosed: boolean }
  | {
      status: "ready";
      year: number;
      isClosed: boolean;
      isStale: boolean;
      isPublic: boolean;
      generatedAt: Date;
      slides: WrappedSlide[];
    };

/**
 * ⚠️ Esta función SÍ recalcula `AnalyticsResult` en cada visita (vía
 * `getAnalyticsForPeriod`, la misma función determinista que usa el
 * dashboard). Eso no contradice "nunca recalcular" — esa regla aplica a
 * los INSIGHTS (que cuestan una llamada de IA) y a la existencia misma
 * del reporte, ambos leídos tal cual están en DB. Los números del
 * Analytics Engine son una función pura de los commits ya sincronizados;
 * para un año cerrado, recalcularlos siempre da el mismo resultado, así
 * que hacerlo en cada visita es tan seguro como cachearlo, y más simple:
 * no hay que invalidar un caché de números si nunca cambian.
 */
export async function getWrappedPageData(
  userId: string,
  year: number,
  username: string
): Promise<WrappedPageData> {
  const { period, isClosed } = resolveYearPeriod(year);

  const report = await prisma.wrappedReport.findUnique({
    where: {
      userId_periodStart_periodEnd: { userId, periodStart: period.start, periodEnd: period.end }
    }
  });

  if (!report) {
    return { status: "not_generated", year, isClosed };
  }

  const [analytics, insights] = await Promise.all([
    getAnalyticsForPeriod(userId, period),
    prisma.insight.findMany({
      where: { userId, periodStart: period.start, periodEnd: period.end },
      orderBy: { priority: "desc" }
    })
  ]);

  const slides = buildWrappedSlides({
    year,
    username,
    analytics,
    insights: insights as PersistedInsight[]
  });

  return {
    status: "ready",
    year,
    isClosed,
    isStale: !isClosed && isStale(report.generatedAt),
    isPublic: report.isPublic,
    generatedAt: report.generatedAt,
    slides
  };
}

/**
 * ⚠️ Sección "Sharing" (Fase 4) — auditoría de qué se expone sin sesión:
 *
 * - Busca al usuario por `username` (el login de GitHub, público de por
 *   sí), nunca por email ni por ningún identificador interno.
 * - Si el reporte no existe O `isPublic` es false, devuelve `null` en
 *   AMBOS casos — la misma respuesta (404 en el caller) para "no existe"
 *   y para "existe pero es privado". Distinguir esos dos casos con
 *   mensajes distintos filtraría información (confirmaría que un usuario
 *   generó un Wrapped ese año aunque lo mantenga privado).
 * - Lo que SÍ se expone si es público: exactamente lo mismo que ve el
 *   propio usuario en su deck — commits, repos (ya filtrados a públicos
 *   desde el MVP), lenguajes, rachas. Nunca email, nunca tokens, nunca
 *   nombre completo si el usuario no lo puso público en GitHub (se usa
 *   el `username`/login, no `User.name`).
 */
export async function getPublicWrappedPageData(
  username: string,
  year: number
): Promise<{ slides: WrappedSlide[]; isClosed: boolean } | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true }
  });
  if (!user?.username) return null;

  const { period, isClosed } = resolveYearPeriod(year);

  const report = await prisma.wrappedReport.findUnique({
    where: {
      userId_periodStart_periodEnd: { userId: user.id, periodStart: period.start, periodEnd: period.end }
    }
  });
  if (!report || !report.isPublic) return null;

  const [analytics, insights] = await Promise.all([
    getAnalyticsForPeriod(user.id, period),
    prisma.insight.findMany({
      where: { userId: user.id, periodStart: period.start, periodEnd: period.end },
      orderBy: { priority: "desc" }
    })
  ]);

  const slides = buildWrappedSlides({
    year,
    username: user.username,
    analytics,
    insights: insights as PersistedInsight[]
  });

  return { slides, isClosed };
}

export interface PublicWrappedSummary {
  username: string;
  year: number;
  totalCommits: number;
  topLanguage: string | null;
  longestStreak: number;
}

/**
 * Versión liviana para la imagen de Open Graph (`opengraph-image.tsx`):
 * lee solo los campos denormalizados de `WrappedReport` — sin recomputar
 * el Analytics Engine — porque este endpoint lo golpean crawlers de
 * redes sociales, no personas, y no necesita el detalle completo.
 */
export async function getPublicWrappedSummary(
  username: string,
  year: number
): Promise<PublicWrappedSummary | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true }
  });
  if (!user?.username) return null;

  const { period } = resolveYearPeriod(year);
  const report = await prisma.wrappedReport.findUnique({
    where: {
      userId_periodStart_periodEnd: { userId: user.id, periodStart: period.start, periodEnd: period.end }
    },
    select: { isPublic: true, totalCommits: true, topLanguage: true, longestStreak: true }
  });
  if (!report || !report.isPublic) return null;

  return {
    username: user.username,
    year,
    totalCommits: report.totalCommits,
    topLanguage: report.topLanguage,
    longestStreak: report.longestStreak
  };
}

/**
 * Cambia la visibilidad de un WrappedReport. Compartir es una acción
 * consciente del dueño — nunca se activa por defecto (sección
 * Consideraciones de la Fase 4) — así que esta función solo la llama el
 * Route Handler autenticado, nunca nada del lado público.
 */
export async function setWrappedVisibility(
  userId: string,
  year: number,
  isPublic: boolean
): Promise<boolean> {
  const { period } = resolveYearPeriod(year);
  const result = await prisma.wrappedReport.updateMany({
    where: { userId, periodStart: period.start, periodEnd: period.end },
    data: { isPublic }
  });
  return result.count > 0;
}
