import { afterEach, describe, expect, it, vi } from "vitest";
import { sendEmail } from "@/lib/notifications/email";
import type { EmailContent } from "@/lib/notifications/templates";

const content: EmailContent = {
  subject: "Asunto de prueba",
  html: "<p>hola</p>",
  text: "hola"
};

describe("sendEmail", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.RESEND_FROM_EMAIL;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.RESEND_FROM_EMAIL = originalFrom;
    vi.clearAllMocks();
  });

  it("no llama a fetch y devuelve not_configured si falta RESEND_API_KEY", async () => {
    delete process.env.RESEND_API_KEY;
    process.env.RESEND_FROM_EMAIL = "wrapped@example.com";
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const result = await sendEmail("user@example.com", content);

    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("no llama a fetch y devuelve not_configured si falta RESEND_FROM_EMAIL", async () => {
    process.env.RESEND_API_KEY = "test-key";
    delete process.env.RESEND_FROM_EMAIL;
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const result = await sendEmail("user@example.com", content);

    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("envía el email a la API de Resend cuando la config está completa", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "wrapped@example.com";
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const result = await sendEmail("user@example.com", content);

    expect(result).toEqual({ sent: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.headers.Authorization).toBe("Bearer test-key");
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({
      from: "wrapped@example.com",
      to: "user@example.com",
      subject: content.subject
    });
  });

  it("devuelve provider_error si Resend responde con un status no-ok", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "wrapped@example.com";
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 422 }) as unknown as typeof fetch;

    const result = await sendEmail("user@example.com", content);

    expect(result).toEqual({ sent: false, reason: "provider_error" });
  });

  it("devuelve provider_error si fetch lanza (falla de red)", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "wrapped@example.com";
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const result = await sendEmail("user@example.com", content);

    expect(result).toEqual({ sent: false, reason: "provider_error" });
  });
});
