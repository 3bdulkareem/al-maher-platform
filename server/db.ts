import { eq, desc, and, sql, ne, or, isNull, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  recitations, InsertRecitation, Recitation,
  corrections, InsertCorrection, Correction,
  notifications, InsertNotification,
  surahs, InsertSurah,
  demoRecitations, InsertDemoRecitation, DemoRecitation
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== المستخدمون ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserOnlineStatus(userId: number, isOnline: boolean) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users)
    .set({ isOnline, lastActiveAt: new Date() })
    .where(eq(users.id, userId));
}

export async function getOnlineReviewers(excludeUserId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(users.isOnline, true),
    ne(users.userRank, "student")
  ];
  
  if (excludeUserId) {
    conditions.push(ne(users.id, excludeUserId));
  }
  
  return await db.select({
    id: users.id,
    name: users.name,
    userRank: users.userRank,
    trustScore: users.trustScore,
    totalCorrections: users.totalCorrections,
    lastActiveAt: users.lastActiveAt,
  })
  .from(users)
  .where(and(...conditions))
  .orderBy(desc(users.trustScore))
  .limit(20);
}

export async function updateUserStats(userId: number, stats: {
  totalRecitations?: number;
  totalCorrections?: number;
  correctCorrections?: number;
  trustScore?: string;
  userRank?: "student" | "bronze_reviewer" | "silver_reviewer" | "gold_reviewer" | "teacher";
}) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set(stats).where(eq(users.id, userId));
}

// ==================== التلاوات ====================

export async function createRecitation(data: InsertRecitation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(recitations).values(data);
  return result[0].insertId;
}

