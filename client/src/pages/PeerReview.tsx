import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { 
  Mic2, 
  Zap,
  LayoutDashboard,
  CheckSquare,
  User as UserIcon,
  Play,
  Pause,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export default function PeerReview() {
  const { user } = useAuth();
  
  // جلب التلاوات المعلقة للمراجعة
  const { data: pendingRecitations, isLoading, refetch } = trpc.recitations.getPendingForReview.useQuery({});
  
  // الحالة
  const [selectedRecitation, setSelectedRecitation] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(80);
  const [feedback, setFeedback] = useState("");
  const [tajweedErrors, setTajweedErrors] = useState(0);
  const [pronunciationErrors, setPronunciationErrors] = useState(0);
  const [memorizationErrors, setMemorizationErrors] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // إرسال التصحيح
  const submitCorrection = trpc.corrections.submit.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال التصحيح بنجاح");
      setSelectedRecitation(null);
      setScore(80);
      setFeedback("");
      setTajweedErrors(0);
      setPronunciationErrors(0);
      setMemorizationErrors(0);
      refetch();
    },
    onError: (error) => {
      toast.error("فشل إرسال التصحيح: " + error.message);
    }
  });

  const handleSubmit = () => {
    if (!selectedRecitation) return;
    if (feedback.length < 10) {
      toast.error("يرجى كتابة ملاحظات أكثر تفصيلاً (10 أحرف على الأقل)");
      return;
    }
    
    submitCorrection.mutate({
      recitationId: selectedRecitation,
      score,
      feedback,
      tajweedErrors,
      pronunciationErrors,
      memorizationErrors,
    });
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const selectedData = pendingRecitations?.find(r => r.recitation.id === selectedRecitation);

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
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all bg-primary text-primary-foreground font-bold">
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
          <div className="max-w-5xl mx-auto space-y-8">
            {/* العنوان */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">تصحيح الأقران</h2>
              <p className="text-muted-foreground">راجع تلاوات الآخرين وساهم في تحسين مستواهم</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* قائمة التلاوات */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg">التلاوات المعلقة للمراجعة</h3>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="glass-card p-4 h-24 animate-pulse" />
                    ))}
                  </div>
                ) : pendingRecitations && pendingRecitations.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRecitations.map(({ recitation, reciterName, reciterRank }) => (
                      <button
                        key={recitation.id}
                        onClick={() => setSelectedRecitation(recitation.id)}
                        className={`w-full text-right glass-card p-4 space-y-2 glass-hover transition-all ${
                          selectedRecitation === recitation.id 
                            ? 'border-primary ring-1 ring-primary' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold quran-font text-lg">{recitation.surahName}</h4>
                          <span className="text-xs text-muted-foreground">
                            {recitation.completedReviews}/{recitation.requiredReviews} مراجعات
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          الآيات: {recitation.startVerse} - {recitation.endVerse}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>بواسطة: {reciterName || "مستخدم"}</span>
                          <span>•</span>
                          <span>{new Date(recitation.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد تلاوات معلقة للمراجعة حالياً</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      سيتم إشعارك عند توفر تلاوات جديدة
                    </p>
                  </div>
                )}
              </div>

              {/* نموذج التصحيح */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg">تقديم التصحيح</h3>
                
                {selectedData ? (
                  <div className="glass-card p-6 space-y-6">
                    {/* معلومات التلاوة */}
                    <div className="space-y-2">
                      <h4 className="font-bold quran-font text-xl">{selectedData.recitation.surahName}</h4>
                      <p className="text-sm text-muted-foreground">
                        الآيات: {selectedData.recitation.startVerse} - {selectedData.recitation.endVerse}
                      </p>
                    </div>

                    {/* مشغل الصوت */}
                    <div className="glass p-4 rounded-xl space-y-4">
                      <audio 
                        ref={audioRef}
                        src={selectedData.recitation.audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={togglePlay}
                          size="icon"
                          className="gradient-primary text-primary-foreground w-12 h-12 rounded-full"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 mr-[-2px]" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <p className="text-sm font-medium">استمع للتلاوة</p>
                          <p className="text-xs text-muted-foreground">
                            المدة: {selectedData.recitation.durationSeconds 
                              ? `${Math.floor(selectedData.recitation.durationSeconds / 60)}:${(selectedData.recitation.durationSeconds % 60).toString().padStart(2, '0')}`
                              : "غير محدد"
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* التقييم العام */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">التقييم العام</label>
                        <span className="text-2xl font-bold text-primary">{score}%</span>
                      </div>
                      <Slider
                        value={[score]}
                        onValueChange={(v) => setScore(v[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* عدد الأخطاء */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">أخطاء التجويد</label>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setTajweedErrors(Math.max(0, tajweedErrors - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-bold">{tajweedErrors}</span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setTajweedErrors(tajweedErrors + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium">أخطاء النطق</label>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setPronunciationErrors(Math.max(0, pronunciationErrors - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-bold">{pronunciationErrors}</span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setPronunciationErrors(pronunciationErrors + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium">أخطاء الحفظ</label>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setMemorizationErrors(Math.max(0, memorizationErrors - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-bold">{memorizationErrors}</span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setMemorizationErrors(memorizationErrors + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* الملاحظات */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ملاحظات التصحيح</label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="اكتب ملاحظاتك التفصيلية هنا... (مثال: أحكام التجويد، مخارج الحروف، نصائح للتحسين)"
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {feedback.length}/10 حرف (الحد الأدنى)
                      </p>
                    </div>

                    {/* زر الإرسال */}
                    <Button
                      onClick={handleSubmit}
                      disabled={submitCorrection.isPending || feedback.length < 10}
                      className="w-full gradient-primary text-primary-foreground gap-2"
                    >
                      {submitCorrection.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          إرسال التصحيح
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">اختر تلاوة من القائمة لبدء التصحيح</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
