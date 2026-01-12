import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import {
  getUserRecitations,
  createRecitation,
  getRecitationById,
  updateRecitation,
  getPendingRecitationsForReview,
  getRecitationsStats,
  createCorrection,
  getRecitationCorrections,
  getUserCorrections,
  finalizeRecitationReview,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  getOnlineReviewers,
  updateUserOnlineStatus,
  calculateAndUpdateTrustScore,
  notifyReviewersOfNewRecitation,
  getAllSurahs,
  seedSurahs,
  getUserById,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== المستخدم ====================
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      return user;
    }),
    
    updateOnlineStatus: protectedProcedure
      .input(z.object({ isOnline: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await updateUserOnlineStatus(ctx.user.id, input.isOnline);
        return { success: true };
      }),
    
    getOnlineReviewers: protectedProcedure.query(async ({ ctx }) => {
      return await getOnlineReviewers(ctx.user.id);
    }),
    
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      const recitationStats = await getRecitationsStats(ctx.user.id);
      return {
        trustScore: user?.trustScore || "0.00",
        userRank: user?.userRank || "student",
        totalRecitations: user?.totalRecitations || 0,
        totalCorrections: user?.totalCorrections || 0,
        correctCorrections: user?.correctCorrections || 0,
        recitationStats,
      };
    }),
  }),

  // ==================== التلاوات ====================
  recitations: router({
    create: protectedProcedure
      .input(z.object({
        surahNumber: z.number().min(1).max(114),
        surahName: z.string(),
        startVerse: z.number().min(1),
        endVerse: z.number().min(1),
        audioBase64: z.string(),
        audioMimeType: z.string().default("audio/webm"),
        durationSeconds: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // رفع الملف الصوتي إلى S3
        const audioBuffer = Buffer.from(input.audioBase64, "base64");
        const audioKey = `recitations/${ctx.user.id}/${nanoid()}.webm`;
        const { url: audioUrl } = await storagePut(audioKey, audioBuffer, input.audioMimeType);
        
        // إنشاء التلاوة
        const recitationId = await createRecitation({
          userId: ctx.user.id,
          surahName: input.surahName,
          surahNumber: input.surahNumber,
          startVerse: input.startVerse,
          endVerse: input.endVerse,
          audioUrl,
          audioKey,
          durationSeconds: input.durationSeconds,
          status: "pending_ai",
        });
        
        return { id: recitationId, audioUrl };
      }),
    
    analyzeWithAI: protectedProcedure
      .input(z.object({ recitationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const recitation = await getRecitationById(input.recitationId);
        if (!recitation) throw new Error("التلاوة غير موجودة");
        if (recitation.userId !== ctx.user.id) throw new Error("غير مصرح");
        
        // تحليل التلاوة باستخدام الذكاء الاصطناعي
        const prompt = `أنت خبير في تجويد القرآن الكريم. قم بتحليل تلاوة سورة ${recitation.surahName} من الآية ${recitation.startVerse} إلى الآية ${recitation.endVerse}.

قدم تحليلاً شاملاً يتضمن:
1. تقييم عام للتلاوة (من 100)
2. ملاحظات على أحكام التجويد
3. ملاحظات على مخارج الحروف
4. نصائح للتحسين

ملاحظة: هذا تحليل أولي تمهيدي للمراجعة البشرية.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "أنت معلم قرآن متخصص في التجويد. قدم تحليلاً مفيداً وبناءً." },
            { role: "user", content: prompt },
          ],
        });
        
        const rawContent = response.choices[0]?.message?.content;
        const aiAnalysis = typeof rawContent === "string" ? rawContent : "لم يتم التحليل";
        
        // استخراج الدرجة من التحليل (تقدير)
        const scoreMatch = aiAnalysis.match(/(\d{1,3})\s*[%\/]/);
        const aiScore = scoreMatch ? Math.min(100, parseInt(scoreMatch[1])).toFixed(2) : "75.00";
        
        await updateRecitation(input.recitationId, {
          status: "ai_reviewed",
          aiAnalysis: aiAnalysis,
          aiScore,
        });
        
        // إشعار المصححين
        const user = await getUserById(ctx.user.id);
        await notifyReviewersOfNewRecitation(
          input.recitationId,
          user?.name || "مستخدم",
          recitation.surahName
        );
        
        return { aiAnalysis, aiScore };
      }),
    
    submitForPeerReview: protectedProcedure
      .input(z.object({ recitationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const recitation = await getRecitationById(input.recitationId);
        if (!recitation) throw new Error("التلاوة غير موجودة");
        if (recitation.userId !== ctx.user.id) throw new Error("غير مصرح");
        
        await updateRecitation(input.recitationId, {
          status: "pending_peers",
        });
        
        return { success: true };
      }),
    
    getUserRecitations: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ ctx, input }) => {
        return await getUserRecitations(ctx.user.id, input?.limit || 20);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getRecitationById(input.id);
      }),
    
    getPendingForReview: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }).optional())
      .query(async ({ ctx, input }) => {
        return await getPendingRecitationsForReview(ctx.user.id, input?.limit || 10);
      }),
  }),

  // ==================== التصحيحات ====================
  corrections: router({
    submit: protectedProcedure
      .input(z.object({
        recitationId: z.number(),
        score: z.number().min(0).max(100),
        feedback: z.string().min(10),
        tajweedErrors: z.number().default(0),
        pronunciationErrors: z.number().default(0),
        memorizationErrors: z.number().default(0),
        errorDetails: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const recitation = await getRecitationById(input.recitationId);
        if (!recitation) throw new Error("التلاوة غير موجودة");
        if (recitation.userId === ctx.user.id) throw new Error("لا يمكنك تصحيح تلاوتك");
        
        // التحقق من أن المستخدم مصحح (ليس طالباً)
        const user = await getUserById(ctx.user.id);
        if (user?.userRank === "student") {
          throw new Error("يجب أن تكون مصححاً لتقديم التصحيحات");
        }
        
        const correctionId = await createCorrection({
          recitationId: input.recitationId,
          reviewerId: ctx.user.id,
          score: input.score.toFixed(2),
          feedback: input.feedback,
          tajweedErrors: input.tajweedErrors,
          pronunciationErrors: input.pronunciationErrors,
          memorizationErrors: input.memorizationErrors,
          errorDetails: input.errorDetails,
        });
        
        // التحقق من اكتمال المراجعات
        const updatedRecitation = await getRecitationById(input.recitationId);
        if (updatedRecitation && updatedRecitation.completedReviews >= updatedRecitation.requiredReviews) {
          await finalizeRecitationReview(input.recitationId);
        }
        
        return { id: correctionId };
      }),
    
    getForRecitation: protectedProcedure
      .input(z.object({ recitationId: z.number() }))
      .query(async ({ input }) => {
        return await getRecitationCorrections(input.recitationId);
      }),
    
    getUserCorrections: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ ctx, input }) => {
        return await getUserCorrections(ctx.user.id, input?.limit || 20);
      }),
    
    recalculateTrustScore: protectedProcedure.mutation(async ({ ctx }) => {
      return await calculateAndUpdateTrustScore(ctx.user.id);
    }),
  }),

  // ==================== الإشعارات ====================
  notifications: router({
    getAll: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ ctx, input }) => {
        return await getUserNotifications(ctx.user.id, input?.limit || 20);
      }),
    
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadNotificationsCount(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ==================== السور ====================
  surahs: router({
    getAll: publicProcedure.query(async () => {
      await seedSurahs(); // التأكد من وجود البيانات
      return await getAllSurahs();
    }),
  }),
});

export type AppRouter = typeof appRouter;
