import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { verifyGitHubWebhookSignature } from "@/lib/webhooks/verify";

const SECRET = "test-webhook-secret";

function sign(body: string, secret: string): string {
  const hex = crypto.createHmac("sha256", secret).update(body, "utf8").digest("hex");
  return `sha256=${hex}`;
}

describe("verifyGitHubWebhookSignature", () => {
  it("acepta una firma correcta", () => {
    const body = JSON.stringify({ hello: "world" });
    const signature = sign(body, SECRET);
    expect(verifyGitHubWebhookSignature(body, signature, SECRET)).toBe(true);
  });

  it("rechaza si el body fue alterado después de firmarlo", () => {
    const body = JSON.stringify({ hello: "world" });
    const signature = sign(body, SECRET);
    const tamperedBody = JSON.stringify({ hello: "world!" });
    expect(verifyGitHubWebhookSignature(tamperedBody, signature, SECRET)).toBe(false);
  });

  it("rechaza si el secreto usado para firmar es distinto", () => {
    const body = JSON.stringify({ hello: "world" });
    const signature = sign(body, "otro-secreto");
    expect(verifyGitHubWebhookSignature(body, signature, SECRET)).toBe(false);
  });

  it("rechaza si falta el header de firma", () => {
    const body = JSON.stringify({ hello: "world" });
    expect(verifyGitHubWebhookSignature(body, null, SECRET)).toBe(false);
  });

  it("rechaza un header sin el prefijo sha256=", () => {
    const body = JSON.stringify({ hello: "world" });
    const rawHex = crypto.createHmac("sha256", SECRET).update(body, "utf8").digest("hex");
    expect(verifyGitHubWebhookSignature(body, rawHex, SECRET)).toBe(false);
  });

  it("rechaza si el secreto configurado está vacío", () => {
    const body = JSON.stringify({ hello: "world" });
    const signature = sign(body, SECRET);
    expect(verifyGitHubWebhookSignature(body, signature, "")).toBe(false);
  });

  it("re-serializar el mismo objeto con distinto espaciado rompe la firma", () => {
    // Prueba explícita de la advertencia del comentario del módulo: el
    // body debe verificarse RAW, nunca tras un JSON.parse + re-stringify.
    const original = '{"a":1,"b":2}';
    const reformatted = JSON.stringify(JSON.parse(original), null, 2);
    const signature = sign(original, SECRET);
    expect(verifyGitHubWebhookSignature(reformatted, signature, SECRET)).toBe(false);
  });
});
