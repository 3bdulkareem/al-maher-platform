import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createReviewerContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "reviewer-user-456",
    email: "reviewer@example.com",
    name: "مصحح اختبار",
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

describe("Trust Algorithm", () => {
  describe("user.getOnlineReviewers", () => {
    it("returns list of online reviewers", async () => {
      const { ctx } = createReviewerContext();
      const caller = appRouter.createCaller(ctx);

      const reviewers = await caller.user.getOnlineReviewers();

      expect(Array.isArray(reviewers)).toBe(true);
    });
  });

  describe("user.updateOnlineStatus", () => {
    it("updates user online status successfully", async () => {
      const { ctx } = createReviewerContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.updateOnlineStatus({ isOnline: true });

      expect(result.success).toBe(true);
    });

    it("can set user offline", async () => {
      const { ctx } = createReviewerContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.updateOnlineStatus({ isOnline: false });

      expect(result.success).toBe(true);
    });
  });

  describe("corrections.recalculateTrustScore", () => {
    it("recalculates trust score for user", async () => {
      const { ctx } = createReviewerContext();
      const caller = appRouter.createCaller(ctx);

      // This should not throw even if user has no corrections
      const result = await caller.corrections.recalculateTrustScore();

      // Result can be undefined if no verified corrections exist
      expect(result === undefined || typeof result === "object").toBe(true);
    });
  });
});

describe("Notifications System", () => {
  describe("notifications.getAll", () => {
    it("returns list of notifications", async () => {
      const { ctx } = createReviewerContext();
      const caller = appRouter.createCaller(ctx);

      const notifications = await caller.notifications.getAll({});

      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe("notifications.markAllAsRead", () => {
    it("marks all notifications as read", async () => {
      const { ctx } = createReviewerContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.markAllAsRead();

      expect(result.success).toBe(true);
    });
  });
});

describe("Recitations for Review", () => {
  describe("recitations.getPendingForReview", () => {
    it("returns pending recitations for review", async () => {
      const { ctx } = createReviewerContext();
      const caller = appRouter.createCaller(ctx);

      const pending = await caller.recitations.getPendingForReview({});

      expect(Array.isArray(pending)).toBe(true);
    });
  });

  describe("recitations.getUserRecitations", () => {
    it("returns user recitations", async () => {
      const { ctx } = createReviewerContext();
      const caller = appRouter.createCaller(ctx);

      const recitations = await caller.recitations.getUserRecitations({});

      expect(Array.isArray(recitations)).toBe(true);
    });
  });
});

describe("User Corrections", () => {
  describe("corrections.getUserCorrections", () => {
    it("returns user corrections history", async () => {
      const { ctx } = createReviewerContext();
      const caller = appRouter.createCaller(ctx);

      const corrections = await caller.corrections.getUserCorrections({});

      expect(Array.isArray(corrections)).toBe(true);
    });
  });
});
