import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Mic2,
  Square,
  Play,
  Download,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Demo() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("لا يمكن الوصول إلى الميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeRecitation = async () => {
    if (!audioBlob) {
      toast.error("يرجى تسجيل تلاوة أولاً");
      return;
    }

    setIsAnalyzing(true);
    // محاكاة التحليل
    setTimeout(() => {
      setAnalysisResults({
        surah: "سورة الفاتحة",
        ayah: "الآية 1-3",
        duration: "45 ثانية",
        issues: [
          {
            type: "error",
            text: "تفخيم غير صحيح في كلمة (الرحمن)",
            time: "0:15",
          },
          {
            type: "warning",
            text: "توقف قصير في الوصل بين الآيات",
            time: "0:32",
          },
          {
            type: "success",
            text: "تجويد ممتاز في كلمة (الحمد)",
            time: "0:08",
          },
        ],
        score: 78,
        feedback:
          "تلاوة جيدة جداً! يحتاج فقط إلى تصحيح التفخيم والترقيق وتحسين التوقفات.",
      });
      setIsAnalyzing(false);
      toast.success("تم تحليل التلاوة بنجاح!");
    }, 2000);
  };

  const downloadRecording = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recitation.webm";
    a.click();
    URL.revokeObjectURL(url);
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
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="gradient-primary text-primary-foreground font-bold"
          >
            تسجيل الدخول
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
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm">
              <span className="online-indicator" />
              <span className="text-muted-foreground">جرب المنصة الآن</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="gradient-primary-text">اختبر تلاوتك</span>
              <br />
              بدون تسجيل
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              سجل تلاوتك الآن واحصل على تحليل فوري من الذكاء الاصطناعي
              لمعرفة نقاط القوة والضعف في تلاوتك
            </p>
          </div>
        </div>
      </section>

      {/* منطقة التسجيل */}
      <section className="py-20">
        <div className="container max-w-2xl">
          <div className="glass-card p-8 space-y-8">
            {/* اختيار السورة والآية */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">اختر السورة</label>
                <select className="w-full glass-card px-4 py-3 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>سورة الفاتحة</option>
                  <option>سورة البقرة</option>
                  <option>سورة آل عمران</option>
                  <option>سورة النساء</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">الآيات</label>
                <input
                  type="text"
                  placeholder="مثال: 1-7"
                  className="w-full glass-card px-4 py-3 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* منطقة التسجيل */}
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                <div className="w-32 h-32 gradient-primary rounded-full flex items-center justify-center glow-primary">
                  <Mic2 className="w-16 h-16 text-primary-foreground" />
                </div>

                {isRecording && (
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="font-semibold">جاري التسجيل...</span>
                  </div>
                )}

                <div className="flex gap-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="gradient-primary text-primary-foreground font-bold gap-2 glow-primary"
                    >
                      <Mic2 className="w-5 h-5" />
                      ابدأ التسجيل
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      className="bg-red-500 hover:bg-red-600 text-white font-bold gap-2"
                    >
                      <Square className="w-5 h-5" />
                      إيقاف التسجيل
                    </Button>
                  )}
                </div>
              </div>

              {/* تشغيل التسجيل */}
              {audioBlob && (
                <div className="space-y-4 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <audio
                      controls
                      className="flex-1"
                      src={URL.createObjectURL(audioBlob)}
                    />
                    <Button
                      onClick={downloadRecording}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      تحميل
                    </Button>
                  </div>

                  <Button
                    onClick={analyzeRecitation}
                    disabled={isAnalyzing}
                    className="w-full gradient-primary text-primary-foreground font-bold gap-2 glow-primary"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري التحليل...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        حلل التلاوة
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* نتائج التحليل */}
      {analysisResults && (
        <section className="py-20">
          <div className="container max-w-2xl">
            <div className="space-y-8">
              {/* ملخص النتائج */}
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">نتائج التحليل</h2>
                  <div className="text-right">
                    <div className="text-4xl font-bold gradient-primary-text">
                      {analysisResults.score}%
                    </div>
                    <p className="text-sm text-muted-foreground">درجة التلاوة</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="glass-card p-4 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">السورة</p>
                    <p className="font-bold">{analysisResults.surah}</p>
                  </div>
                  <div className="glass-card p-4 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">الآيات</p>
                    <p className="font-bold">{analysisResults.ayah}</p>
                  </div>
                  <div className="glass-card p-4 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">المدة</p>
                    <p className="font-bold">{analysisResults.duration}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold">الملاحظات</h3>
                  {analysisResults.issues.map((issue: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                    >
                      {issue.type === "error" && (
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      {issue.type === "warning" && (
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      )}
                      {issue.type === "success" && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{issue.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          الوقت: {issue.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm leading-relaxed">
                    <span className="font-bold">التقييم: </span>
                    {analysisResults.feedback}
                  </p>
                </div>
              </div>

              {/* الدعوة للتسجيل */}
              <div className="glass-card p-8 text-center space-y-6">
                <h3 className="text-2xl font-bold">
                  هل أعجبتك النتائج؟
                </h3>
                <p className="text-muted-foreground">
                  سجل الآن للحصول على تصحيحات مفصلة من معلمين متخصصين
                  وتتبع تقدمك على مدار الوقت
                </p>
                <Button
                  onClick={() => window.location.href = getLoginUrl()}
                  size="lg"
                  className="gradient-primary text-primary-foreground font-bold gap-2 glow-primary"
                >
                  <Mic2 className="w-5 h-5" />
                  سجل الآن مجاناً
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* الفوتر */}
      <footer className="py-8 border-t border-border/50">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 منصة الماهر - الحوكمة القرآنية التشاركية</p>
        </div>
      </footer>
    </div>
  );
}
