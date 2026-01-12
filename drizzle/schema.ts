import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين - يحتوي على معلومات المستخدم ونقاط الثقة والرتبة
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // نظام الرتب والثقة
  userRank: mysqlEnum("userRank", ["student", "bronze_reviewer", "silver_reviewer", "gold_reviewer", "teacher"])
    .default("student").notNull(),
  trustScore: decimal("trustScore", { precision: 5, scale: 2 }).default("0.00").notNull(),
  totalRecitations: int("totalRecitations").default(0).notNull(),
  totalCorrections: int("totalCorrections").default(0).notNull(),
  correctCorrections: int("correctCorrections").default(0).notNull(),
  
  // حالة الاتصال
  isOnline: boolean("isOnline").default(false).notNull(),
  lastActiveAt: timestamp("lastActiveAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول التلاوات - يحتوي على معلومات التلاوات المسجلة
 */
export const recitations = mysqlTable("recitations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // معلومات التلاوة
  surahName: varchar("surahName", { length: 100 }).notNull(),
  surahNumber: int("surahNumber").notNull(),
  startVerse: int("startVerse").notNull(),
  endVerse: int("endVerse").notNull(),
  
  // ملف الصوت
  audioUrl: text("audioUrl").notNull(),
  audioKey: varchar("audioKey", { length: 255 }).notNull(),
  durationSeconds: int("durationSeconds"),
  
  // حالة المراجعة
  status: mysqlEnum("status", [
    "pending_ai",      // في انتظار تحليل الذكاء الاصطناعي
    "ai_reviewed",     // تم التحليل الآلي
    "pending_peers",   // في انتظار مراجعة الأقران
    "under_review",    // قيد المراجعة
    "completed",       // مكتملة
    "rejected"         // مرفوضة
  ]).default("pending_ai").notNull(),
  
  // نتائج التحليل الآلي
  aiAnalysis: text("aiAnalysis"),
  aiScore: decimal("aiScore", { precision: 5, scale: 2 }),
  
  // عدد المراجعات المطلوبة والمكتملة
  requiredReviews: int("requiredReviews").default(3).notNull(),
  completedReviews: int("completedReviews").default(0).notNull(),
  
  // النتيجة النهائية
  finalScore: decimal("finalScore", { precision: 5, scale: 2 }),
  finalFeedback: text("finalFeedback"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recitation = typeof recitations.$inferSelect;
export type InsertRecitation = typeof recitations.$inferInsert;

/**
 * جدول التصحيحات - يحتوي على تصحيحات المراجعين
 */
export const corrections = mysqlTable("corrections", {
  id: int("id").autoincrement().primaryKey(),
  recitationId: int("recitationId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  
  // التقييم
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  feedback: text("feedback").notNull(),
  
  // أنواع الأخطاء المكتشفة
  tajweedErrors: int("tajweedErrors").default(0).notNull(),
  pronunciationErrors: int("pronunciationErrors").default(0).notNull(),
  memorizationErrors: int("memorizationErrors").default(0).notNull(),
  
  // تفاصيل الأخطاء (JSON)
  errorDetails: text("errorDetails"),
  
  // هل تم التحقق من صحة هذا التصحيح؟
  isVerified: boolean("isVerified").default(false).notNull(),
  verifiedByTeacher: int("verifiedByTeacher"),
  
  // هل يتوافق مع تصحيحات الآخرين؟
  matchesConsensus: boolean("matchesConsensus"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Correction = typeof corrections.$inferSelect;
export type InsertCorrection = typeof corrections.$inferInsert;

/**
 * جدول الإشعارات
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  type: mysqlEnum("type", [
    "new_recitation",      // تلاوة جديدة للمراجعة
    "review_completed",    // اكتملت مراجعة تلاوتك
    "rank_upgrade",        // ترقية في الرتبة
    "trust_update",        // تحديث نقاط الثقة
    "correction_verified"  // تم التحقق من تصحيحك
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // معرف العنصر المرتبط (تلاوة أو تصحيح)
  relatedId: int("relatedId"),
  relatedType: mysqlEnum("relatedType", ["recitation", "correction"]),
  
  isRead: boolean("isRead").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * جدول السور القرآنية (للمرجعية)
 */
export const surahs = mysqlTable("surahs", {
  id: int("id").autoincrement().primaryKey(),
  number: int("number").notNull().unique(),
  nameArabic: varchar("nameArabic", { length: 100 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 100 }).notNull(),
  versesCount: int("versesCount").notNull(),
  revelationType: mysqlEnum("revelationType", ["meccan", "medinan"]).notNull(),
});

export type Surah = typeof surahs.$inferSelect;
export type InsertSurah = typeof surahs.$inferInsert;
