"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfUploaderProps {
  onGenerateQuiz: (file: File) => void;
  isLoading: boolean;
}

export default function PdfUploader({ onGenerateQuiz, isLoading }: PdfUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleSubmit = () => {
    if (file) {
      onGenerateQuiz(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center px-4 md:px-6">
        <CardTitle className="text-2xl md:text-3xl font-bold">Biyoloji Quizinizi Oluşturun</CardTitle>
        <CardDescription className="text-muted-foreground text-base md:text-lg">Başlamak için bir PDF belgesi yükleyin.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 md:px-6 pb-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 md:p-8 text-center cursor-pointer transition-colors duration-200",
            isDragging ? "border-primary bg-accent" : "border-border hover:border-primary/50"
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileUp className="w-8 h-8 md:w-10 md:h-10" />
            <p className="font-medium text-sm md:text-base">
              {isDragging ? "Dosyayı buraya bırakın" : "Bir PDF dosyasını buraya sürükleyip bırakın veya göz atmak için tıklayın"}
            </p>
          </div>
        </div>

        {file && (
          <div className="text-center text-sm text-foreground">
            Seçilen dosya: <span className="font-semibold">{file.name}</span>
          </div>
        )}
        
        <Button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="w-full text-base md:text-lg py-5 md:py-6"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            'Quiz Oluştur'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
