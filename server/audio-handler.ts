import { Response } from "express";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export async function handleTranscribe(req: any, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "لم يتم تحميل ملف صوتي" });
    }

    const maxSize = 50 * 1024 * 1024;
    if (req.file.buffer.length > maxSize) {
      return res.status(413).json({ 
        error: "حجم الملف كبير جداً. الحد الأقصى 50 MB" 
      });
    }

    const mimeType = req.file.mimetype || 'audio/webm';
    const ext = mimeType.includes('mpeg') ? 'mp3' : 
                mimeType.includes('wav') ? 'wav' : 
                mimeType.includes('ogg') ? 'ogg' : 'webm';
    
    const audioKey = `temp-audio/${nanoid()}.${ext}`;
    const { url: audioUrl } = await storagePut(
      audioKey,
      req.file.buffer,
      mimeType
    );

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
