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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  File, 
  Trash2, 
  Download, 
  Loader2, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileType,
  X,
  Brain,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const DocumentUploadPublic: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<PublicDocument | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    description: '',
    category: 'outros' as 'plano_diretor' | 'relatorio' | 'lei' | 'portaria' | 'outros',
    tags: [] as string[]
  });
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadDocuments = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const docs = await publicDocumentService.getDocuments(user.id, { is_active: true });
      setDocuments(docs || []);
    } catch (err: unknown) {
      console.error('Erro ao carregar documentos:', err);
      setError('Erro ao carregar documentos. Tente novamente.');
      setDocuments([]);
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
        title: file.name.replace(/\.[^/.]+$/, '')
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadForm({
        ...uploadForm,
        file,
        title: file.name.replace(/\.[^/.]+$/, '')
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
      await publicDocumentService.uploadDocument(user.id, uploadForm.file, {
        title: uploadForm.title || uploadForm.file.name,
        description: uploadForm.description || undefined,
        category: uploadForm.category,
        tags: uploadForm.tags.length > 0 ? uploadForm.tags : undefined
      });

      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso!'
      });
      
      setUploadForm({
        file: null,
        title: '',
        description: '',
        category: 'outros',
        tags: []
      });
      await loadDocuments();
    } catch (err: unknown) {
      console.error('Erro ao fazer upload:', err);
      toast({
        title: 'Erro',
        description: err?.message || 'Não foi possível fazer upload do documento',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await publicDocumentService.deleteDocument(id);
      toast({
        title: 'Sucesso',
        description: 'Documento excluído com sucesso'
      });
      await loadDocuments();
    } catch (err: unknown) {
      console.error('Erro ao excluir documento:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o documento',
        variant: 'destructive'
      });
    }
  };

  const handleProcessWithAI = async (id: string) => {
    setIsProcessing(id);
    try {
      await publicDocumentService.processDocumentWithAI(id);
      toast({
        title: 'Sucesso',
        description: 'Documento processado com sucesso!'
      });
      await loadDocuments();
    } catch (err: unknown) {
      console.error('Erro ao processar documento:', err);
      toast({
        title: 'Erro',
        description: err?.message || 'Não foi possível processar o documento',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDownload = async (document: PublicDocument) => {
    try {
      const url = publicDocumentService.getDocumentUrl(document);
      window.open(url, '_blank');
    } catch (err: unknown) {
      console.error('Erro ao fazer download:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer download do documento',
        variant: 'destructive'
      });
    }
  };

  const handleViewAnalysis = (doc: PublicDocument) => {
    setSelectedDocument(doc);
    setIsAnalysisDialogOpen(true);
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return <FileText className="h-5 w-5 text-red-600" />;
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    if (['json', 'xml'].includes(ext || '')) return <FileJson className="h-5 w-5 text-yellow-600" />;
    return <File className="h-5 w-5 text-blue-600" />;
  };

  if (!user) {
    return (
      <SectionWrapper variant="default" title="Upload de Documentos">
        <CardBox>
          <div className="text-center py-8">
            <p className="text-gray-600">Você precisa estar logado para acessar esta funcionalidade.</p>
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <SectionWrapper 
        variant="default" 
        title="Upload de Documentos"
        subtitle="Envie documentos municipais para análise e processamento pela IA"
      >
        {error && (
          <CardBox className="border-red-200 bg-red-50 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardBox>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Área de Upload */}
          <CardBox className="border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-blue-50">
            <div
              className={`p-8 text-center transition-all ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-100' 
                  : 'hover:bg-blue-50'
              } rounded-lg cursor-pointer`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800 mb-1">
                    {uploadForm.file ? uploadForm.file.name : 'Clique ou arraste arquivos aqui'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {uploadForm.file 
                      ? `${formatFileSize(uploadForm.file.size)} • Clique para alterar`
                      : 'Suporte para PDF, Excel, Word e imagens'}
                  </p>
                </div>
                {uploadForm.file && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadForm({ ...uploadForm, file: null, title: '' });
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover arquivo
                  </Button>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              />
            </div>
          </CardBox>

          {/* Formulário de Detalhes */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-700 font-medium">
                Título do Documento
              </Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="Ex: Plano Diretor de Turismo 2024"
                disabled={isUploading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-700 font-medium">
                Descrição (opcional)
              </Label>
              <Input
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Adicione uma descrição..."
                disabled={isUploading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-slate-700 font-medium">
                Categoria
              </Label>
              <Select
                value={uploadForm.category}
                onValueChange={(value: unknown) => setUploadForm({ ...uploadForm, category: value })}
                disabled={isUploading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
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

            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Enviar Documento clicado');
                handleUpload();
              }}
              disabled={!uploadForm.file || isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
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
        </div>
      </SectionWrapper>

      {/* Documents List */}
      <SectionWrapper 
        variant="default" 
        title="Meus Documentos"
        subtitle={`${documents.length} documento(s) cadastrado(s)`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : documents.length === 0 ? (
          <CardBox>
            <div className="text-center py-12">
              <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <File className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-1">Nenhum documento cadastrado</p>
              <p className="text-sm text-slate-500">Envie seu primeiro documento usando o formulário acima</p>
            </div>
          </CardBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <CardBox key={doc.id} className="hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                      {getFileIcon(doc.file_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate mb-1">
                        {doc.title || doc.file_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileType className="h-3 w-3" />
                        <span>{getCategoryLabel(doc.category || 'outros')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.analysis_status === 'processing' && (
                      <Badge className="rounded-full text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Analisando...
                      </Badge>
                    )}
                    {doc.analysis_status === 'completed' && (
                      <Badge className="rounded-full text-xs px-2 py-0.5 bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Analisado
                      </Badge>
                    )}
                    {doc.analysis_status === 'failed' && (
                      <Badge className="rounded-full text-xs px-2 py-0.5 bg-red-100 text-red-700 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Erro
                      </Badge>
                    )}
                    {doc.analysis_status === 'pending' && (
                      <Badge className="rounded-full text-xs px-2 py-0.5 bg-amber-100 text-amber-700 border-amber-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                {doc.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{doc.description}</p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-1">
                    <File className="h-3 w-3" />
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(doc.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botão Download documento clicado', doc.id);
                        handleDownload(doc);
                      }}
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botão Excluir documento clicado', doc.id);
                        handleDelete(doc.id);
                      }}
                      className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {doc.analysis_status === 'completed' && doc.analysis_result && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botão Ver Análise clicado', doc.id);
                        handleViewAnalysis(doc);
                      }}
                      className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Ver Análise
                    </Button>
                  )}
                  {(doc.analysis_status === 'pending' || doc.analysis_status === 'failed') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botão Processar com IA clicado', doc.id);
                        handleProcessWithAI(doc.id);
                      }}
                      disabled={isProcessing === doc.id}
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      {isProcessing === doc.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-1" />
                          Analisar com IA
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardBox>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* Dialog de Análise */}
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDocument && selectedDocument.analysis_result && (
            <>
              <DialogHeader>
                <DialogTitle>Análise do Documento</DialogTitle>
                <DialogDescription>
                  {selectedDocument.title || selectedDocument.file_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Resumo */}
                {selectedDocument.analysis_result.summary && (
                  <CardBox>
                    <h3 className="font-semibold text-slate-800 mb-2">Resumo</h3>
                    <p className="text-sm text-slate-600">
                      {typeof selectedDocument.analysis_result.summary === 'string' 
                        ? selectedDocument.analysis_result.summary
                        : JSON.stringify(selectedDocument.analysis_result.summary, null, 2)}
                    </p>
                  </CardBox>
                )}

                {/* Dados Extraídos */}
                {selectedDocument.analysis_result.extracted_data && (
                  <CardBox>
                    <h3 className="font-semibold text-slate-800 mb-4">Dados Extraídos</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedDocument.analysis_result.extracted_data).map(([key, value]) => {
                        if (value === null || value === undefined) return null;
                        if (Array.isArray(value) && value.length === 0) return null;
                        
                        return (
                          <div key={key} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm text-slate-800">
                                {Array.isArray(value) 
                                  ? JSON.stringify(value, null, 2)
                                  : typeof value === 'object'
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardBox>
                )}

                {/* Principais Pontos */}
                {selectedDocument.analysis_result.key_points && 
                 Array.isArray(selectedDocument.analysis_result.key_points) &&
                 selectedDocument.analysis_result.key_points.length > 0 && (
                  <CardBox>
                    <h3 className="font-semibold text-slate-800 mb-4">Principais Pontos</h3>
                    <ul className="space-y-2">
                      {selectedDocument.analysis_result.key_points.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBox>
                )}

                {/* Recomendações */}
                {selectedDocument.analysis_result.recommendations && 
                 Array.isArray(selectedDocument.analysis_result.recommendations) &&
                 selectedDocument.analysis_result.recommendations.length > 0 && (
                  <CardBox>
                    <h3 className="font-semibold text-slate-800 mb-4">Recomendações</h3>
                    <ul className="space-y-2">
                      {selectedDocument.analysis_result.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <Brain className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBox>
                )}

                {/* Métricas Extraídas */}
                {selectedDocument.analysis_result.extracted_metrics && (
                  <CardBox>
                    <h3 className="font-semibold text-slate-800 mb-4">Métricas Extraídas</h3>
                    <div className="space-y-4">
                      {selectedDocument.analysis_result.extracted_metrics.numbers && 
                       Array.isArray(selectedDocument.analysis_result.extracted_metrics.numbers) &&
                       selectedDocument.analysis_result.extracted_metrics.numbers.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Números</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedDocument.analysis_result.extracted_metrics.numbers.map((metric: unknown, index: number) => (
                              <div key={index} className="p-2 bg-blue-50 rounded-lg">
                                <p className="text-xs text-slate-600">{metric.label}</p>
                                <p className="text-lg font-semibold text-blue-700">
                                  {metric.value} {metric.unit || ''}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedDocument.analysis_result.extracted_metrics.percentages && 
                       Array.isArray(selectedDocument.analysis_result.extracted_metrics.percentages) &&
                       selectedDocument.analysis_result.extracted_metrics.percentages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Percentuais</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedDocument.analysis_result.extracted_metrics.percentages.map((metric: unknown, index: number) => (
                              <div key={index} className="p-2 bg-green-50 rounded-lg">
                                <p className="text-xs text-slate-600">{metric.label}</p>
                                <p className="text-lg font-semibold text-green-700">{metric.value}%</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedDocument.analysis_result.extracted_metrics.totals && 
                       Array.isArray(selectedDocument.analysis_result.extracted_metrics.totals) &&
                       selectedDocument.analysis_result.extracted_metrics.totals.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Totais</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedDocument.analysis_result.extracted_metrics.totals.map((metric: unknown, index: number) => (
                              <div key={index} className="p-2 bg-purple-50 rounded-lg">
                                <p className="text-xs text-slate-600">{metric.label}</p>
                                <p className="text-lg font-semibold text-purple-700">{metric.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBox>
                )}

                {/* Comparação com Dados do Sistema */}
                {selectedDocument.analysis_result.comparison && (
                  <CardBox>
                    <h3 className="font-semibold text-slate-800 mb-4">Comparação com Dados do Sistema</h3>
                    <div className="space-y-4">
                      {selectedDocument.analysis_result.comparison.differences && 
                       Array.isArray(selectedDocument.analysis_result.comparison.differences) &&
                       selectedDocument.analysis_result.comparison.differences.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Diferenças Encontradas</h4>
                          <div className="space-y-2">
                            {selectedDocument.analysis_result.comparison.differences.map((diff: unknown, index: number) => (
                              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm font-medium text-slate-800">{diff.metric}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs">
                                  <span className="text-slate-600">Documento: {diff.documentValue}</span>
                                  <span className="text-slate-600">Sistema: {diff.systemValue}</span>
                                  <span className={`font-semibold ${diff.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Diferença: {diff.difference > 0 ? '+' : ''}{diff.difference}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedDocument.analysis_result.comparison.suggestions && 
                       Array.isArray(selectedDocument.analysis_result.comparison.suggestions) &&
                       selectedDocument.analysis_result.comparison.suggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Sugestões</h4>
                          <ul className="space-y-1">
                            {selectedDocument.analysis_result.comparison.suggestions.map((suggestion: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardBox>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUploadPublic;
