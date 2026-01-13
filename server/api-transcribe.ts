import { Request, Response } from "express";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

/**
 * API endpoint لتحويل الصوت إلى نص
 * POST /api/transcribe
 */
export async function handleTranscribe(req: any, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "لم يتم تحميل ملف صوتي" });
    }

    // رفع الملف إلى S3
    const audioKey = `temp-audio/${nanoid()}.webm`;
    const { url: audioUrl } = await storagePut(
      audioKey,
      req.file.buffer,
      req.file.mimetype
    );

    // تحويل الصوت إلى نص
    const result = await transcribeAudio({
      audioUrl,
      language: "ar",
      prompt: "هذا تسجيل لتلاوة قرآنية",
    });

    const text = typeof result === 'object' && result !== null && 'text' in result ? (result as any).text : '';
    return res.json({
      text: text || '',
      language: 'ar',
      segments: [],
    });
  } catch (error) {
    console.error("[Transcribe] Error:", error);
    return res.status(500).json({
      error: "فشل تحويل الصوت إلى نص",
      details: error instanceof Error ? error.message : "خطأ غير معروف",
    });
  }
}

/**
 * API endpoint لتحليل التلاوة
 * POST /api/analyze-recitation
 */
export async function handleAnalyzeRecitation(req: Request, res: Response) {
  try {
    const { transcribedText, surahName, surahNumber, startVerse, endVerse } =
      req.body;

    if (!transcribedText) {
      return res.status(400).json({ error: "النص المحول مفقود" });
    }

    // استدعاء LLM للتحليل
    const { invokeLLM } = await import("./_core/llm");

    const prompt = `أنت خبير في تجويد القرآن الكريم. قم بتحليل التلاوة التالية:

النص المحول من الصوت:
"${transcribedText}"

السورة: ${surahName}
الآيات: من ${startVerse} إلى ${endVerse}

قدم تحليلاً شاملاً يتضمن:
1. تقييم عام للتلاوة (من 100)
2. الأخطاء الموجودة (إن وجدت) مع نوعها (تجويد/مخارج/توقفات)
3. النقاط الإيجابية
4. نصائح للتحسين

أرجو تقديم الرد بصيغة JSON مع المفاتيح التالية:
{
  "score": رقم من 0 إلى 100,
  "feedback": "التقييم العام",
  "issues": [
    {
      "type": "error|warning|success",
      "text": "وصف المشكلة أو النقطة الإيجابية",
      "category": "tajweed|pronunciation|stops"
    }
  ]
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "أنت معلم قرآن متخصص في التجويد. قدم تحليلاً مفيداً وبناءً. رد دائماً بصيغة JSON صحيحة.",
        },
        { role: "user", content: prompt },
      ],
    });

    const rawContent = response.choices[0]?.message?.content;
    let analysisData = {
      score: 75,
      feedback: "تم التحليل بنجاح",
      issues: [],
    };

    if (typeof rawContent === "string") {
      try {
        // محاولة استخراج JSON من الرد
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn("[Analyze] JSON parse error:", parseError);
        // استخدام البيانات الافتراضية
        analysisData.feedback = rawContent;
      }
    }

    return res.json(analysisData);
  } catch (error) {
    console.error("[Analyze] Error:", error);
    return res.status(500).json({
      error: "فشل تحليل التلاوة",
      details: error instanceof Error ? error.message : "خطأ غير معروف",
    });
  }
}
