import { describe, expect, it, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const upsertMock = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    notificationPreference: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      upsert: (...args: unknown[]) => upsertMock(...args)
    }
  }
}));

import { getNotificationPreferences, setNotificationPreferences } from "@/lib/notifications/preferences";

describe("getNotificationPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve los defaults (true/true) cuando no existe fila", async () => {
    findUniqueMock.mockResolvedValue(null);

    const prefs = await getNotificationPreferences("u1");

    expect(prefs).toEqual({ wrappedReadyEmail: true, streakMilestoneEmail: true });
  });

  it("devuelve los valores guardados cuando la fila existe", async () => {
    findUniqueMock.mockResolvedValue({ wrappedReadyEmail: false, streakMilestoneEmail: true });

    const prefs = await getNotificationPreferences("u1");

    expect(prefs).toEqual({ wrappedReadyEmail: false, streakMilestoneEmail: true });
  });
});

describe("setNotificationPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hace upsert solo con los campos provistos, con defaults en el create", async () => {
    upsertMock.mockResolvedValue({ wrappedReadyEmail: false, streakMilestoneEmail: true });

    const result = await setNotificationPreferences("u1", { wrappedReadyEmail: false });

    expect(upsertMock).toHaveBeenCalledWith({
      where: { userId: "u1" },
      create: { userId: "u1", wrappedReadyEmail: false, streakMilestoneEmail: true },
      update: { wrappedReadyEmail: false },
      select: { wrappedReadyEmail: true, streakMilestoneEmail: true }
    });
    expect(result).toEqual({ wrappedReadyEmail: false, streakMilestoneEmail: true });
  });

  it("no toca streakMilestoneEmail si solo se actualiza wrappedReadyEmail", async () => {
    upsertMock.mockResolvedValue({ wrappedReadyEmail: true, streakMilestoneEmail: false });

    await setNotificationPreferences("u1", { wrappedReadyEmail: true });

    const call = upsertMock.mock.calls[0][0];
    expect(call.update).toEqual({ wrappedReadyEmail: true });
    expect(call.update.streakMilestoneEmail).toBeUndefined();
  });
});
