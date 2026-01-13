import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Mic2,
  Square,
  Play,
  Download,
  Zap,
  ArrowRight,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { AudioFileUpload } from "@/components/AudioFileUpload";

export default function Demo() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setRecordingError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRecordingError("متصفحك لا يدعم التسجيل المباشر. استخدم متصفحاً حديثاً أو حمّل ملفاً صوتياً بدلاً من ذلك.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];
      setDuration(0);

      // محاولة استخدام MediaRecorder
      if (typeof MediaRecorder !== "undefined") {
        try {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            setAudioBlob(blob);
          };

          mediaRecorder.onerror = (event) => {
            setRecordingError(`خطأ في التسجيل: ${event.error}`);
          };

          mediaRecorder.start();
          setIsRecording(true);

          // تحديث المدة
          durationIntervalRef.current = setInterval(() => {
            setDuration((prev) => prev + 1);
          }, 1000);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "خطأ غير معروف";
          setRecordingError(`فشل التسجيل: ${errorMsg}`);
          stream.getTracks().forEach((track) => track.stop());
        }
      } else {
        setRecordingError("متصفحك لا يدعم التسجيل الصوتي");
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "فشل الوصول إلى الميكروفون";

      if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission denied")) {
        setRecordingError("يرجى السماح بالوصول إلى الميكروفون");
      } else if (errorMessage.includes("NotFoundError")) {
        setRecordingError("لم يتم العثور على ميكروفون متصل");
      } else if (errorMessage.includes("NotSupportedError")) {
        setRecordingError("المتصفح الحالي لا يدعم تسجيل الصوت. يرجى استخدام متصفح حديث أو حمّل ملفاً صوتياً");
      } else {
        setRecordingError(errorMessage);
      }
    }
  };

  const stopRecording = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
  };

  const handleFileSelected = (file: File) => {
    setAudioBlob(file);
    setRecordingError(null);
    toast.success("تم تحميل الملف الصوتي بنجاح");
  };

  const analyzeRecitation = async () => {
    if (!audioBlob) {
      toast.error("يرجى تسجيل أو تحميل ملف صوتي أولاً");
      return;
    }

    setIsAnalyzing(true);
    setRecordingError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("surah", "الفاتحة");
      formData.append("verses", "1-7");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل التحليل");
      }

      const data = await response.json();
      setAnalysisResults(data);
      toast.success("تم تحليل التلاوة بنجاح");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "حدث خطأ أثناء التحليل";
      setRecordingError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetDemo = () => {
    setAudioBlob(null);
    setAnalysisResults(null);
    setDuration(0);
    setRecordingError(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4">
            <ArrowRight className="w-4 h-4 rotate-180" />
            العودة للرئيسية
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">جرب التسجيل الآن</h1>
          <p className="text-emerald-200">سجل تلاوتك لسورة الفاتحة ثم اضغط على "تحليل التلاوة" للحصول على تقييم ذكي</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recording Section */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">جرب التسجيل الآن</h2>

            {recordingError && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 text-sm">{recordingError}</p>
                  <p className="text-red-300 text-xs mt-1">💡 جرب تحميل ملف صوتي بدلاً من التسجيل المباشر</p>
                </div>
              </div>
            )}

            {/* Recording Controls */}
            <div className="space-y-4 mb-6">
              {!audioBlob ? (
                <>
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2 py-6"
                    >
                      <Mic2 className="w-5 h-5" />
                      ابدأ التسجيل
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={stopRecording}
                        className="w-full bg-red-500 hover:bg-red-600 text-white gap-2 py-6"
                      >
                        <Square className="w-5 h-5" />
                        إيقاف التسجيل
                      </Button>
                      <div className="text-center text-emerald-200 text-lg font-mono">
                        {formatDuration(duration)}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-500/20 rounded-lg">
                    <span className="text-emerald-200">ملف صوتي جاهز</span>
                    <span className="text-emerald-400 text-sm">
                      {audioBlob.size ? `${(audioBlob.size / 1024).toFixed(1)} KB` : ""}
                    </span>
                  </div>
                  <Button
                    onClick={resetDemo}
                    variant="outline"
                    className="w-full border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10"
                  >
                    تسجيل جديد
                  </Button>
                </div>
              )}

              {/* File Upload Option */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-white/60">أو</span>
                </div>
              </div>

              <AudioFileUpload
                onFileSelected={handleFileSelected}
                onError={(error) => {
                  setRecordingError(error);
                  toast.error(error);
                }}
              />
            </div>

            {/* Analyze Button */}
            {audioBlob && (
              <Button
                onClick={analyzeRecitation}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2 py-6"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin">⚙️</div>
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    تحليل التلاوة
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Results Section */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">نتائج التحليل</h2>

            {!analysisResults ? (
              <div className="flex flex-col items-center justify-center h-64 text-white/60">
                <div className="text-4xl mb-4">📝</div>
                <p>سجل تلاوتك ثم اضغط على "تحليل التلاوة" للحصول على النتائج</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Transcription */}
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-2">النص المحول:</h3>
                  <p className="text-white/80 text-sm leading-relaxed bg-white/5 p-3 rounded">
                    {analysisResults.transcription || "لم يتم تحويل الصوت"}
                  </p>
                </div>

                {/* Analysis */}
                {analysisResults.analysis && (
                  <>
                    <div>
                      <h3 className="text-emerald-400 font-semibold mb-2">التقييم:</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">الدقة الإجمالية:</span>
                          <span className="text-emerald-400 font-bold">
                            {analysisResults.analysis.overallScore || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                            style={{
                              width: `${analysisResults.analysis.overallScore || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {analysisResults.analysis.errors && (
                      <div>
                        <h3 className="text-amber-400 font-semibold mb-2">الملاحظات:</h3>
                        <ul className="text-white/70 text-sm space-y-1">
                          {analysisResults.analysis.errors.map((error: string, idx: number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-amber-400">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResults.analysis.suggestions && (
                      <div>
                        <h3 className="text-blue-400 font-semibold mb-2">التوصيات:</h3>
                        <ul className="text-white/70 text-sm space-y-1">
                          {analysisResults.analysis.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-blue-400">✓</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* CTA */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm mb-3">هل أعجبك التقييم؟</p>
                  <Link href={getLoginUrl()}>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                      سجل الآن واستمتع بجميع المميزات
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
