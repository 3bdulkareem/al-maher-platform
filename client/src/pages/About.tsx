import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  CheckCircle2,
  Users,
  Zap,
  Award,
  BookOpen,
  Target,
  Heart,
  Globe,
} from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* الهيدر */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center glow-primary">
                <Zap className="w-6 h-6 text-primary-foreground fill-current" />
              </div>
              <h1 className="text-xl font-bold">الماهر</h1>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <a className="text-muted-foreground hover:text-foreground transition-colors">الرئيسية</a>
            </Link>
            <a href="#mission" className="text-muted-foreground hover:text-foreground transition-colors">الرسالة</a>
            <a href="#values" className="text-muted-foreground hover:text-foreground transition-colors">القيم</a>
            <a href="#team" className="text-muted-foreground hover:text-foreground transition-colors">الفريق</a>
          </nav>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="gradient-primary text-primary-foreground font-bold"
          >
            ابدأ الآن
          </Button>
        </div>
      </header>

      {/* القسم الرئيسي */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="gradient-primary-text">عن منصة الماهر</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              منصة تعليمية مبتكرة تجمع بين قوة الذكاء الاصطناعي وحكمة المجتمع
              لتحسين تلاوة القرآن الكريم بطريقة فعالة وموثوقة
            </p>
          </div>
        </div>
      </section>

      {/* الرسالة والرؤية */}
      <section id="mission" className="py-20 glass">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm">
                <Target className="w-4 h-4 text-primary" />
                <span>رسالتنا</span>
              </div>
              <h2 className="text-3xl font-bold">تحسين تلاوة القرآن الكريم</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                نسعى إلى توفير منصة تعليمية متقدمة تمكّن ملايين المسلمين من تحسين تلاوتهم
                للقرآن الكريم من خلال نموذج تعاوني يجمع بين التكنولوجيا والخبرة البشرية.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">تصحيح فوري وموثوق من مصححين معتمدين</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">نظام عادل وشفاف لتقييم الأداء</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">فرص حقيقية للمصححين لكسب الدخل</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm">
                <Globe className="w-4 h-4 text-accent" />
                <span>رؤيتنا</span>
              </div>
              <h2 className="text-3xl font-bold">مجتمع عالمي متقن</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                نتطلع إلى بناء مجتمع عالمي من المتقنين والمعلمين الذين يعملون معاً
                لرفع مستوى التلاوة والتجويد في جميع أنحاء العالم.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">منصة متعددة اللغات وسهلة الاستخدام</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">شراكات مع المعاهد والجامعات الإسلامية</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">تأثير اجتماعي إيجابي على ملايين المسلمين</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* القيم الأساسية */}
      <section id="values" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">قيمنا الأساسية</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              نبني منصتنا على أسس قوية من القيم التي تضمن الجودة والشفافية والعدالة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard
              icon={<Heart className="w-8 h-8" />}
              title="الإخلاص"
              description="نعمل بإخلاص لخدمة دين الله وتحسين تلاوة كتابه الكريم"
            />
            <ValueCard
              icon={<CheckCircle2 className="w-8 h-8" />}
              title="الجودة"
              description="نضمن أعلى مستويات الجودة في التصحيح والتقييم"
            />
            <ValueCard
              icon={<Users className="w-8 h-8" />}
              title="التشاركية"
              description="نؤمن بقوة العمل الجماعي والمجتمع المتفاعل"
            />
            <ValueCard
              icon={<Zap className="w-8 h-8" />}
              title="الابتكار"
              description="نستخدم أحدث التقنيات لتقديم تجربة متقدمة"
            />
            <ValueCard
              icon={<Award className="w-8 h-8" />}
              title="العدالة"
              description="نوفر نظاماً عادلاً وشفافاً لجميع المستخدمين"
            />
            <ValueCard
              icon={<Globe className="w-8 h-8" />}
              title="الشمول"
              description="نسعى لخدمة جميع المسلمين بغض النظر عن مستواهم"
            />
          </div>
        </div>
      </section>

      {/* الإحصائيات */}
      <section className="py-20 glass">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <StatCard number="10K+" label="مستخدم نشط" />
            <StatCard number="50K+" label="تلاوة تم تصحيحها" />
            <StatCard number="99.5%" label="معدل الرضا" />
            <StatCard number="24/7" label="دعم مستمر" />
          </div>
        </div>
      </section>

      {/* الفريق */}
      <section id="team" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">فريقنا</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              فريق متخصص من المهندسين والمتقنين والمعلمين الملتزمين برسالتنا
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TeamMember
              name="أحمد محمد"
              role="المؤسس والرئيس التنفيذي"
              bio="متقن للقرآن الكريم مع خبرة 15 سنة في التعليم الإسلامي"
            />
            <TeamMember
              name="فاطمة علي"
              role="مديرة التطوير التقني"
              bio="مهندسة برمجيات متخصصة في الذكاء الاصطناعي والتعلم الآلي"
            />
            <TeamMember
              name="محمود حسن"
              role="مدير العمليات"
              bio="خبير في إدارة المجتمعات الرقمية والعمليات التشغيلية"
            />
          </div>
        </div>
      </section>

      {/* الدعوة للعمل */}
      <section className="py-20 glass">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl font-bold">انضم إلى مجتمع الماهر</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            كن جزءاً من حركة تحسين تلاوة القرآن الكريم حول العالم
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = getLoginUrl()}
            className="gradient-primary text-primary-foreground font-bold gap-2 glow-primary"
          >
            <BookOpen className="w-5 h-5" />
            ابدأ رحلتك الآن
          </Button>
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

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-6 space-y-4 glass-hover text-center">
      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto text-primary-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="text-4xl font-bold gradient-primary-text">{number}</div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

function TeamMember({
  name,
  role,
  bio,
}: {
  name: string;
  role: string;
  bio: string;
}) {
  return (
    <div className="glass-card p-6 text-center space-y-4">
      <div className="w-24 h-24 gradient-primary rounded-full mx-auto flex items-center justify-center">
        <Users className="w-12 h-12 text-primary-foreground" />
      </div>
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="text-sm text-primary font-semibold">{role}</p>
      <p className="text-sm text-muted-foreground">{bio}</p>
    </div>
  );
}
