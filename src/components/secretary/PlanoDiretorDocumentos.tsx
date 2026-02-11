// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Trash2, Eye, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Documento, PlanoDiretorDocument } from '@/services/public/planoDiretorService';
import FileUpload from '@/components/ui/FileUpload';
import { UploadResult } from '@/services/storage/FileUploadService';
import { jsPDF } from 'jspdf';

interface PlanoDiretorDocumentosProps {
  planoId: string;
  onUpdate?: () => void;
}

const PlanoDiretorDocumentos: React.FC<PlanoDiretorDocumentosProps> = ({ planoId, onUpdate }) => {
  const { toast } = useToast();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocumentos();
  }, [planoId]);

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      const data = await planoDiretorService.getDocumentos(planoId);
      setDocumentos(data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (results: UploadResult[]) => {
    try {
      setUploading(true);
      
      for (const result of results) {
        await planoDiretorService.uploadDocumento(planoId, {
          titulo: result.fileName || result.path.split('/').pop() || 'Documento',
          tipo: 'outro',
          arquivoUrl: result.url,
          tamanhoBytes: result.size || 0,
          versao: '1.0'
        });
      }

      await loadDocumentos();
      onUpdate?.();
      toast({
        title: 'Sucesso',
        description: `${results.length} documento(s) enviado(s) com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload do documento.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await planoDiretorService.deleteDocumento(id);
      await loadDocumentos();
      onUpdate?.();
      toast({
        title: 'Sucesso',
        description: 'Documento excluído com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o documento.',
        variant: 'destructive'
      });
    }
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      estudo: 'bg-blue-100 text-blue-800',
      relatorio: 'bg-green-100 text-green-800',
      apresentacao: 'bg-purple-100 text-purple-800',
      lei: 'bg-red-100 text-red-800',
      decreto: 'bg-orange-100 text-orange-800',
      outro: 'bg-gray-100 text-gray-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleExportPDF = async () => {
    try {
      const plano = await planoDiretorService.getPlanoDiretorById(planoId);
      if (!plano) {
        toast({
          title: 'Erro',
          description: 'Plano não encontrado.',
          variant: 'destructive'
        });
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPosition = margin;

      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246);
      doc.text('Plano Diretor de Turismo', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(plano.titulo, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${plano.municipio} - ${plano.municipioUf} • ${plano.periodo}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
      );
      yPosition += 15;

      // Informações gerais
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.text('Informações Gerais', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Status: ${plano.status}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Versão: ${plano.versao}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Criado em: ${new Date(plano.dataCriacao).toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 10;

      // Objetivos
      if (plano.objetivos && plano.objetivos.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(12);
        doc.setTextColor(59, 130, 246);
        doc.text('Objetivos', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        plano.objetivos.forEach((objetivo, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(`${index + 1}. ${objetivo.titulo}`, margin, yPosition);
          yPosition += 6;
          const descLines = doc.splitTextToSize(objetivo.descricao || '', pageWidth - 2 * margin);
          doc.text(descLines, margin + 5, yPosition);
          yPosition += descLines.length * 5 + 3;
        });
        yPosition += 5;
      }

      // Estratégias
      if (plano.estrategias && plano.estrategias.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(12);
        doc.setTextColor(59, 130, 246);
        doc.text('Estratégias', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        plano.estrategias.forEach((estrategia, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(`${index + 1}. ${estrategia.titulo}`, margin, yPosition);
          yPosition += 6;
          const descLines = doc.splitTextToSize(estrategia.descricao || '', pageWidth - 2 * margin);
          doc.text(descLines, margin + 5, yPosition);
          yPosition += descLines.length * 5 + 3;
        });
        yPosition += 5;
      }

      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${i} de ${totalPages} • Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Salvar PDF
      doc.save(`Plano_Diretor_${plano.municipio}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Sucesso',
        description: 'PDF exportado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar o PDF.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Documentos Anexos
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                options={{
                  folder: `plano-diretor/${planoId}`,
                  allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
                }}
                multiple={true}
                maxFiles={5}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Carregando documentos...</p>
          ) : documentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum documento anexado ainda.</p>
              <p className="text-sm mt-2">Clique em "Upload Documento" para adicionar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documentos.map((documento) => (
                <Card key={documento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{documento.titulo}</h3>
                          <Badge className={getTipoColor(documento.tipo)}>
                            {documento.tipo}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {documento.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Tamanho: {formatFileSize(documento.tamanho)}</span>
                          <span>Versão: {documento.versao}</span>
                          <span>
                            Upload: {new Date(documento.dataUpload).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(documento.arquivo, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = documento.arquivo;
                            link.download = documento.titulo;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(documento.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanoDiretorDocumentos;

