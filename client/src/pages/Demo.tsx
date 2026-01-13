import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Mic2,
  Square,
  Play,
  Download,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Demo() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [surahNumber] = useState(1);
  const [startVerse] = useState(1);
  const [endVerse] = useState(7);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      // التحقق من دعم MediaRecorder
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("متصفحك لا يدعم التسجيل المباشر. استخدم متصفحاً حديثاً.");
        return;
      }

      // طلب إذن الميكروفون
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // التحقق من دعم MediaRecorder
      if (typeof MediaRecorder === "undefined") {
        toast.error("متصفحك لا يدعم التسجيل الصوتي");
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("خطأ في التسجيل:", event.error);
        toast.error("حدث خطأ في التسجيل: " + event.error);
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          toast.success("تم تسجيل التلاوة بنجاح");
        } else {
          toast.error("لم يتم تسجيل أي صوت");
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("جاري التسجيل...");
    } catch (error: any) {
      console.error("خطأ في التسجيل:", error);
      
      if (error.name === "NotAllowedError") {
        toast.error("يرجى السماح بالوصول إلى الميكروفون");
      } else if (error.name === "NotFoundError") {
        toast.error("لم يتم العثور على ميكروفون");
      } else if (error.name === "NotSupportedError") {
        toast.error("نوع الميكروفون غير مدعوم");
      } else {
        toast.error("لا يمكن الوصول إلى الميكروفون: " + (error.message || error.name));
      }
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
    toast.loading("جاري تحليل التلاوة...");
    
    try {
      // تحويل البلوب إلى Base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // بناء FormData للرفع
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        
        try {
          // استدعاء API لتحويل الصوت
          const transcriptionResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (!transcriptionResponse.ok) {
            throw new Error('فشل تحويل الصوت');
          }
          
          const transcriptionData = await transcriptionResponse.json();
          const transcribedText = transcriptionData.text || '';
          
          // استدعاء LLM للتحليل
          const analysisResponse = await fetch('/api/analyze-recitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transcribedText,
              surahName: 'الفاتحة',
              surahNumber: 1,
              startVerse: 1,
              endVerse: 7,
            }),
          });
          
          if (!analysisResponse.ok) {
            throw new Error('فشل التحليل');
          }
          
          const analysisData = await analysisResponse.json();
          
          setAnalysisResults({
            surah: 'سورة الفاتحة',
            ayah: 'الآية 1-7',
            duration: `${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`,
            transcribedText,
            issues: analysisData.issues || [],
            score: analysisData.score || 75,
            feedback: analysisData.feedback || 'تم التحليل بنجاح',
          });
          
          toast.success('تم تحليل التلاوة بنجاح!');
        } catch (error) {
          console.error('خطأ في التحليل:', error);
          toast.error('حدث خطأ في التحليل');
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('الخطأ:', error);
      toast.error('حدث خطأ في معالجة الملف');
      setIsAnalyzing(false);
    }
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
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              العودة للرئيسية
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="container py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* قسم التسجيل */}
          <div className="glass rounded-2xl p-8 border border-border/50">
            <h2 className="text-2xl font-bold mb-6 text-center">جرب التسجيل الآن</h2>
            
            <div className="space-y-6">
              {/* حالة التسجيل */}
              <div className="flex justify-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? "gradient-primary glow-primary animate-pulse" 
                    : "bg-secondary"
                }`}>
                  <Mic2 className="w-10 h-10 text-primary-foreground" />
                </div>
              </div>

              {/* زر التسجيل/الإيقاف */}
              <div className="flex gap-4 justify-center">
                {!isRecording ? (
                  <Button 
                    onClick={startRecording}
                    className="gap-2 gradient-primary glow-primary"
                    size="lg"
                  >
                    <Mic2 className="w-5 h-5" />
                    ابدأ التسجيل
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecording}
                    variant="destructive"
                    className="gap-2"
                    size="lg"
                  >
                    <Square className="w-5 h-5" />
                    إيقاف التسجيل
                  </Button>
                )}
              </div>

              {/* الأزرار الإضافية */}
              {audioBlob && (
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button 
                    onClick={analyzeRecitation}
                    disabled={isAnalyzing}
                    className="gap-2 gradient-primary"
                  >
                    <Play className="w-4 h-4" />
                    {isAnalyzing ? "جاري التحليل..." : "تحليل التلاوة"}
                  </Button>
                  <Button 
                    onClick={downloadRecording}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    تحميل
                  </Button>
                </div>
              )}

              {/* رسالة التعليمات */}
              <div className="bg-secondary/50 rounded-lg p-4 text-sm text-center text-muted-foreground">
                <p>سجل تلاوتك لسورة الفاتحة ثم اضغط على "تحليل التلاوة" للحصول على تقييم فوري</p>
              </div>
            </div>
          </div>

          {/* قسم النتائج */}
          <div className="glass rounded-2xl p-8 border border-border/50">
            <h2 className="text-2xl font-bold mb-6 text-center">نتائج التحليل</h2>
            
            {analysisResults ? (
              <div className="space-y-6">
                {/* الدرجة */}
                <div className="text-center">
                  <div className="text-5xl font-bold gradient-text mb-2">
                    {analysisResults.score}
                  </div>
                  <p className="text-muted-foreground">من 100</p>
                </div>

                {/* المعلومات */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">السورة:</span>
                    <span className="font-semibold">{analysisResults.surah}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الآيات:</span>
                    <span className="font-semibold">{analysisResults.ayah}</span>
                  </div>
                </div>

                {/* التقييم */}
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">التقييم:</h3>
                  <p className="text-sm text-muted-foreground">{analysisResults.feedback}</p>
                </div>

                {/* الملاحظات */}
                {analysisResults.issues && analysisResults.issues.length > 0 && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">الملاحظات:</h3>
                    <div className="space-y-2">
                      {analysisResults.issues.map((issue: any, idx: number) => (
                        <div key={idx} className="flex gap-2 text-sm">
                          <span className={`font-semibold ${
                            issue.type === 'error' ? 'text-red-500' :
                            issue.type === 'warning' ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            {issue.type === 'error' ? '❌' :
                             issue.type === 'warning' ? '⚠️' :
                             '✅'}
                          </span>
                          <span>{issue.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* زر التسجيل مرة أخرى */}
                <Button 
                  onClick={() => {
                    setAudioBlob(null);
                    setAnalysisResults(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  تسجيل جديد
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Mic2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  سجل تلاوة وحللها للحصول على النتائج
                </p>
              </div>
            )}
          </div>
        </div>

        {/* زر التسجيل الآن */}
        <div className="mt-12 text-center">
          <Link href={getLoginUrl()}>
            <Button size="lg" className="gap-2 gradient-primary glow-primary">
              سجل الآن واستمتع بجميع المميزات
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
