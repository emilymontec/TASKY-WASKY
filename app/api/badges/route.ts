import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { BADGE_INFO, type BadgeType } from "@/lib/gamification/badges";

/**
 * Route Handler delgado: solo lee lo que ya otorgó
 * lib/gamification/persist.ts (vía el job de insights). Nunca calcula
 * elegibilidad aquí — eso viviría en una request HTTP síncrona, contrario
 * al principio de job queue (sección 32).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const badges = await prisma.badge.findMany({
    where: { userId: session.user.id },
    orderBy: { earnedAt: "desc" }
  });

  const withInfo = badges.map((b: { type: string; earnedAt: Date; metadata: unknown }) => ({
    type: b.type,
    earnedAt: b.earnedAt,
    metadata: b.metadata,
    ...BADGE_INFO[b.type as BadgeType]
  }));

  return NextResponse.json({ badges: withInfo });
}
