/**
 * Document Upload Component
 * Componente para upload e gerenciamento de documentos
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { documentService, Document } from '@/services/viajar/documentService';
import { useBusinessType } from '@/hooks/useBusinessType';
import { documentProcessor, ExtractedMetric } from '@/services/viajar/DocumentProcessor';
import { useBusinessSegment } from '@/hooks/useBusinessSegment';
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
  DialogTrigger,
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
  Eye,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

const DocumentUpload: React.FC = () => {
  try {
    const auth = useAuth();
    const { user } = auth || { user: null };
    const { businessType } = useBusinessType();
    const { category: businessCategory } = useBusinessSegment();
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
    const [extractedMetrics, setExtractedMetrics] = useState<ExtractedMetric[]>([]);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [processingDocumentId, setProcessingDocumentId] = useState<string | null>(null);
    const [uploadForm, setUploadForm] = useState({
      file: null as File | null,
      title: '',
      description: '',
      category: '',
      tags: [] as string[]
    });
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

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
        const docs = await documentService.getDocuments(user.id, { is_active: true });
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
      const file = e.dataTransfer.files[0];
      if (file) {
        setUploadForm({
          ...uploadForm,
          file,
          title: file.name.replace(/\.[^/.]+$/, '')
        });
      }
    };

    const handleUpload = async () => {
      if (!user?.id || !uploadForm.file) return;

      setIsUploading(true);
      setError(null);
      try {
        const uploadedDoc = await documentService.uploadDocument(
          user.id,
          uploadForm.file,
          {
            title: uploadForm.title || uploadForm.file.name,
            description: uploadForm.description || null,
            category: uploadForm.category || null,
            tags: uploadForm.tags
          }
        );

        toast({
          title: 'Sucesso',
          description: 'Documento enviado com sucesso. Iniciando análise...'
        });

        setUploadForm({
          file: null,
          title: '',
          description: '',
          category: '',
          tags: []
        });

        await loadDocuments();

        // Processar documento com DocumentProcessor (Gemini 1.5 Flash)
        try {
          setIsAnalyzing(uploadedDoc.id);
          setProcessingDocumentId(uploadedDoc.id);
          
          // Processar arquivo com DocumentProcessor
          const result = await documentProcessor.processFile(
            uploadForm.file!,
            user.id,
            businessCategory || undefined
          );

          if (result.success && result.extractedMetrics.length > 0) {
            // Mostrar modal de confirmação com métricas extraídas
            setExtractedMetrics(result.extractedMetrics);
            setIsConfirmDialogOpen(true);
          } else {
            // Se não extraiu métricas, usar análise tradicional
            await documentService.analyzeDocument(uploadedDoc.id, businessType || undefined);
            toast({
              title: 'Análise concluída',
              description: 'Documento analisado com sucesso!'
            });
            await loadDocuments();
          }
        } catch (err) {
          console.error('Erro ao processar documento:', err);
          toast({
            title: 'Aviso',
            description: 'Documento enviado, mas processamento falhou. Você pode tentar analisar manualmente.',
            variant: 'destructive'
          });
        } finally {
          setIsAnalyzing(null);
          setProcessingDocumentId(null);
        }
      } catch (err: unknown) {
        console.error('Erro ao fazer upload:', err);
        const errorMessage = err?.message || 'Não foi possível fazer upload do documento';
        setError(errorMessage);
        toast({
          title: 'Erro',
          description: errorMessage,
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
      } catch (err: unknown) {
        console.error('Erro ao excluir documento:', err);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o documento',
          variant: 'destructive'
        });
      }
    };

    const handleAnalyze = async (docId: string) => {
      setIsAnalyzing(docId);
      try {
        await documentService.analyzeDocument(docId, businessType || undefined);
        toast({
          title: 'Sucesso',
          description: 'Documento analisado com sucesso!'
        });
        await loadDocuments();
      } catch (err: unknown) {
        console.error('Erro ao analisar documento:', err);
        toast({
          title: 'Erro',
          description: err?.message || 'Não foi possível analisar o documento',
          variant: 'destructive'
        });
      } finally {
        setIsAnalyzing(null);
      }
    };

    const handleViewAnalysis = (doc: Document) => {
      setSelectedDocument(doc);
      setIsAnalysisDialogOpen(true);
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
      } catch (err: unknown) {
        console.error('Erro ao fazer download:', err);
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

    const getFileIcon = (fileName: string) => {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (['pdf'].includes(ext || '')) return <FileText className="h-5 w-5 text-red-600" />;
      if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      if (['json', 'xml'].includes(ext || '')) return <FileJson className="h-5 w-5 text-yellow-600" />;
      return <File className="h-5 w-5 text-blue-600" />;
    };

    const getCategoryLabel = (category: string | null) => {
      const labels: Record<string, string> = {
        cnpj: 'CNPJ',
        alvara: 'Alvará',
        contrato: 'Contrato',
        outro: 'Outro'
      };
      return labels[category || 'outro'] || 'Outro';
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
          subtitle="Envie documentos para análise e processamento pela IA"
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
                  placeholder="Ex: CNPJ da Empresa"
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
                  onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
                  disabled={isUploading}
                >
                  <SelectTrigger className="mt-1">
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
                          <span>{getCategoryLabel(doc.category)}</span>
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {doc.analysis_status === 'completed' && doc.analysis_result && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAnalysis(doc)}
                        className="w-full border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver Análise
                      </Button>
                    )}
                    {(doc.analysis_status === 'pending' || doc.analysis_status === 'failed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyze(doc.id)}
                        disabled={isAnalyzing === doc.id}
                        className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        {isAnalyzing === doc.id ? (
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

        {/* Dialog de Confirmação de Métricas Extraídas */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Métricas Extraídas do Documento</DialogTitle>
              <DialogDescription>
                Confirme os dados extraídos antes de salvar no sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {extractedMetrics.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {extractedMetrics.map((metric, index) => (
                      <CardBox key={index} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-800 capitalize">
                              {metric.metric_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-slate-500">
                              Data: {new Date(metric.metric_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {metric.value.toLocaleString('pt-BR', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </p>
                          </div>
                        </div>
                      </CardBox>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsConfirmDialogOpen(false);
                        setExtractedMetrics([]);
                        setProcessingDocumentId(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!user?.id || !processingDocumentId) return;
                        
                        try {
                          // Salvar métricas no banco
                          const { saved, errors } = await documentProcessor.saveMetrics(
                            user.id,
                            processingDocumentId,
                            extractedMetrics
                          );

                          if (saved > 0) {
                            toast({
                              title: 'Sucesso',
                              description: `${saved} métrica(s) salva(s) com sucesso!`
                            });
                          }

                          if (errors > 0) {
                            toast({
                              title: 'Aviso',
                              description: `${errors} métrica(s) não puderam ser salvas.`,
                              variant: 'destructive'
                            });
                          }

                          setIsConfirmDialogOpen(false);
                          setExtractedMetrics([]);
                          setProcessingDocumentId(null);
                          await loadDocuments();
                        } catch (err: unknown) {
                          console.error('Erro ao salvar métricas:', err);
                          toast({
                            title: 'Erro',
                            description: 'Não foi possível salvar as métricas.',
                            variant: 'destructive'
                          });
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar e Salvar
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600">Nenhuma métrica extraída.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
                        {selectedDocument.analysis_result.summary}
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
                   selectedDocument.analysis_result.recommendations.length > 0 && (
                    <CardBox>
                      <h3 className="font-semibold text-slate-800 mb-4">Recomendações</h3>
                      <ul className="space-y-2">
                        {selectedDocument.analysis_result.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBox>
                  )}

                  {/* Confiança */}
                  {selectedDocument.analysis_result.confidence !== undefined && (
                    <CardBox>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">Confiança da Análise</span>
                        <Badge className={
                          selectedDocument.analysis_result.confidence >= 0.8
                            ? 'bg-green-100 text-green-700'
                            : selectedDocument.analysis_result.confidence >= 0.6
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }>
                          {(selectedDocument.analysis_result.confidence * 100).toFixed(0)}%
                        </Badge>
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
  } catch (err: unknown) {
    console.error('Erro no componente DocumentUpload:', err);
    return (
      <SectionWrapper variant="default" title="Upload de Documentos">
        <CardBox className="border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Erro ao carregar componente</p>
              <p className="text-sm text-red-700 mt-1">
                {err?.message || 'Ocorreu um erro inesperado. Por favor, recarregue a página.'}
              </p>
            </div>
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }
};

export default DocumentUpload;