export async function getRecitationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(recitations).where(eq(recitations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserRecitations(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(recitations)
    .where(eq(recitations.userId, userId))
    .orderBy(desc(recitations.createdAt))
    .limit(limit);
}

export async function updateRecitation(id: number, data: Partial<Recitation>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(recitations).set(data).where(eq(recitations.id, id));
}

export async function getPendingRecitationsForReview(reviewerId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  // الحصول على التلاوات التي تحتاج مراجعة ولم يراجعها هذا المستخدم بعد
  const reviewedIds = db
    .select({ recitationId: corrections.recitationId })
    .from(corrections)
    .where(eq(corrections.reviewerId, reviewerId));
  
  return await db.select({
    recitation: recitations,
    reciterName: users.name,
    reciterRank: users.userRank,
  })
    .from(recitations)
    .leftJoin(users, eq(recitations.userId, users.id))
    .where(and(
      or(
        eq(recitations.status, "ai_reviewed"),
        eq(recitations.status, "pending_peers"),
        eq(recitations.status, "under_review")
      ),
      ne(recitations.userId, reviewerId),
      sql`${recitations.id} NOT IN (${reviewedIds})`
    ))
    .orderBy(asc(recitations.createdAt))
    .limit(limit);
}

export async function getRecitationsStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, completed: 0, pending: 0 };
  
  const result = await db.select({
    total: sql<number>`COUNT(*)`,
    completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN status != 'completed' AND status != 'rejected' THEN 1 ELSE 0 END)`,
  })
    .from(recitations)
    .where(eq(recitations.userId, userId));
  
  return result[0] || { total: 0, completed: 0, pending: 0 };
}

// ==================== التصحيحات ====================

export async function createCorrection(data: InsertCorrection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(corrections).values(data);
  
  // تحديث عدد المراجعات المكتملة للتلاوة
  await db.update(recitations)
    .set({ 
      completedReviews: sql`${recitations.completedReviews} + 1`,
      status: "under_review"
    })
    .where(eq(recitations.id, data.recitationId));
  
  return result[0].insertId;
}

export async function getRecitationCorrections(recitationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    correction: corrections,
    reviewerName: users.name,
    reviewerRank: users.userRank,
    reviewerTrustScore: users.trustScore,
  })
    .from(corrections)
    .leftJoin(users, eq(corrections.reviewerId, users.id))
    .where(eq(corrections.recitationId, recitationId))
    .orderBy(desc(corrections.createdAt));
}

export async function getUserCorrections(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    correction: corrections,
    surahName: recitations.surahName,
    startVerse: recitations.startVerse,
    endVerse: recitations.endVerse,
  })
    .from(corrections)
    .leftJoin(recitations, eq(corrections.recitationId, recitations.id))
    .where(eq(corrections.reviewerId, userId))
    .orderBy(desc(corrections.createdAt))
    .limit(limit);
}

export async function updateCorrectionVerification(correctionId: number, matchesConsensus: boolean, verifiedByTeacher?: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(corrections)
    .set({ 
      matchesConsensus, 
      isVerified: true,
      verifiedByTeacher: verifiedByTeacher || null
    })
    .where(eq(corrections.id, correctionId));
}

// ==================== خوارزمية الثقة ====================

export async function calculateAndUpdateTrustScore(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  // حساب نقاط الثقة بناءً على التصحيحات الصحيحة
  const stats = await db.select({
    total: sql<number>`COUNT(*)`,
    correct: sql<number>`SUM(CASE WHEN matchesConsensus = true THEN 1 ELSE 0 END)`,
  })
    .from(corrections)
    .where(and(
      eq(corrections.reviewerId, userId),
      eq(corrections.isVerified, true)
    ));
  
  const { total, correct } = stats[0] || { total: 0, correct: 0 };
  
  if (total === 0) return;
  
  const trustScore = ((correct / total) * 100).toFixed(2);
  
  // تحديد الرتبة بناءً على نقاط الثقة وعدد التصحيحات
  let userRank: "student" | "bronze_reviewer" | "silver_reviewer" | "gold_reviewer" | "teacher" = "student";
  const score = parseFloat(trustScore);
  
  if (score >= 95 && total >= 500) {
    userRank = "teacher";
  } else if (score >= 90 && total >= 200) {
    userRank = "gold_reviewer";
  } else if (score >= 80 && total >= 50) {
    userRank = "silver_reviewer";
  } else if (score >= 70 && total >= 10) {
    userRank = "bronze_reviewer";
  }
  
  await updateUserStats(userId, {
    trustScore,
    userRank,
    totalCorrections: total,
    correctCorrections: correct,
  });
  
  return { trustScore, userRank, total, correct };
}

export async function finalizeRecitationReview(recitationId: number) {
  const db = await getDb();
  if (!db) return;
  
  const recitation = await getRecitationById(recitationId);
  if (!recitation) return;
  
  // التحقق من اكتمال المراجعات المطلوبة
  if (recitation.completedReviews < recitation.requiredReviews) return;
  
  // حساب النتيجة النهائية من متوسط تقييمات المراجعين
  const allCorrections = await getRecitationCorrections(recitationId);
  
  if (allCorrections.length === 0) return;
  
  const totalScore = allCorrections.reduce((sum, c) => sum + parseFloat(c.correction.score), 0);
  const avgScore = (totalScore / allCorrections.length).toFixed(2);
  
  // تحديد التوافق بين المراجعين
  const scores = allCorrections.map(c => parseFloat(c.correction.score));
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - parseFloat(avgScore), 2), 0) / scores.length;
  const isConsensus = variance < 100; // إذا كان التباين منخفضاً، يوجد توافق
  
  // تحديث حالة التصحيحات
  for (const c of allCorrections) {
    const matchesConsensus = Math.abs(parseFloat(c.correction.score) - parseFloat(avgScore)) < 15;
    await updateCorrectionVerification(c.correction.id, matchesConsensus);
    
    // تحديث نقاط ثقة المراجع
    await calculateAndUpdateTrustScore(c.correction.reviewerId);
  }
  
  // تحديث التلاوة
  await updateRecitation(recitationId, {
    status: "completed",
    finalScore: avgScore,
    finalFeedback: isConsensus ? "تم التحقق من التلاوة بتوافق المراجعين" : "تمت المراجعة مع بعض الاختلاف في التقييمات",
  });
  
  // إرسال إشعار لصاحب التلاوة
  await createNotification({
    userId: recitation.userId,
    type: "review_completed",
    title: "اكتملت مراجعة تلاوتك",
    message: `تم الانتهاء من مراجعة تلاوتك لسورة ${recitation.surahName}. النتيجة: ${avgScore}%`,
    relatedId: recitationId,
    relatedType: "recitation",
  });
}

// ==================== الإشعارات ====================

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({
    count: sql<number>`COUNT(*)`
  })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
  
  return result[0]?.count || 0;
}

// ==================== إشعار المصححين بالتلاوات الجديدة ====================

export async function notifyReviewersOfNewRecitation(recitationId: number, reciterName: string, surahName: string) {
  const db = await getDb();
  if (!db) return;
  
  // الحصول على المصححين المتصلين
  const reviewers = await getOnlineReviewers();
  
  for (const reviewer of reviewers) {
    await createNotification({
      userId: reviewer.id,
      type: "new_recitation",
      title: "تلاوة جديدة للمراجعة",
      message: `قام ${reciterName} بتسجيل تلاوة جديدة لسورة ${surahName}. هل تريد المراجعة؟`,
      relatedId: recitationId,
      relatedType: "recitation",
    });
  }
}

// ==================== السور القرآنية ====================

export async function getAllSurahs() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(surahs).orderBy(asc(surahs.number));
}

export async function getSurahByNumber(number: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(surahs).where(eq(surahs.number, number)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function seedSurahs() {
  const db = await getDb();
  if (!db) return;
  
  // التحقق من وجود السور
  const existing = await db.select().from(surahs).limit(1);
  if (existing.length > 0) return;
  
  const surahsData: InsertSurah[] = [
    { number: 1, nameArabic: "الفاتحة", nameEnglish: "Al-Fatiha", versesCount: 7, revelationType: "meccan" },
    { number: 2, nameArabic: "البقرة", nameEnglish: "Al-Baqarah", versesCount: 286, revelationType: "medinan" },
    { number: 3, nameArabic: "آل عمران", nameEnglish: "Aal-Imran", versesCount: 200, revelationType: "medinan" },
    { number: 4, nameArabic: "النساء", nameEnglish: "An-Nisa", versesCount: 176, revelationType: "medinan" },
    { number: 5, nameArabic: "المائدة", nameEnglish: "Al-Ma'idah", versesCount: 120, revelationType: "medinan" },
    { number: 36, nameArabic: "يس", nameEnglish: "Ya-Sin", versesCount: 83, revelationType: "meccan" },
    { number: 55, nameArabic: "الرحمن", nameEnglish: "Ar-Rahman", versesCount: 78, revelationType: "medinan" },
    { number: 56, nameArabic: "الواقعة", nameEnglish: "Al-Waqi'ah", versesCount: 96, revelationType: "meccan" },
    { number: 67, nameArabic: "الملك", nameEnglish: "Al-Mulk", versesCount: 30, revelationType: "meccan" },
    { number: 78, nameArabic: "النبأ", nameEnglish: "An-Naba", versesCount: 40, revelationType: "meccan" },
    { number: 112, nameArabic: "الإخلاص", nameEnglish: "Al-Ikhlas", versesCount: 4, revelationType: "meccan" },
    { number: 113, nameArabic: "الفلق", nameEnglish: "Al-Falaq", versesCount: 5, revelationType: "meccan" },
    { number: 114, nameArabic: "الناس", nameEnglish: "An-Nas", versesCount: 6, revelationType: "meccan" },
  ];
  
  await db.insert(surahs).values(surahsData);
}

// ==================== التسجيلات التجريبية ====================

export async function createDemoRecitation(data: InsertDemoRecitation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(demoRecitations).values(data);
  return result[0].insertId;
}

export async function getDemoRecitationsBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(demoRecitations)
    .where(eq(demoRecitations.sessionId, sessionId))
    .orderBy(desc(demoRecitations.createdAt));
}

export async function getDemoRecitationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(demoRecitations)
    .where(eq(demoRecitations.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDemoRecitation(id: number, data: Partial<InsertDemoRecitation>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(demoRecitations)
    .set(data)
    .where(eq(demoRecitations.id, id));
}

export async function deleteDemoRecitation(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(demoRecitations)
    .where(eq(demoRecitations.id, id));
}
