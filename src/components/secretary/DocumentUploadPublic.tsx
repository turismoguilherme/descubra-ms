/**
 * Document Upload Component for Public Sector
 * Componente para upload e gerenciamento de documentos municipais
 * Layout padronizado conforme regras definitivas ViaJAR
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { publicDocumentService, PublicDocument } from '@/services/public/documentService';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Trash2, 
  Download, 
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle,
  Brain
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

const DocumentUploadPublic: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    description: '',
    category: 'outros' as 'plano_diretor' | 'relatorio' | 'lei' | 'portaria' | 'outros',
    tags: [] as string[]
  });

  const categories = [
    { value: 'plano_diretor', label: 'Plano Diretor', icon: '📋' },
    { value: 'relatorio', label: 'Relatório', icon: '📊' },
    { value: 'lei', label: 'Lei', icon: '⚖️' },
    { value: 'portaria', label: 'Portaria', icon: '📝' },
    { value: 'outros', label: 'Outros', icon: '📄' }
  ];

  useEffect(() => {
    if (user?.id) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const docs = await publicDocumentService.getDocuments(user.id, { is_active: true });
      setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      alert('Erro ao carregar documentos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }

      setUploadForm({
        ...uploadForm,
        file,
        title: file.name.replace(/\.[^/.]+$/, '')
      });
    }
  };

  const handleUpload = async () => {
    if (!user?.id || !uploadForm.file) {
      alert('Selecione um arquivo para upload');
      return;
    }

    setIsUploading(true);
    try {
      await publicDocumentService.uploadDocument(user.id, uploadForm.file, {
        title: uploadForm.title || uploadForm.file.name,
        description: uploadForm.description || undefined,
        category: uploadForm.category,
        tags: uploadForm.tags.length > 0 ? uploadForm.tags : undefined
      });

      alert('Documento enviado com sucesso!');
      
      setUploadForm({
        file: null,
        title: '',
        description: '',
        category: 'outros',
        tags: []
      });
      setShowUploadForm(false);
      await loadDocuments();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      alert(`Erro ao fazer upload: ${error.message || 'Tente novamente'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      await publicDocumentService.deleteDocument(id);
      alert('Documento excluído com sucesso!');
      await loadDocuments();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      alert('Erro ao excluir documento. Tente novamente.');
    }
  };

  const handleProcessWithAI = async (id: string) => {
    setIsProcessing(id);
    try {
      await publicDocumentService.processDocumentWithAI(id);
      alert('Documento processado com sucesso!');
      await loadDocuments();
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      alert('Erro ao processar documento. Tente novamente.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDownload = (document: PublicDocument) => {
    const url = publicDocumentService.getDocumentUrl(document);
    window.open(url, '_blank');
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <SectionWrapper 
      variant="default" 
      title="Upload de Documentos"
      subtitle="Gerencie documentos municipais como planos diretores, relatórios, leis e portarias"
      actions={
        <Button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          {showUploadForm ? 'Cancelar' : 'Novo Documento'}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Formulário de Upload */}
        {showUploadForm && (
          <CardBox>
            <h3 className="font-semibold text-slate-800 mb-4">Novo Documento</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="file">Arquivo *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                    className="mt-1"
                  />
                  {uploadForm.file && (
                    <p className="text-sm text-slate-600 mt-1">
                      {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value: any) => setUploadForm({ ...uploadForm, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Ex: Plano Diretor de Turismo 2024"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Descreva o conteúdo do documento..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !uploadForm.file || !uploadForm.title}
                  className="bg-blue-600 hover:bg-blue-700"
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadForm(false);
                    setUploadForm({
                      file: null,
                      title: '',
                      description: '',
                      category: 'outros',
                      tags: []
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardBox>
        )}

        {/* Lista de Documentos em Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardBox key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardBox>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <CardBox>
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-slate-600 font-medium mb-2">Nenhum documento cadastrado</p>
              <p className="text-sm text-slate-500">
                Clique em "Novo Documento" para fazer o primeiro upload
              </p>
            </div>
          </CardBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <CardBox key={doc.id}>
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{doc.title || doc.file_name}</h3>
                    <p className="text-xs text-gray-600">{getCategoryLabel(doc.category || 'outros')}</p>
                  </div>
                  <Badge className={`${getStatusColor(doc.analysis_status)} text-xs`}>
                    {doc.analysis_status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {doc.analysis_status === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    {doc.analysis_status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {doc.analysis_status === 'pending' && 'Pendente'}
                    {doc.analysis_status === 'processing' && 'Processando'}
                    {doc.analysis_status === 'completed' && 'Processado'}
                    {doc.analysis_status === 'failed' && 'Erro'}
                  </Badge>
                </div>

                {/* Informações Secundárias */}
                {doc.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{doc.description}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{format(new Date(doc.created_at), 'dd/MM/yyyy')}</span>
                </div>

                {/* Análise da IA (se disponível) */}
                {doc.analysis_result && doc.analysis_status === 'completed' && (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <Brain className="h-3 w-3 text-green-600" />
                      <span className="font-semibold text-green-800">Análise disponível</span>
                    </div>
                  </div>
                )}

                {/* Ações na parte inferior */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  {doc.analysis_status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProcessWithAI(doc.id)}
                      disabled={isProcessing === doc.id}
                      className="flex-1"
                    >
                      {isProcessing === doc.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Brain className="h-3 w-3 mr-1" />
                      )}
                      Processar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardBox>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default DocumentUploadPublic;
