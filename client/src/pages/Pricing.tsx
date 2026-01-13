import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { CheckCircle2, Zap, Award, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
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
            <Link href="/about">
              <a className="text-muted-foreground hover:text-foreground transition-colors">عن المنصة</a>
            </Link>
            <a href="#plans" className="text-muted-foreground hover:text-foreground transition-colors">الخطط</a>
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
              <span className="gradient-primary-text">خطط مرنة وبأسعار معقولة</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              اختر الخطة التي تناسب احتياجاتك والبدء في تحسين تلاوتك اليوم
            </p>
          </div>
        </div>
      </section>

      {/* الخطط */}
      <section id="plans" className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* الخطة الأساسية */}
            <PricingCard
              name="الخطة الأساسية"
              price="مجاني"
              description="مثالية للمبتدئين"
              features={[
                "تسجيل تلاوة واحدة شهرياً",
                "تحليل أولي بالذكاء الاصطناعي",
                "تصحيح من مصحح واحد",
                "إحصائيات أساسية",
              ]}
              buttonText="ابدأ الآن"
              highlighted={false}
            />

            {/* الخطة المتقدمة */}
            <PricingCard
              name="الخطة المتقدمة"
              price="29.99"
              currency="ر.س"
              period="/شهر"
              description="الأكثر شيوعاً"
              features={[
                "تسجيل تلاوات غير محدودة",
                "تحليل متقدم بالذكاء الاصطناعي",
                "تصحيح من 3 مصححين",
                "إحصائيات مفصلة",
                "أولوية في المراجعة",
                "تقارير أسبوعية",
              ]}
              buttonText="اشترك الآن"
              highlighted={true}
            />

            {/* خطة المعلم */}
            <PricingCard
              name="خطة المعلم"
              price="99.99"
              currency="ر.س"
              period="/شهر"
              description="للمعلمين والمتقنين"
              features={[
                "جميع ميزات الخطة المتقدمة",
                "إمكانية تصحيح التلاوات",
                "كسب الدخل من التصحيح",
                "شهادة رسمية",
                "دعم أولوي",
                "وصول إلى أدوات متقدمة",
              ]}
              buttonText="اشترك الآن"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* المقارنة */}
      <section className="py-20 glass">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">مقارنة الخطط</h2>
            <p className="text-muted-foreground">
              اختر الخطة التي تناسب احتياجاتك بشكل أفضل
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-4 px-4 font-bold">الميزة</th>
                  <th className="text-center py-4 px-4 font-bold">الأساسية</th>
                  <th className="text-center py-4 px-4 font-bold">المتقدمة</th>
                  <th className="text-center py-4 px-4 font-bold">المعلم</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-right">التسجيلات الشهرية</td>
                  <td className="py-4 px-4 text-center">1</td>
                  <td className="py-4 px-4 text-center">غير محدود</td>
                  <td className="py-4 px-4 text-center">غير محدود</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-right">عدد المصححين</td>
                  <td className="py-4 px-4 text-center">1</td>
                  <td className="py-4 px-4 text-center">3</td>
                  <td className="py-4 px-4 text-center">3</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-right">التحليل الآلي</td>
                  <td className="py-4 px-4 text-center"><CheckCircle2 className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><CheckCircle2 className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><CheckCircle2 className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-right">التقارير الأسبوعية</td>
                  <td className="py-4 px-4 text-center">-</td>
                  <td className="py-4 px-4 text-center"><CheckCircle2 className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><CheckCircle2 className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-right">تصحيح التلاوات</td>
                  <td className="py-4 px-4 text-center">-</td>
                  <td className="py-4 px-4 text-center">-</td>
                  <td className="py-4 px-4 text-center"><CheckCircle2 className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-right">كسب الدخل</td>
                  <td className="py-4 px-4 text-center">-</td>
                  <td className="py-4 px-4 text-center">-</td>
                  <td className="py-4 px-4 text-center"><CheckCircle2 className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-right">الشهادة الرسمية</td>
                  <td className="py-4 px-4 text-center">-</td>
                  <td className="py-4 px-4 text-center">-</td>
                  <td className="py-4 px-4 text-center"><CheckCircle2 className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* الأسئلة الشائعة */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">الأسئلة الشائعة</h2>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="هل يمكنني تغيير الخطة في أي وقت؟"
              answer="نعم، يمكنك تغيير خطتك في أي وقت. التغيير سيسري من الفترة الفوترة التالية."
            />
            <FAQItem
              question="هل هناك فترة تجريبية مجانية؟"
              answer="نعم، جميع المستخدمين الجدد يحصلون على فترة تجريبية مجانية لمدة 7 أيام للخطة المتقدمة."
            />
            <FAQItem
              question="هل يمكنني الحصول على استرجاع الأموال؟"
              answer="نعم، نقدم ضمان استرجاع الأموال لمدة 30 يوم إذا لم تكن راضياً عن الخدمة."
            />
            <FAQItem
              question="كيف أبدأ كمصحح؟"
              answer="للبدء كمصحح، تحتاج إلى الاشتراك في خطة المعلم والحصول على التأهيل اللازم."
            />
          </div>
        </div>
      </section>

      {/* الدعوة للعمل */}
      <section className="py-20 glass">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl font-bold">جاهز للبدء؟</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            انضم إلى آلاف المستخدمين الذين يحسنون تلاواتهم مع منصة الماهر
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = getLoginUrl()}
            className="gradient-primary text-primary-foreground font-bold gap-2 glow-primary"
          >
            <BookOpen className="w-5 h-5" />
            ابدأ الآن مجاناً
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

function PricingCard({
  name,
  price,
  currency,
  period,
  description,
  features,
  buttonText,
  highlighted,
}: {
  name: string;
  price: string;
  currency?: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted: boolean;
}) {
  return (
    <div
      className={`glass-card p-8 space-y-6 flex flex-col ${
        highlighted ? "ring-2 ring-primary scale-105" : ""
      }`}
    >
      <div>
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{price}</span>
          {currency && <span className="text-muted-foreground">{currency}</span>}
        </div>
        {period && <p className="text-muted-foreground text-sm">{period}</p>}
      </div>

      <Button
        onClick={() => window.location.href = getLoginUrl()}
        className={`w-full font-bold ${
          highlighted
            ? "gradient-primary text-primary-foreground glow-primary"
            : "glass-hover"
        }`}
      >
        {buttonText}
      </Button>

      <div className="space-y-3 flex-1">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="glass-card p-6 space-y-3">
      <h3 className="font-bold text-lg">{question}</h3>
      <p className="text-muted-foreground">{answer}</p>
    </div>
  );
}
