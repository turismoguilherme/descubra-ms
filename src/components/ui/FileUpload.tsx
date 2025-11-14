/**
 * Componente de Upload de Arquivos
 * Interface para upload de imagens, PDFs e outros arquivos
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Eye
} from 'lucide-react';
import { fileUploadService, UploadOptions, UploadResult } from '@/services/storage/FileUploadService';

interface FileUploadProps {
  onUploadComplete?: (results: UploadResult[]) => void;
  onFileRemove?: (filePath: string) => void;
  options?: UploadOptions;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  result?: UploadResult;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onFileRemove,
  options = {},
  multiple = false,
  maxFiles = 5,
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultOptions: UploadOptions = {
    maxSize: 10, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    quality: 0.8,
    folder: 'uploads',
    ...options
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Verificar limite de arquivos
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    // Processar arquivos
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const filesToUpload = uploadedFiles.filter(f => !f.result);
      const results: UploadResult[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const result = await fileUploadService.uploadFile(file.file, defaultOptions);
        
        results.push(result);
        
        // Atualizar progresso
        const progress = ((i + 1) / filesToUpload.length) * 100;
        setUploadProgress(progress);

        // Atualizar arquivo com resultado
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, result }
              : f
          )
        );

        // Pequeno delay para visualização
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      onUploadComplete?.(results);
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file?.result?.url) {
      onFileRemove?.(file.result.url);
    }
    
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Upload */}
      <Card>
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Clique para selecionar arquivos
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {multiple ? `Máximo ${maxFiles} arquivos` : '1 arquivo'} • 
              Máximo {defaultOptions.maxSize}MB por arquivo
            </p>
            <p className="text-xs text-gray-400">
              Tipos aceitos: {defaultOptions.allowedTypes?.join(', ')}
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={defaultOptions.allowedTypes?.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Lista de Arquivos */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(file.file)}
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium text-sm">{file.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.result ? (
                      <>
                        {file.result.success ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enviado
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                        
                        {file.result.success && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(fileUploadService.getPublicUrl(file.result.url!), '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary">
                        Aguardando
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão de Upload */}
            {uploadedFiles.some(f => !f.result) && (
              <div className="mt-4 space-y-2">
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Enviando arquivos...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? 'Enviando...' : 'Enviar Arquivos'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
