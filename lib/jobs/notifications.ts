import { inngest } from "@/lib/jobs/client";
import { notifyWrappedReady, notifyStreakMilestone } from "@/lib/notifications/service";
import type { BadgeType } from "@/lib/gamification/badges";

/**
 * Ambas funciones son deliberadamente de un solo paso y sin `retries`
 * agresivos: `lib/notifications/service.ts` ya es idempotente (dedupe
 * por `NotificationLog`), así que un reintento de Inngest tras un fallo
 * transitorio del proveedor de email es seguro -- nunca manda el mismo
 * email dos veces. `retries: 2` (no el default de Inngest) para no
 * insistir demasiado contra un proveedor caído; si las dos fallan, el
 * usuario simplemente ve su Wrapped/badge sin haber recibido el email,
 * que es una degradación aceptable (nunca bloquea el dato en sí).
 */
export const sendWrappedReadyNotification = inngest.createFunction(
  { id: "send-wrapped-ready-notification", retries: 2 },
  { event: "notifications/wrapped-ready.requested" },
  async ({ event, step }) => {
    const { userId, year } = event.data;
    return step.run("notify-wrapped-ready", () => notifyWrappedReady(userId, year));
  }
);

export const sendStreakMilestoneNotification = inngest.createFunction(
  { id: "send-streak-milestone-notification", retries: 2 },
  { event: "notifications/streak-milestone.requested" },
  async ({ event, step }) => {
    const { userId, badgeType, streakLength } = event.data;
    return step.run("notify-streak-milestone", () =>
      notifyStreakMilestone(userId, badgeType as BadgeType, streakLength)
    );
  }
);
