import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { 
  Mic2, 
  Users, 
  Award, 
  Zap, 
  CheckCircle2, 
  ArrowLeft,
  BookOpen,
  Shield,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* الهيدر */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center glow-primary">
              <Zap className="w-6 h-6 text-primary-foreground fill-current" />
            </div>
            <h1 className="text-xl font-bold">الماهر</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">المميزات</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">كيف يعمل</a>
            <a href="#ranks" className="text-muted-foreground hover:text-foreground transition-colors">نظام الرتب</a>
            <Link href="/about">
              <a className="text-muted-foreground hover:text-foreground transition-colors">عن المنصة</a>
            </Link>
            <Link href="/pricing">
              <a className="text-muted-foreground hover:text-foreground transition-colors">الأسعار</a>
            </Link>
            <Link href="/contact">
              <a className="text-muted-foreground hover:text-foreground transition-colors">التواصل</a>
            </Link>
          </nav>
          
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="gradient-primary text-primary-foreground font-bold gap-2">
                لوحة القيادة
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={() => window.location.href = getLoginUrl()}
              className="gradient-primary text-primary-foreground font-bold"
            >
              ابدأ الآن
            </Button>
          )}
        </div>
      </header>

      {/* القسم الرئيسي */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm">
              <span className="online-indicator" />
              <span className="text-muted-foreground">منصة تعليمية مبتكرة</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="gradient-primary-text">الحوكمة التشاركية</span>
              <br />
              لضبط تلاوة القرآن
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              منصة تعتمد على نموذج الاقتصاد التشاركي لربط المتعلمين بالمتقنين، 
              مدعومة بنظام نقاط الثقة والذكاء الاصطناعي لضمان جودة التصحيح
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/record">
                  <Button size="lg" className="gradient-primary text-primary-foreground font-bold gap-2 glow-primary">
                    <Mic2 className="w-5 h-5" />
                    سجل تلاوتك الآن
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = getLoginUrl()}
                  className="gradient-primary text-primary-foreground font-bold gap-2 glow-primary"
                >
                  <Mic2 className="w-5 h-5" />
                  ابدأ رحلتك
                </Button>
              )}
              <Link href="/about">
                <Button size="lg" variant="outline" className="gap-2 glass-hover">
                  <BookOpen className="w-5 h-5" />
                  تعرف على المنصة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* المميزات */}
      <section id="features" className="py-20 relative">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">لماذا منصة الماهر؟</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              نجمع بين قوة الذكاء الاصطناعي وحكمة المجتمع لتقديم تجربة تعليمية فريدة
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="الفرز الآلي بالذكاء الاصطناعي"
              description="يعمل الذكاء الاصطناعي كبوابة أولى لتصحيح الأخطاء الجلية وتقديم تحليل أولي"
              gradient="gradient-primary"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="التصحيح التشاركي"
              description="يتم تمرير التلاوة لعدد من المصححين الأقران الذين تأهلوا عبر النظام"
              gradient="gradient-primary"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="خوارزمية الثقة"
              description="نظام تقييم متقدم يضمن حوكمة الجودة في بيئة مفتوحة"
              gradient="gradient-gold"
            />
            <FeatureCard
              icon={<Award className="w-6 h-6" />}
              title="نظام الرتب والتصنيفات"
              description="ارتقِ من طالب إلى معلم من خلال مسار التمكين داخل المنصة"
              gradient="gradient-silver"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="إحصائيات متقدمة"
              description="تتبع تقدمك وأدائك من خلال لوحة قيادة شاملة"
              gradient="gradient-bronze"
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="متاح على مدار الساعة"
              description="خدمة تصحيح التلاوة متاحة 24/7 دون طوابير انتظار"
              gradient="gradient-primary"
            />
          </div>
        </div>
      </section>

      {/* كيف يعمل */}
      <section id="how-it-works" className="py-20 glass">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">كيف يعمل النظام؟</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ثلاث خطوات بسيطة للحصول على تصحيح دقيق لتلاوتك
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="سجل تلاوتك"
              description="اختر السورة والآيات وسجل تلاوتك بسهولة من خلال واجهة تفاعلية"
            />
            <StepCard
              number={2}
              title="التحليل الآلي"
              description="يقوم الذكاء الاصطناعي بتحليل تلاوتك وتقديم ملاحظات أولية"
            />
            <StepCard
              number={3}
              title="مراجعة الأقران"
              description="يراجع المصححون المعتمدون تلاوتك ويقدمون تقييماً شاملاً"
            />
          </div>
        </div>
      </section>

      {/* نظام الرتب */}
      <section id="ranks" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">نظام الرتب والتصنيفات</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              كلما زادت دقة تصحيحاتك، ارتفع تصنيفك وزادت ثقة المجتمع بك
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <RankCard rank="طالب" description="المستوى الابتدائي" color="bg-slate-600" />
            <RankCard rank="مصحح برونزي" description="10+ تصحيحات صحيحة" color="gradient-bronze" />
            <RankCard rank="مصحح فضي" description="50+ تصحيحات صحيحة" color="gradient-silver" />
            <RankCard rank="مصحح ذهبي" description="200+ تصحيحات صحيحة" color="gradient-gold" />
            <RankCard rank="معلم" description="500+ تصحيحات صحيحة" color="gradient-primary" />
          </div>
        </div>
      </section>

      {/* الفوتر */}
      <footer className="py-8 border-t border-border/50">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 منصة الماهر - الحوكمة القرآنية التشاركية</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  gradient: string;
}) {
  return (
    <div className="glass-card p-6 space-y-4 glass-hover">
      <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center`}>
        <span className="text-primary-foreground">{icon}</span>
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-primary-foreground glow-primary">
        {number}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function RankCard({ 
  rank, 
  description, 
  color 
}: { 
  rank: string; 
  description: string; 
  color: string;
}) {
  return (
    <div className="glass-card p-6 text-center space-y-3 min-w-[160px]">
      <div className={`w-12 h-12 ${color} rounded-full mx-auto flex items-center justify-center`}>
        <Award className="w-6 h-6 text-white" />
      </div>
      <h4 className="font-bold">{rank}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
