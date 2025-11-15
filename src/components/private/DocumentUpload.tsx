/**
 * Document Upload Component
 * Componente para upload e gerenciamento de documentos
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { documentService, Document } from '@/services/viajar/documentService';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, Trash2, Eye, Download, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DocumentUpload: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    description: '',
    category: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (user?.id) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const docs = await documentService.getDocuments(user.id, { is_active: true });
      setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os documentos',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({
        ...uploadForm,
        file,
        title: file.name
      });
    }
  };

  const handleUpload = async () => {
    if (!user?.id || !uploadForm.file) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo para upload',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      await documentService.uploadDocument(user.id, uploadForm.file, {
        title: uploadForm.title || uploadForm.file.name,
        description: uploadForm.description || undefined,
        category: uploadForm.category || undefined,
        tags: uploadForm.tags.length > 0 ? uploadForm.tags : undefined
      });

      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso'
      });

      // Reset form
      setUploadForm({
        file: null,
        title: '',
        description: '',
        category: '',
        tags: []
      });

      // Reload documents
      await loadDocuments();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload do documento',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await documentService.deleteDocument(id);
      toast({
        title: 'Sucesso',
        description: 'Documento excluído com sucesso'
      });
      await loadDocuments();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o documento',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const blob = await documentService.downloadDocument(document.file_path);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.file_name;
        window.document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer download do documento',
        variant: 'destructive'
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <SectionWrapper 
        variant="default" 
        title="Upload de Documentos"
        subtitle="Envie documentos para análise e processamento"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">Arquivo</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              placeholder="Título do documento"
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="Descrição opcional"
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={uploadForm.category}
              onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="alvara">Alvará</SelectItem>
                <SelectItem value="contrato">Contrato</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!uploadForm.file || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Documento
              </>
            )}
          </Button>
        </div>
      </SectionWrapper>

      {/* Documents List */}
      <SectionWrapper 
        variant="default" 
        title="Meus Documentos"
        subtitle={`${documents.length} documento(s) cadastrado(s)`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : documents.length === 0 ? (
          <CardBox>
            <p className="text-gray-600 text-center">Nenhum documento cadastrado ainda.</p>
          </CardBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <CardBox key={doc.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <File className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{doc.title || doc.file_name}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {formatFileSize(doc.file_size)}
                        {doc.category && ` • ${doc.category}`}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  {doc.analysis_status === 'completed' && (
                    <span className="rounded-full text-xs font-medium px-2 py-1 bg-green-100 text-green-700">
                      Analisado
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-slate-700 text-sm hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardBox>
            ))}
          </div>
        )}
      </SectionWrapper>
    </div>
  );
};

export default DocumentUpload;


