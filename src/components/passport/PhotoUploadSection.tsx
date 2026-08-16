import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, CheckCircle2 } from 'lucide-react';

interface PhotoUploadSectionProps {
  onPhotoUploaded: (file: File) => void;
  isRequired?: boolean;
  disabled?: boolean;
  maxSize?: number; // in MB
}

const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({
  onPhotoUploaded,
  isRequired = false,
  disabled = false,
  maxSize = 5
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`A imagem deve ter no máximo ${maxSize}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    onPhotoUploaded(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removePhoto = () => {
    setUploadedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      // Create video element to capture
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.addEventListener('loadedmetadata', () => {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        // Convert to blob and create file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `checkpoint-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleFileSelect(file);
          }
          
          // Stop camera
          stream.getTracks().forEach(track => track.stop());
        }, 'image/jpeg', 0.8);
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Não foi possível acessar a câmera. Use o upload de arquivo.');
    }
  };

  if (preview) {
    return (
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-4">
          <div className="relative">
            <img 
              src={preview} 
              alt="Foto enviada" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={removePhoto}
              className="absolute top-2 right-2"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Foto enviada
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/5 border-white/20 ${disabled ? 'opacity-50' : ''}`}>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver 
              ? 'border-ms-accent-orange bg-ms-accent-orange/10' 
              : 'border-white/30 hover:border-white/50'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <Camera className="w-12 h-12 text-white/60" />
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">
                {isRequired ? 'Foto obrigatória' : 'Adicionar foto (opcional)'}
              </h4>
              <p className="text-white/70 text-sm">
                Clique para selecionar ou arraste uma imagem aqui
              </p>
              <p className="text-white/50 text-xs mt-1">
                Máximo {maxSize}MB • JPG, PNG, WEBP
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="text-white border-white/50 hover:bg-white/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Galeria
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  capturePhoto();
                }}
                className="text-white border-white/50 hover:bg-white/10"
              >
                <Camera className="w-4 h-4 mr-2" />
                Câmera
              </Button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};

export default PhotoUploadSection;