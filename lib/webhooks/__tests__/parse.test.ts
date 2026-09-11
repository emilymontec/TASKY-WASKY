import { describe, expect, it } from "vitest";
import { parseGitHubWebhookPayload } from "@/lib/webhooks/parse";

describe("parseGitHubWebhookPayload — push", () => {
  it("extrae repo y commits con toda la metadata del payload, sin llamar a la API", () => {
    const payload = {
      repository: { id: 12345, full_name: "octocat/hello-world" },
      commits: [
        {
          id: "abc123",
          message: "fix: bug",
          timestamp: "2026-06-15T10:00:00Z",
          author: { name: "Octo Cat", email: "octo@example.com" }
        },
        {
          id: "def456",
          message: "feat: nueva feature",
          timestamp: "2026-06-15T11:00:00Z",
          author: { name: "Octo Cat", email: "octo@example.com" }
        }
      ]
    };

    const result = parseGitHubWebhookPayload("push", payload);
    expect(result?.type).toBe("push");
    if (result?.type !== "push") throw new Error("expected push event");

    expect(result.repositoryGithubId).toBe("12345");
    expect(result.repositoryFullName).toBe("octocat/hello-world");
    expect(result.commits).toHaveLength(2);
    expect(result.commits[0]).toEqual({
      sha: "abc123",
      message: "fix: bug",
      authorName: "Octo Cat",
      authorEmail: "octo@example.com",
      timestamp: "2026-06-15T10:00:00Z"
    });
  });

  it("devuelve un array de commits vacío si el push no trae commits (p. ej. borrar una rama)", () => {
    const payload = { repository: { id: 1, full_name: "a/b" }, commits: [] };
    const result = parseGitHubWebhookPayload("push", payload);
    expect(result?.type === "push" && result.commits).toEqual([]);
  });

  it("usa 'unknown' como authorName y null como authorEmail si el commit no trae autor", () => {
    const payload = {
      repository: { id: 1, full_name: "a/b" },
      commits: [{ id: "sha1", message: "msg", timestamp: "2026-01-01T00:00:00Z" }]
    };
    const result = parseGitHubWebhookPayload("push", payload);
    if (result?.type !== "push") throw new Error("expected push event");
    expect(result.commits[0].authorName).toBe("unknown");
    expect(result.commits[0].authorEmail).toBeNull();
  });

  it("devuelve null si el payload no trae repository (payload malformado)", () => {
    expect(parseGitHubWebhookPayload("push", { commits: [] })).toBeNull();
  });
});

describe("parseGitHubWebhookPayload — repository", () => {
  it("extrae action y repo", () => {
    const payload = { action: "deleted", repository: { id: 99, full_name: "octocat/gone" } };
    const result = parseGitHubWebhookPayload("repository", payload);
    expect(result).toEqual({
      type: "repository",
      action: "deleted",
      repositoryFullName: "octocat/gone",
      repositoryGithubId: "99"
    });
  });

  it("usa 'unknown' si no viene el campo action", () => {
    const payload = { repository: { id: 1, full_name: "a/b" } };
    const result = parseGitHubWebhookPayload("repository", payload);
    expect(result?.type === "repository" && result.action).toBe("unknown");
  });
});

describe("parseGitHubWebhookPayload — eventos que no nos interesan", () => {
  it("devuelve null para tipos de evento no manejados (ping, star, etc.)", () => {
    expect(parseGitHubWebhookPayload("ping", { zen: "keep it logically awesome" })).toBeNull();
    expect(parseGitHubWebhookPayload("star", { action: "created" })).toBeNull();
  });
});
