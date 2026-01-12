import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { 
  Mic2, 
  Square, 
  Zap,
  LayoutDashboard,
  CheckSquare,
  User as UserIcon,
  ArrowRight,
  Cpu,
  Send,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Streamdown } from "streamdown";

export default function RecordRecitation() {
  const { user } = useAuth();
  
  // حالة التسجيل
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // حالة السورة والآيات
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [startVerse, setStartVerse] = useState<number>(1);
  const [endVerse, setEndVerse] = useState<number>(7);
  
  // حالة التحليل
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [recitationId, setRecitationId] = useState<number | null>(null);
  
  // المراجع
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // جلب السور
  const { data: surahs } = trpc.surahs.getAll.useQuery();
  
  // إنشاء التلاوة
  const createRecitation = trpc.recitations.create.useMutation({
    onSuccess: (data) => {
      setRecitationId(data.id);
      toast.success("تم رفع التلاوة بنجاح");
    },
    onError: (error) => {
      toast.error("فشل رفع التلاوة: " + error.message);
    }
  });
  
  // تحليل بالذكاء الاصطناعي
  const analyzeRecitation = trpc.recitations.analyzeWithAI.useMutation({
    onSuccess: (data) => {
      setAiAnalysis(data.aiAnalysis);
      setIsAnalyzing(false);
      toast.success("تم التحليل بنجاح");
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error("فشل التحليل: " + error.message);
    }
  });
  
  // إرسال للمراجعة
  const submitForReview = trpc.recitations.submitForPeerReview.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال التلاوة للمراجعة");
      // إعادة تعيين الحالة
      setAudioBlob(null);
      setAudioUrl(null);
      setAiAnalysis(null);
      setRecitationId(null);
      setRecordingTime(0);
    },
    onError: (error) => {
      toast.error("فشل الإرسال: " + error.message);
    }
  });

  // بدء التسجيل
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // عداد الوقت
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast.error("فشل الوصول إلى الميكروفون");
    }
  };

  // إيقاف التسجيل
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // رفع التلاوة
  const uploadRecitation = async () => {
    if (!audioBlob || !selectedSurah) {
      toast.error("يرجى تسجيل تلاوة واختيار السورة");
      return;
    }
    
    const surah = surahs?.find(s => s.number.toString() === selectedSurah);
    if (!surah) return;
    
    // تحويل الصوت إلى Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      
      createRecitation.mutate({
        surahNumber: surah.number,
        surahName: surah.nameArabic,
        startVerse,
        endVerse,
        audioBase64: base64,
        audioMimeType: "audio/webm",
        durationSeconds: recordingTime,
      });
    };
    reader.readAsDataURL(audioBlob);
  };

  // تحليل بالذكاء الاصطناعي
  const runAIAnalysis = () => {
    if (!recitationId) {
      toast.error("يرجى رفع التلاوة أولاً");
      return;
    }
    
    setIsAnalyzing(true);
    analyzeRecitation.mutate({ recitationId });
  };

  // إرسال للمراجعة البشرية
  const sendForPeerReview = () => {
    if (!recitationId) return;
    submitForReview.mutate({ recitationId });
  };

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // تنظيف عند الخروج
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const selectedSurahData = surahs?.find(s => s.number.toString() === selectedSurah);

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
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all bg-primary text-primary-foreground font-bold">
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
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto space-y-8 slide-in-from-bottom">
            {/* العنوان */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold quran-font">تسجيل تلاوة جديدة</h2>
              <p className="text-muted-foreground">اختر السورة والآيات ثم سجل تلاوتك</p>
            </div>

            {/* اختيار السورة والآيات */}
            <div className="glass-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">السورة</label>
                  <Select value={selectedSurah} onValueChange={setSelectedSurah}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر السورة" />
                    </SelectTrigger>
                    <SelectContent>
                      {surahs?.map(surah => (
                        <SelectItem key={surah.number} value={surah.number.toString()}>
                          {surah.nameArabic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">من الآية</label>
                  <Select 
                    value={startVerse.toString()} 
                    onValueChange={(v) => setStartVerse(parseInt(v))}
                    disabled={!selectedSurahData}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedSurahData && Array.from(
                        { length: selectedSurahData.versesCount }, 
                        (_, i) => i + 1
                      ).map(v => (
                        <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">إلى الآية</label>
                  <Select 
                    value={endVerse.toString()} 
                    onValueChange={(v) => setEndVerse(parseInt(v))}
                    disabled={!selectedSurahData}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedSurahData && Array.from(
                        { length: selectedSurahData.versesCount - startVerse + 1 }, 
                        (_, i) => startVerse + i
                      ).map(v => (
                        <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* زر التسجيل */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <div className={`absolute inset-0 bg-primary rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${isRecording ? 'animate-pulse scale-150' : ''}`} />
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!selectedSurah}
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording 
                      ? 'bg-destructive scale-95 shadow-inner' 
                      : 'gradient-primary shadow-xl glow-primary'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-10 h-10 text-destructive-foreground fill-current" />
                  ) : (
                    <Mic2 className="w-12 h-12 text-primary-foreground" />
                  )}
                </button>
              </div>
              
              {/* عداد الوقت */}
              <div className="text-2xl font-mono font-bold">
                {formatTime(recordingTime)}
              </div>
              
              {/* موجات الصوت */}
              {isRecording && (
                <div className="sound-wave">
                  {[...Array(15)].map((_, i) => (
                    <div 
                      key={i} 
                      className="sound-wave-bar" 
                      style={{ 
                        animationDelay: `${i * 0.1}s`,
                        height: `${20 + Math.random() * 80}%`
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* مشغل الصوت */}
            {audioUrl && !isRecording && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold">معاينة التسجيل</h3>
                <audio src={audioUrl} controls className="w-full" />
                
                <div className="flex gap-4">
                  <Button 
                    onClick={uploadRecitation}
                    disabled={createRecitation.isPending || !!recitationId}
                    className="flex-1 gradient-primary text-primary-foreground"
                  >
                    {createRecitation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        جاري الرفع...
                      </>
                    ) : recitationId ? (
                      "تم الرفع ✓"
                    ) : (
                      "رفع التلاوة"
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                      setRecitationId(null);
                      setAiAnalysis(null);
                      setRecordingTime(0);
                    }}
                  >
                    إعادة التسجيل
                  </Button>
                </div>
              </div>
            )}

            {/* زر التحليل بالذكاء الاصطناعي */}
            {recitationId && !aiAnalysis && (
              <div className="text-center">
                <Button 
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                  size="lg"
                  className="glass-hover gap-2"
                  variant="outline"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الفرز الآلي...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      بدء التحليل بالذكاء الاصطناعي
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* نتائج التحليل */}
            {aiAnalysis && (
              <div className="glass-card p-8 space-y-4 border-primary/30">
                <div className="flex items-center gap-2 text-primary">
                  <Cpu className="w-5 h-5" />
                  <span className="font-bold">تحليل المساعد الذكي (AI Gateway)</span>
                </div>
                <div className="text-foreground leading-relaxed prose prose-invert max-w-none">
                  <Streamdown>{aiAnalysis}</Streamdown>
                </div>
                <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-xs text-muted-foreground">
                    هذا التحليل أولي؛ سيتم توجيه تلاوتك لمصححين أقران للمراجعة النهائية.
                  </p>
                  <Button 
                    onClick={sendForPeerReview}
                    disabled={submitForReview.isPending}
                    className="gradient-primary text-primary-foreground gap-2"
                  >
                    {submitForReview.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    إرسال للمراجعة البشرية
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
