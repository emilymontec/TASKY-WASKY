import type { EmailContent } from "@/lib/notifications/templates";

/**
 * ⚠️ Mismo patrón que `lib/insights/narrate.ts::callAnthropic`: `fetch`
 * directo a la API REST del proveedor (Resend), sin agregar un SDK como
 * dependencia nueva -- esto es una sola llamada HTTP, y mantenerlo como
 * `fetch` puro es lo que permite mockearlo en tests exactamente igual
 * que ya se mockea la llamada a Anthropic, sin duplicar infraestructura
 * de testing.
 *
 * Igual que `ANTHROPIC_API_KEY`, `RESEND_API_KEY` es opcional: sin ella,
 * el envío de emails cae a un no-op documentado (se loguea localmente y
 * se devuelve `sent: false`) en vez de tirar la sincronización o el cron
 * que lo dispara. Un email que no se pudo mandar nunca debe convertir un
 * job exitoso (Wrapped generado, badge otorgado) en uno fallido -- las
 * notificaciones son una capa de aviso encima de datos que ya existen.
 */

export interface SendEmailResult {
  sent: boolean;
  reason?: "not_configured" | "provider_error";
}

export async function sendEmail(to: string, content: EmailContent): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(
      "[notifications] RESEND_API_KEY o RESEND_FROM_EMAIL no configurados -- email no enviado (no-op documentado)."
    );
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from,
        to,
        subject: content.subject,
        html: content.html,
        text: content.text
      })
    });

    if (!response.ok) {
      console.error(`[notifications] Resend respondió ${response.status} al enviar a ${to}`);
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[notifications] Error de red enviando email:", error);
    return { sent: false, reason: "provider_error" };
  }
}
