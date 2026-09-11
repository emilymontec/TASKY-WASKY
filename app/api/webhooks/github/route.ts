import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { inngest } from "@/lib/jobs/client";
import { verifyGitHubWebhookSignature } from "@/lib/webhooks/verify";
import { parseGitHubWebhookPayload } from "@/lib/webhooks/parse";

export const runtime = "nodejs";

/**
 * ⚠️ Orden de operaciones no es negociable (sección Fase 7, Trabajo
 * técnico): 1) leer el body RAW, 2) verificar la firma HMAC, 3) recién
 * ahí parsear JSON y hacer cualquier otra cosa. Nunca se toca `prisma`
 * ni se encola nada antes de que la firma esté verificada.
 *
 * Este Route Handler solo verifica y encola — el procesamiento real
 * (upsert de commits, refresco de lenguajes, etc.) vive en
 * lib/jobs/webhook-push.ts / webhook-repository-deleted.ts, vía Inngest,
 * nunca inline acá (mismo principio de toda la sección 32).
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const eventType = request.headers.get("x-github-event");

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    // Sin secreto configurado no hay nada que verificar de forma
    // confiable — rechazar todo es más seguro que aceptar sin verificar.
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });
  }

  if (!verifyGitHubWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (!eventType) {
    return NextResponse.json({ error: "Falta el header X-GitHub-Event" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const normalized = parseGitHubWebhookPayload(eventType, payload);
  if (!normalized) {
    // Evento que no nos interesa (ping, star, issues, etc.) — 200 igual,
    // GitHub reintenta si no ve un 2xx y no queremos reintentos infinitos
    // de algo que nunca vamos a procesar.
    return NextResponse.json({ status: "ignored" });
  }

  const repository = await prisma.repository.findUnique({
    where: { githubId: normalized.repositoryGithubId },
    select: { userId: true }
  });

  if (!repository) {
    // Repo que no sincronizamos, o webhook mal configurado apuntando acá
    // por error — se ignora, no es un error del cliente.
    return NextResponse.json({ status: "unknown_repository" });
  }

  if (normalized.type === "push") {
    await inngest.send({
      name: "webhook/push.received",
      data: {
        userId: repository.userId,
        repositoryGithubId: normalized.repositoryGithubId,
        commits: normalized.commits
      }
    });
  } else if (normalized.type === "repository" && normalized.action === "deleted") {
    await inngest.send({
      name: "webhook/repository-deleted.received",
      data: { repositoryGithubId: normalized.repositoryGithubId }
    });
  }

  return NextResponse.json({ status: "accepted" });
}
