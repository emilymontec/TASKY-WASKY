import { BADGE_INFO, type BadgeType } from "@/lib/gamification/badges";

/**
 * ⚠️ Estas plantillas nunca calculan nada -- reciben números ya
 * calculados por el Analytics Engine / ya persistidos (mismo principio
 * que `lib/insights/templates.ts`: la IA/las plantillas redactan, nunca
 * agregan datos). Texto plano + HTML mínimo, sin dependencias de un
 * motor de templating -- el volumen de contenido es chico y fijo.
 */

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

function wrapHtml(bodyHtml: string): string {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:32px 16px;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e5e5;">
    <div style="max-width:480px;margin:0 auto;background:#171717;border:1px solid #262626;border-radius:16px;padding:32px;">
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#737373;">
        Recibiste este email porque tenés notificaciones activadas en GitHub Wrapped.
        Podés desactivarlas en cualquier momento desde tu configuración.
      </p>
    </div>
  </body>
</html>`;
}

export function wrappedReadyEmail(params: { displayName: string | null; year: number }): EmailContent {
  const { displayName, year } = params;
  const greeting = displayName ? `Hola ${displayName}` : "Hola";
  const subject = `Tu GitHub Wrapped ${year} ya está listo 🎉`;

  const text = [
    `${greeting},`,
    "",
    `Tu GitHub Wrapped ${year} ya se generó y está esperándote.`,
    `Entrá a tu dashboard para verlo: /wrapped/${year}`,
    "",
    "— GitHub Wrapped"
  ].join("\n");

  const html = wrapHtml(`
    <p style="font-size:15px;">${greeting},</p>
    <p style="font-size:15px;line-height:1.6;">
      Tu <strong>GitHub Wrapped ${year}</strong> ya se generó y está esperándote:
      tu volumen de commits, tus lenguajes, tu racha más larga y los patrones
      que detectamos en tu actividad de este año.
    </p>
    <p style="margin-top:24px;">
      <a href="/wrapped/${year}" style="display:inline-block;background:#22c55e;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:999px;font-size:14px;">
        Ver mi Wrapped
      </a>
    </p>
  `);

  return { subject, html, text };
}

export function streakMilestoneEmail(params: {
  displayName: string | null;
  badgeType: BadgeType;
  streakLength: number;
}): EmailContent {
  const { displayName, badgeType, streakLength } = params;
  const badge = BADGE_INFO[badgeType];
  const greeting = displayName ? `Hola ${displayName}` : "Hola";
  const subject = `Nueva racha desbloqueada: ${badge.label} 🔥`;

  const text = [
    `${greeting},`,
    "",
    `Llegaste a una racha de ${streakLength} días programando seguidos y ganaste el badge "${badge.label}".`,
    badge.description,
    "",
    "Entrá a tu dashboard para verlo: /dashboard",
    "",
    "— GitHub Wrapped"
  ].join("\n");

  const html = wrapHtml(`
    <p style="font-size:15px;">${greeting},</p>
    <p style="font-size:15px;line-height:1.6;">
      Llegaste a una racha de <strong>${streakLength} días</strong> programando seguidos y
      ganaste el badge <strong>${badge.label}</strong>.
    </p>
    <p style="font-size:14px;color:#a3a3a3;">${badge.description}</p>
    <p style="margin-top:24px;">
      <a href="/dashboard" style="display:inline-block;background:#22c55e;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:999px;font-size:14px;">
        Ver mi dashboard
      </a>
    </p>
  `);

  return { subject, html, text };
}
