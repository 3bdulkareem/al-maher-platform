import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "مستخدم اختبار",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("surahs.getAll", () => {
  it("returns list of surahs", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const surahs = await caller.surahs.getAll();

    expect(Array.isArray(surahs)).toBe(true);
  });
});

describe("user.getStats", () => {
  it("returns user statistics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.user.getStats();

    expect(stats).toHaveProperty("trustScore");
    expect(stats).toHaveProperty("userRank");
    expect(stats).toHaveProperty("totalRecitations");
    expect(stats).toHaveProperty("totalCorrections");
  });
});

describe("notifications.getUnreadCount", () => {
  it("returns unread notifications count", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const count = await caller.notifications.getUnreadCount();

    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

describe("auth.me", () => {
  it("returns current user when authenticated", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.name).toBe("مستخدم اختبار");
    expect(user?.email).toBe("test@example.com");
  });

  it("returns null when not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: vi.fn(),
      } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();

    expect(user).toBeNull();
  });
});
