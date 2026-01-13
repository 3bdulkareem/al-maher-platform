import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioFileUploadProps {
  onFileSelected: (file: File) => void;
  onError?: (error: string) => void;
}

export const AudioFileUpload = ({ onFileSelected, onError }: AudioFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // التحقق من نوع الملف
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'];
    if (!validTypes.includes(file.type)) {
      onError?.('صيغة الملف غير مدعومة. يرجى استخدام MP3 أو WAV أو OGG أو WebM');
      return;
    }

    // التحقق من حجم الملف (الحد الأقصى 50 MB)
    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      onError?.('حجم الملف كبير جداً. الحد الأقصى 50 MB');
      return;
    }

    onFileSelected(file);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="w-full gap-2"
      >
        <Upload className="w-4 h-4" />
        تحميل ملف صوتي
      </Button>
    </div>
  );
};
