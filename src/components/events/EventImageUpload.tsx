/**
 * Componente de Upload de Imagem para Eventos
 * Permite fazer upload de logotipo ou imagem promocional do evento
 */

// @ts-nocheck
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  Loader2,
  CheckCircle 
} from 'lucide-react';

interface EventImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
}

const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";

const EventImageUpload: React.FC<EventImageUploadProps> = ({
  label = "Imagem",
  value,
  onChange,
  folder = "event-images",
  placeholder = "Clique para fazer upload da imagem"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para comprimir e otimizar imagem de forma inteligente
  const compressImage = (file: File, maxWidth: number = 2560, quality: number = 0.98): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventImageUpload.tsx:compressImage:imgLoad',message:'Imagem carregada para análise',data:{originalWidth:img.width,originalHeight:img.height,fileSize:file.size,fileType:file.type,needsResize:img.width > maxWidth},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'quality'})}).catch(()=>{});
          // #endregion
          
          // Se a imagem já é pequena e o arquivo não é muito grande, não processar
          // Isso preserva a qualidade original
          if (img.width <= maxWidth && file.size < 2 * 1024 * 1024) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventImageUpload.tsx:compressImage:skip',message:'Imagem pequena - pulando compressão para preservar qualidade',data:{width:img.width,height:img.height,fileSize:file.size},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'quality'})}).catch(()=>{});
            // #endregion
            resolve(file); // Retornar arquivo original sem processamento
            return;
          }

          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          let finalQuality = quality;

          // Redimensionar apenas se necessário mantendo proporção
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
            // Para imagens grandes que precisam redimensionar, usar qualidade ligeiramente menor
            finalQuality = 0.96;
          } else {
            // Para imagens que não precisam redimensionar mas são grandes em tamanho de arquivo
            // Usar qualidade máxima para preservar detalhes
            finalQuality = 0.98;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
          }

          // Configurações de alta qualidade para renderização
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Usar configurações adicionais para melhor qualidade
          ctx.imageSmoothingEnabled = true;
          
          // Desenhar imagem no canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Manter formato original (PNG permanece PNG, JPEG permanece JPEG)
          const outputType = file.type || 'image/jpeg';
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventImageUpload.tsx:compressImage:processing',message:'Processando imagem com compressão',data:{originalWidth:img.width,originalHeight:img.height,newWidth:width,newHeight:height,quality:finalQuality,outputType,fileSizeBefore:file.size},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'quality'})}).catch(()=>{});
          // #endregion

          // Converter para blob com alta qualidade
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Erro ao comprimir imagem'));
                return;
              }
              
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventImageUpload.tsx:compressImage:complete',message:'Compressão concluída',data:{fileSizeBefore:file.size,fileSizeAfter:blob.size,compressionRatio:((file.size - blob.size) / file.size * 100).toFixed(2) + '%',quality:finalQuality},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'quality'})}).catch(()=>{});
              // #endregion
              
              // Criar novo File com o blob otimizado, mantendo formato original
              const optimizedFile = new File(
                [blob],
                file.name,
                {
                  type: outputType,
                  lastModified: Date.now()
                }
              );
              resolve(optimizedFile);
            },
            outputType,
            finalQuality
          );
        };
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validar tamanho (máximo 10MB antes da compressão)
    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Comprimir e otimizar imagem antes do upload (compressão inteligente)
      const optimizedFile = await compressImage(file, 2560, 0.98);
      
      // Criar preview local com arquivo otimizado
      const localPreview = URL.createObjectURL(optimizedFile);
      setPreview(localPreview);

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const extension = optimizedFile.name.split('.').pop();
      const filename = `${timestamp}_${random}.${extension}`;

      // Upload para Supabase Storage usando arquivo comprimido
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${folder}/${filename}`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': optimizedFile.type,
            'x-upsert': 'true'
          },
          body: optimizedFile
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer upload');
      }

      // Gerar URL pública
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${folder}/${filename}`;
      
      onChange(publicUrl);
      setPreview(publicUrl);

    } catch (err: unknown) {
      console.error('Erro no upload:', err);
      setError(err.message || 'Erro ao fazer upload da imagem');
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Preview ou área de upload */}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-contain bg-gray-100 rounded-lg border"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              <CheckCircle className="h-3 w-3 mr-1" />
              Imagem carregada
            </span>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isUploading 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-blue-600">Fazendo upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
              <p className="text-xs text-gray-400">PNG, JPG ou WebP (máx. 10MB - será otimizado automaticamente)</p>
              <p className="text-xs text-blue-600 mt-1">
                💡 Ideal: até 2560px de largura para melhor qualidade. Imagens pequenas serão preservadas sem compressão.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Mensagem de erro */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default EventImageUpload;

