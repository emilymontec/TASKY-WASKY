import { prisma } from "@/lib/db/prisma";
import { detectEligibleBadges, type DetectedBadge } from "@/lib/gamification/badges";
import type { AnalyticsResult } from "@/lib/analytics/engine";

/**
 * ⚠️ Solo CREA badges que el usuario no tenía todavía — nunca actualiza
 * uno existente. Un badge otorgado no se revoca ni se "refresca" con
 * metadata más reciente; es un logro, no un estado en vivo (ver
 * comentario en el modelo `Badge` del schema).
 *
 * Se calcula el diff explícitamente (en vez de un upsert con
 * `update: {}`) para poder devolver con certeza cuáles son genuinamente
 * nuevos en esta corrida, sin depender de comparar timestamps.
 *
 * ⚠️ Fase 8: devuelve `DetectedBadge[]` (type + metadata), no solo el
 * `type` como antes -- `lib/jobs/insights.ts` necesita `metadata` para
 * armar la notificación de racha (p. ej. "llegaste a 30 días") sin tener
 * que volver a leer el badge recién insertado de la DB.
 */
export async function awardEligibleBadges(
  userId: string,
  analytics: AnalyticsResult
): Promise<DetectedBadge[]> {
  const eligible = detectEligibleBadges(analytics);
  if (eligible.length === 0) return [];

  const alreadyEarned = await prisma.badge.findMany({
    where: { userId, type: { in: eligible.map((b) => b.type) } },
    select: { type: true }
  });
  const alreadyEarnedTypes = new Set(alreadyEarned.map((b: { type: string }) => b.type));

  const toAward = eligible.filter((b) => !alreadyEarnedTypes.has(b.type));
  if (toAward.length === 0) return [];

  await prisma.badge.createMany({
    data: toAward.map((b) => ({ userId, type: b.type, metadata: b.metadata })),
    skipDuplicates: true
  });

  return toAward;
}
