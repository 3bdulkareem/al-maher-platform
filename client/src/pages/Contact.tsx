import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Zap, Mail, Phone, MapPin, Send } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // في التطبيق الحقيقي، سيتم إرسال البيانات إلى السيرفر
    toast.success("تم استلام رسالتك! سنرد عليك قريباً.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
            <Link href="/pricing">
              <a className="text-muted-foreground hover:text-foreground transition-colors">الأسعار</a>
            </Link>
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
              <span className="gradient-primary-text">تواصل معنا</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              لدينا فريق دعم متخصص جاهز للإجابة على جميع استفساراتك
            </p>
          </div>
        </div>
      </section>

      {/* معلومات التواصل والنموذج */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* معلومات التواصل */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">معلومات التواصل</h2>
                <p className="text-muted-foreground mb-8">
                  تواصل معنا عبر أي من القنوات التالية وسنرد عليك في أسرع وقت
                </p>
              </div>

              <ContactInfo
                icon={<Mail className="w-6 h-6" />}
                title="البريد الإلكتروني"
                content="modarrib@gmail.com"
                subtext="نرد على جميع الرسائل خلال 24 ساعة"
              />

              <ContactInfo
                icon={<Phone className="w-6 h-6" />}
                title="رقم الجوال"
                content="0568348973"
                subtext="متاح من الأحد إلى الخميس 9 صباحاً - 6 مساءً"
              />

              <ContactInfo
                icon={<MapPin className="w-6 h-6" />}
                title="الموقع"
                content="الرياض، المملكة العربية السعودية"
                subtext="مقر الشركة الرئيسي"
              />
            </div>

            {/* نموذج التواصل */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold">أرسل لنا رسالة</h2>

              <div className="space-y-2">
                <label className="block text-sm font-medium">الاسم</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full glass-card px-4 py-3 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="أدخل اسمك"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full glass-card px-4 py-3 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">الموضوع</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full glass-card px-4 py-3 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="موضوع الرسالة"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">الرسالة</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full glass-card px-4 py-3 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground font-bold gap-2 glow-primary"
              >
                <Send className="w-4 h-4" />
                إرسال الرسالة
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* الدعم السريع */}
      <section className="py-20 glass">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">الدعم السريع</h2>
            <p className="text-muted-foreground">
              إجابات سريعة على الأسئلة الشائعة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <SupportCard
              title="كيفية البدء"
              description="تعرف على خطوات البدء السهلة والسريعة مع منصة الماهر"
            />
            <SupportCard
              title="الأسئلة الشائعة"
              description="اطلع على إجابات الأسئلة التي يسألها المستخدمون بشكل متكرر"
            />
            <SupportCard
              title="دليل المستخدم"
              description="اقرأ الدليل الشامل لجميع ميزات المنصة والخدمات"
            />
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

function ContactInfo({
  icon,
  title,
  content,
  subtext,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  subtext: string;
}) {
  return (
    <div className="glass-card p-6 space-y-3 glass-hover">
      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground">
        {icon}
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="font-semibold text-primary">{content}</p>
      <p className="text-sm text-muted-foreground">{subtext}</p>
    </div>
  );
}

function SupportCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-6 text-center space-y-3 glass-hover cursor-pointer">
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
      <Button variant="outline" size="sm" className="w-full glass-hover">
        اقرأ المزيد
      </Button>
    </div>
  );
}
