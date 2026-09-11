import crypto from "node:crypto";

/**
 * Verifica la firma HMAC-SHA256 que GitHub envía en el header
 * `X-Hub-Signature-256` de cada webhook (sección Fase 7, Trabajo
 * técnico: "verifica firma HMAC antes de procesar nada").
 *
 * ⚠️ Debe recibir el body RAW (el string/bytes tal cual llegó en la
 * request), nunca el resultado de `JSON.parse()` re-serializado —
 * cualquier diferencia de espaciado u orden de claves cambia el hash y
 * rompe la verificación aunque el contenido "sea el mismo"
 * semánticamente. Por eso el Route Handler lee `request.text()` antes
 * de parsear nada (ver app/api/webhooks/github/route.ts).
 *
 * Comparación en tiempo constante (`crypto.timingSafeEqual`) en vez de
 * `===`: un string compare normal corta apenas encuentra el primer
 * carácter distinto, lo que en teoría filtra información del secreto a
 * través de cuánto tarda la comparación. Bajo riesgo práctico acá, pero
 * es la forma correcta de comparar HMACs y no cuesta nada hacerlo bien.
 */
export function verifyGitHubWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  if (!secret) return false;

  const expectedHex = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const expected = Buffer.from(`sha256=${expectedHex}`, "utf8");
  const actual = Buffer.from(signatureHeader, "utf8");

  // timingSafeEqual exige buffers del mismo largo — si difieren, ya
  // sabemos que no matchean, pero comparamos con un buffer dummy del
  // mismo largo que `actual` para no salir temprano de forma que
  // filtre por longitud (defensa adicional, de bajo costo).
  if (expected.length !== actual.length) {
    crypto.timingSafeEqual(actual, actual);
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}
