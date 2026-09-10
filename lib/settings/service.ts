import { prisma } from "@/lib/db/prisma";
import { inngest } from "@/lib/jobs/client";

export interface PrivateReposStatus {
  enabled: boolean;
  enabledAt: Date | null;
  /** Si el token de GitHub ya tiene el scope `repo` otorgado (paso previo obligatorio). */
  hasGrantedScope: boolean;
}

export async function getPrivateReposStatus(userId: string): Promise<PrivateReposStatus> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      privateReposEnabled: true,
      privateReposEnabledAt: true,
      githubAccount: { select: { scope: true } }
    }
  });

  return {
    enabled: user.privateReposEnabled,
    enabledAt: user.privateReposEnabledAt,
    hasGrantedScope: Boolean(user.githubAccount?.scope?.includes("repo"))
  };
}

export type SetPrivateReposError = "scope_not_granted";

/**
 * ⚠️ Único punto que puede activar `privateReposEnabled` — igual
 * principio que `setWrappedVisibility` (Fase 4): una acción consciente
 * del dueño, nunca un default ni un efecto secundario de otra cosa.
 *
 * - Activar: requiere que el token YA tenga el scope `repo` (el usuario
 *   debe haber pasado por el flujo de reautorización en /settings
 *   primero) — si no, se rechaza explícitamente en vez de activar un
 *   flag que no va a tener efecto real. Encola una sync completa para
 *   traer los repos privados ahora que están habilitados.
 * - Desactivar: encola el job de purga (lib/jobs/purge-private-repos.ts)
 *   — la limpieza real ocurre ahí, no en esta función. Esta función solo
 *   cambia el flag y dispara la purga; nunca deja el flag en false con
 *   datos privados todavía en la base esperando un job que nadie encoló.
 */
export async function setPrivateReposEnabled(
  userId: string,
  enabled: boolean
): Promise<{ ok: true } | { ok: false; error: SetPrivateReposError }> {
  if (enabled) {
    const status = await getPrivateReposStatus(userId);
    if (!status.hasGrantedScope) {
      return { ok: false, error: "scope_not_granted" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { privateReposEnabled: true, privateReposEnabledAt: new Date() }
    });

    await inngest.send({ name: "sync/user.requested", data: { userId, mode: "full" } });
    return { ok: true };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { privateReposEnabled: false, privateReposEnabledAt: null }
  });

  await inngest.send({ name: "privacy/purge-private-repos.requested", data: { userId } });
  return { ok: true };
}
