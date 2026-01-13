import { useRef, useState, useCallback } from 'react';

interface UseAudioRecorderOptions {
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: string) => void;
}

export const useAudioRecorder = (options: UseAudioRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // طلب الأذونات
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      setDuration(0);

      // محاولة استخدام MediaRecorder أولاً (الطريقة الموصى بها)
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm')) {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          options.onRecordingComplete?.(blob);
        };

        mediaRecorder.onerror = (event) => {
          options.onError?.(`خطأ في التسجيل: ${event.error}`);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
      } else {
        // Fallback: استخدام Web Audio API للأجهزة القديمة
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        const audioData: Float32Array[] = [];

        processor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          audioData.push(new Float32Array(inputData));
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      }

      setIsRecording(true);

      // تحديث المدة
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل الوصول إلى الميكروفون';
      
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
        options.onError?.('يرجى السماح بالوصول إلى الميكروفون');
      } else if (errorMessage.includes('NotFoundError')) {
        options.onError?.('لم يتم العثور على ميكروفون متصل');
      } else if (errorMessage.includes('NotSupportedError')) {
        options.onError?.('المتصفح الحالي لا يدعم تسجيل الصوت. يرجى استخدام متصفح حديث');
      } else {
        options.onError?.(errorMessage);
      }
    }
  }, [options]);

  const stopRecording = useCallback(async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (audioContextRef.current && processorRef.current) {
      // إيقاف Web Audio API
      processorRef.current.disconnect();
      audioContextRef.current.close();
    }

    // إيقاف جميع المسارات الصوتية
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
  }, []);

  const resetRecording = useCallback(() => {
    setDuration(0);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
