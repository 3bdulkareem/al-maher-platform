import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Mic2, 
  CheckSquare, 
  User as UserIcon, 
  TrendingUp, 
  Award,
  Globe,
  Bell,
  Search,
  Zap,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

// مكون بطاقة الإحصائيات
function StatCard({ 
  label, 
  value, 
  icon, 
  colorClass 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
  colorClass: string;
}) {
  return (
    <div className="glass-card p-6 space-y-4 glass-hover">
      <div className="flex items-center justify-between">
        <span className={`${colorClass}`}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

// مكون بطاقة التلاوة
function RecitationCard({ 
  surahName, 
  verses, 
  status, 
  peerCount, 
  date 
}: { 
  surahName: string; 
  verses: string; 
  status: string; 
  peerCount: number; 
  date: Date;
}) {
  const statusColors: Record<string, string> = {
    pending_ai: "bg-yellow-500/20 text-yellow-400",
    ai_reviewed: "bg-blue-500/20 text-blue-400",
    pending_peers: "bg-purple-500/20 text-purple-400",
    under_review: "bg-orange-500/20 text-orange-400",
    completed: "bg-emerald-500/20 text-emerald-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  const statusLabels: Record<string, string> = {
    pending_ai: "في انتظار التحليل",
    ai_reviewed: "تم التحليل الآلي",
    pending_peers: "في انتظار المراجعة",
    under_review: "قيد المراجعة",
    completed: "مكتملة",
    rejected: "مرفوضة",
  };

  return (
    <div className="glass-card p-4 space-y-3 glass-hover">
      <div className="flex items-center justify-between">
        <h4 className="font-bold quran-font text-lg">{surahName}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || statusColors.pending_ai}`}>
          {statusLabels[status] || status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">الآيات: {verses}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>المراجعات: {peerCount}</span>
        <span>{new Date(date).toLocaleDateString('ar-SA')}</span>
      </div>
    </div>
  );
}

// مكون المصحح المتصل
function OnlineReviewer({ 
  name, 
  rank, 
  trustScore 
}: { 
  name: string; 
  rank: string; 
  trustScore: string;
}) {
  const rankLabels: Record<string, string> = {
    student: "طالب",
    bronze_reviewer: "مصحح برونزي",
    silver_reviewer: "مصحح فضي",
    gold_reviewer: "مصحح ذهبي",
    teacher: "معلم",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
          {name?.charAt(0) || "م"}
        </div>
        <div>
          <p className="text-sm font-medium">{name || "مصحح"}</p>
          <p className="text-xs text-muted-foreground">{rankLabels[rank] || rank}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{trustScore}%</span>
        <div className="online-indicator" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  
  // جلب إحصائيات المستخدم
  const { data: stats, isLoading: statsLoading } = trpc.user.getStats.useQuery();
  
  // جلب تلاوات المستخدم
  const { data: recitations, isLoading: recitationsLoading } = trpc.recitations.getUserRecitations.useQuery({});
  
  // جلب المصححين المتصلين
  const { data: onlineReviewers } = trpc.user.getOnlineReviewers.useQuery();
  
  // جلب عدد الإشعارات غير المقروءة
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery();
  
  // تحديث حالة الاتصال
  const updateOnlineStatus = trpc.user.updateOnlineStatus.useMutation();
  
  useEffect(() => {
    updateOnlineStatus.mutate({ isOnline: true });
    
    return () => {
      updateOnlineStatus.mutate({ isOnline: false });
    };
  }, []);

  const rankLabels: Record<string, string> = {
    student: "طالب",
    bronze_reviewer: "مصحح برونزي",
    silver_reviewer: "مصحح فضي",
    gold_reviewer: "مصحح ذهبي",
    teacher: "معلم",
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
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all bg-primary text-primary-foreground font-bold">
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
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-muted-foreground hover:bg-white/5">
              <UserIcon className="w-5 h-5" />
              الملف الشخصي
            </button>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-border/50">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              {user?.name?.charAt(0) || "م"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name || "مستخدم"}</p>
              <p className="text-xs text-muted-foreground">{rankLabels[stats?.userRank || "student"]}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* الهيدر */}
        <header className="sticky top-0 z-40 glass border-b border-border/50 px-8 h-20 flex items-center justify-between">
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="ابحث عن سور، آيات، أو مصححين..." 
                className="w-full bg-white/5 border border-border/50 rounded-full py-2 pr-12 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-6 h-6" />
              {unreadCount && unreadCount > 0 && (
                <span className="absolute top-1 left-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="h-8 w-px bg-border/50" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-medium">نقاط الثقة</p>
              <p className="text-lg font-bold text-primary">{stats?.trustScore || "0.00"}%</p>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <div className="flex-1 p-8">
          <div className="space-y-8 animate-in">
            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label="درجة الموثوقية" 
                value={`${stats?.trustScore || "0.00"}%`} 
                icon={<Zap className="w-6 h-6" />} 
                colorClass="text-yellow-400" 
              />
              <StatCard 
                label="إجمالي التلاوات" 
                value={stats?.totalRecitations || 0} 
                icon={<Mic2 className="w-6 h-6" />} 
                colorClass="text-emerald-400" 
              />
              <StatCard 
                label="تصحيحات الأقران" 
                value={stats?.totalCorrections || 0} 
                icon={<CheckSquare className="w-6 h-6" />} 
                colorClass="text-blue-400" 
              />
              <StatCard 
                label="الرتبة الحالية" 
                value={rankLabels[stats?.userRank || "student"]} 
                icon={<Award className="w-6 h-6" />} 
                colorClass="text-purple-400" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* التلاوات الأخيرة */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    نشاطاتك الأخيرة
                  </h2>
                  <Link href="/record">
                    <Button variant="ghost" size="sm" className="text-primary gap-1">
                      تسجيل جديد
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                
                {recitationsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="glass-card p-4 h-32 animate-pulse" />
                    ))}
                  </div>
                ) : recitations && recitations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recitations.slice(0, 4).map(r => (
                      <RecitationCard 
                        key={r.id}
                        surahName={r.surahName}
                        verses={`${r.startVerse}-${r.endVerse}`}
                        status={r.status}
                        peerCount={r.completedReviews}
                        date={r.createdAt}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <Mic2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لم تسجل أي تلاوات بعد</p>
                    <Link href="/record">
                      <Button className="mt-4 gradient-primary text-primary-foreground">
                        سجل تلاوتك الأولى
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* شبكة المصححين */}
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  شبكة المصححين الآن
                </h2>
                <div className="space-y-4">
                  {onlineReviewers && onlineReviewers.length > 0 ? (
                    onlineReviewers.slice(0, 5).map((reviewer, i) => (
                      <OnlineReviewer 
                        key={reviewer.id}
                        name={reviewer.name || `مصحح #${i + 1}`}
                        rank={reviewer.userRank}
                        trustScore={reviewer.trustScore}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      لا يوجد مصححون متصلون حالياً
                    </p>
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  جاري مطابقة التلاوات عبر خوارزمية الثقة...
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
