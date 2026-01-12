import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { 
  Mic2, 
  Zap,
  LayoutDashboard,
  CheckSquare,
  User as UserIcon,
  Award,
  TrendingUp,
  Calendar,
  LogOut,
  Bell,
  CheckCircle2,
  Clock,
  Star
} from "lucide-react";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";

export default function Profile() {
  const { user, logout } = useAuth();
  
  // جلب الملف الشخصي
  const { data: profile, isLoading: profileLoading } = trpc.user.getProfile.useQuery();
  
  // جلب الإحصائيات
  const { data: stats } = trpc.user.getStats.useQuery();
  
  // جلب التصحيحات
  const { data: corrections } = trpc.corrections.getUserCorrections.useQuery({});
  
  // جلب الإشعارات
  const { data: notifications } = trpc.notifications.getAll.useQuery({});
  
  // تحديث قراءة الإشعارات
  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation();

  const rankLabels: Record<string, string> = {
    student: "طالب",
    bronze_reviewer: "مصحح برونزي",
    silver_reviewer: "مصحح فضي",
    gold_reviewer: "مصحح ذهبي",
    teacher: "معلم",
  };

  const rankColors: Record<string, string> = {
    student: "bg-slate-600",
    bronze_reviewer: "gradient-bronze",
    silver_reviewer: "gradient-silver",
    gold_reviewer: "gradient-gold",
    teacher: "gradient-primary",
  };

  const rankProgress: Record<string, { current: number; next: string; required: number }> = {
    student: { current: 0, next: "مصحح برونزي", required: 10 },
    bronze_reviewer: { current: 10, next: "مصحح فضي", required: 50 },
    silver_reviewer: { current: 50, next: "مصحح ذهبي", required: 200 },
    gold_reviewer: { current: 200, next: "معلم", required: 500 },
    teacher: { current: 500, next: "أعلى رتبة", required: 500 },
  };

  const currentRank = profile?.userRank || "student";
  const progress = rankProgress[currentRank];
  const correctCorrections = stats?.correctCorrections || 0;
  const progressPercent = Math.min(100, ((correctCorrections - progress.current) / (progress.required - progress.current)) * 100);

  const notificationTypeLabels: Record<string, string> = {
    new_recitation: "تلاوة جديدة",
    review_completed: "اكتملت المراجعة",
    rank_upgrade: "ترقية",
    trust_update: "تحديث الثقة",
    correction_verified: "تم التحقق",
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* الشريط الجانبي */}
      <aside className="w-full lg:w-72 glass border-l border-border/50 flex flex-col p-6 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center glow-primary">
            <Zap className="text-primary-foreground w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter">الماهر</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-muted-foreground hover:bg-white/5">
              <LayoutDashboard className="w-5 h-5" />
              لوحة القيادة
            </button>
          </Link>
          <Link href="/record">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-muted-foreground hover:bg-white/5">
              <Mic2 className="w-5 h-5" />
              تسجيل تلاوة
            </button>
          </Link>
          <Link href="/review">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-muted-foreground hover:bg-white/5">
              <CheckSquare className="w-5 h-5" />
              تصحيح الأقران
            </button>
          </Link>
          <Link href="/profile">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all bg-primary text-primary-foreground font-bold">
              <UserIcon className="w-5 h-5" />
              الملف الشخصي
            </button>
          </Link>
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* بطاقة الملف الشخصي */}
            <div className="glass-card p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* الصورة الرمزية */}
                <div className={`w-24 h-24 rounded-full ${rankColors[currentRank]} flex items-center justify-center text-3xl font-bold text-white glow-primary`}>
                  {user?.name?.charAt(0) || "م"}
                </div>
                
                {/* المعلومات */}
                <div className="flex-1 text-center md:text-right space-y-2">
                  <h2 className="text-2xl font-bold">{user?.name || "مستخدم"}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${rankColors[currentRank]} text-white`}>
                      {rankLabels[currentRank]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      منذ {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ar-SA') : "غير محدد"}
                    </span>
                  </div>
                </div>
                
                {/* زر تسجيل الخروج */}
                <Button 
                  variant="outline" 
                  onClick={() => logout()}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </Button>
              </div>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-primary">{stats?.trustScore || "0.00"}%</div>
                <div className="text-sm text-muted-foreground">نقاط الثقة</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-emerald-400">{stats?.totalRecitations || 0}</div>
                <div className="text-sm text-muted-foreground">التلاوات</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{stats?.totalCorrections || 0}</div>
                <div className="text-sm text-muted-foreground">التصحيحات</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats?.correctCorrections || 0}</div>
                <div className="text-sm text-muted-foreground">تصحيحات صحيحة</div>
              </div>
            </div>

            {/* التقدم نحو الرتبة التالية */}
            {currentRank !== "teacher" && (
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    التقدم نحو الرتبة التالية
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {correctCorrections} / {progress.required} تصحيح صحيح
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded ${rankColors[currentRank]} text-white`}>
                    {rankLabels[currentRank]}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-primary font-medium">{progress.next}</span>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* آخر التصحيحات */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-400" />
                  آخر التصحيحات
                </h3>
                
                {corrections && corrections.length > 0 ? (
                  <div className="space-y-3">
                    {corrections.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="font-medium quran-font">{c.surahName}</p>
                          <p className="text-xs text-muted-foreground">
                            الآيات: {c.startVerse} - {c.endVerse}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-primary">{c.correction.score}%</p>
                          <p className="text-xs text-muted-foreground">
                            {c.correction.matchesConsensus === true && (
                              <span className="text-emerald-400">✓ صحيح</span>
                            )}
                            {c.correction.matchesConsensus === false && (
                              <span className="text-destructive">✗ مختلف</span>
                            )}
                            {c.correction.matchesConsensus === null && (
                              <span className="text-yellow-400">⏳ قيد التحقق</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    لم تقدم أي تصحيحات بعد
                  </p>
                )}
              </div>

              {/* الإشعارات */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-400" />
                    الإشعارات
                  </h3>
                  {notifications && notifications.some(n => !n.isRead) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAllAsRead.mutate()}
                    >
                      تحديد الكل كمقروء
                    </Button>
                  )}
                </div>
                
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.slice(0, 10).map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-xl ${n.isRead ? 'bg-white/5' : 'bg-primary/10 border border-primary/20'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    لا توجد إشعارات
                  </p>
                )}
              </div>
            </div>

            {/* شارات الإنجاز */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                شارات الإنجاز
              </h3>
              
              <div className="flex flex-wrap gap-4">
                {(stats?.totalRecitations || 0) >= 1 && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                      <Mic2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium">أول تلاوة</span>
                  </div>
                )}
                
                {(stats?.totalCorrections || 0) >= 1 && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 gradient-bronze rounded-full flex items-center justify-center">
                      <CheckSquare className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium">أول تصحيح</span>
                  </div>
                )}
                
                {(stats?.totalCorrections || 0) >= 10 && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 gradient-silver rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium">10 تصحيحات</span>
                  </div>
                )}
                
                {parseFloat(stats?.trustScore || "0") >= 80 && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium">ثقة عالية</span>
                  </div>
                )}
                
                {(stats?.totalRecitations || 0) === 0 && (stats?.totalCorrections || 0) === 0 && (
                  <p className="text-muted-foreground text-sm">
                    ابدأ بتسجيل تلاوات أو تقديم تصحيحات للحصول على شارات الإنجاز
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
