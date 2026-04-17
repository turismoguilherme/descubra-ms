import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Shield, CheckCircle2, ArrowLeft, Loader2, Upload, Download, AlertCircle, ExternalLink } from 'lucide-react';
import { policyService } from '@/services/public/policyService';
import {
  generatePartnerTermsPDF,
  savePartnerTermsAcceptance,
  downloadPartnerTermsPdfTemplate,
} from '@/services/partners/partnerTermsService';
import { supabase } from '@/integrations/supabase/client';

interface PartnerTermsAcceptanceProps {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  onComplete: (data: { termsAccepted: boolean; termsVersion: number }) => void;
  onBack: () => void;
}

export default function PartnerTermsAcceptance({
  partnerId,
  partnerName,
  partnerEmail,
  onComplete,
  onBack,
}: PartnerTermsAcceptanceProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [termsVersion, setTermsVersion] = useState(1);
  const [termsPdfUrl, setTermsPdfUrl] = useState<string | null>(null);
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const policy = await policyService.getPublishedPolicy('partner_terms', 'descubra_ms');
      if (policy) {
        setTermsContent((policy.content || '').trim());
        setTermsVersion(policy.version || 1);
        setTermsPdfUrl(policy.terms_pdf_url?.trim() || null);
      } else {
        setTermsContent('Termo de Parceria - Descubra Mato Grosso do Sul\n\nConteúdo do termo será configurado pelo administrador.');
      }
    } catch (error) {
      console.error('Erro ao carregar termo:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar o termo de parceria', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ title: 'Arquivo inválido', description: 'Envie apenas arquivos PDF (assinado por gov.br ou outro certificador).', variant: 'destructive' });
      e.target.value = '';
      return;
    }
    // Limite de 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'O PDF deve ter no máximo 10MB.', variant: 'destructive' });
      e.target.value = '';
      return;
    }
    setUploadedPdf(file);
  }, [toast]);

  const uploadSignedPdf = async (): Promise<string> => {
    if (!uploadedPdf) return '';
    try {
      const fileName = `partner-terms-uploaded/${partnerId}-${Date.now()}.pdf`;
      const { error } = await supabase.storage.from('documents').upload(fileName, uploadedPdf, { contentType: 'application/pdf' });
      if (error) {
        console.error('Erro upload PDF assinado:', error);
        return '';
      }
      const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
      return data?.publicUrl || '';
    } catch (err) {
      console.error('Erro upload PDF assinado:', err);
      return '';
    }
  };

  const handleAcceptTerms = async () => {
    if (!hasReadTerms) {
      toast({ title: 'Aceite obrigatório', description: 'Você deve marcar que leu e aceita o termo.', variant: 'destructive' });
      return;
    }
    if (!uploadedPdf) {
      toast({ title: 'Upload obrigatório', description: 'Envie o termo assinado em PDF.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      let ipAddress: string | null = null;
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ipAddress = ipData.ip;
      } catch { /* ignore */ }

      const uploadedPdfUrl = await uploadSignedPdf();
      if (!uploadedPdfUrl) {
        throw new Error('Falha ao enviar o PDF assinado. Tente novamente.');
      }

      let pdfUrl = '';
      try {
        pdfUrl = await generatePartnerTermsPDF(partnerId, partnerName, partnerEmail, termsVersion, ipAddress);
      } catch (pdfErr) {
        console.error('Erro ao gerar PDF de aceite:', pdfErr);
      }

      await savePartnerTermsAcceptance(partnerId, partnerName, partnerEmail, termsVersion, pdfUrl, ipAddress, undefined, uploadedPdfUrl);

      toast({ title: 'Termo aceito!', description: 'Aceite registrado e documento assinado enviado para revisão.' });
      onComplete({ termsAccepted: true, termsVersion });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao aceitar termo:', err);
      toast({ title: 'Erro', description: err.message || 'Não foi possível processar o aceite', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando termo de parceria...</p>
      </div>
    );
  }

  const hasTextBody = termsContent.trim().length > 0;
  const termsHtml = hasTextBody ? policyService.markdownToHtml(termsContent) : '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Termo de Parceria
          </CardTitle>
          <CardDescription>
            Leia o termo, baixe para assinar (gov.br ou outro), depois aceite e envie o PDF assinado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Passo 1: Visualizador PDF embutido */}
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Passo 1: Leia o Termo de Parceria
              </h4>
              {termsPdfUrl ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={termsPdfUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" /> Baixar PDF para Assinar
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-primary">
                    <a href={termsPdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" /> Abrir em nova aba
                    </a>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={downloadingTemplate || !hasTextBody}
                  onClick={async () => {
                    setDownloadingTemplate(true);
                    try {
                      await downloadPartnerTermsPdfTemplate(partnerName, partnerEmail, termsVersion);
                      toast({ title: 'Download iniciado', description: 'Salve o PDF, assine e envie abaixo.' });
                    } catch (e) {
                      console.error(e);
                      toast({ title: 'Erro', description: 'Não foi possível gerar o PDF.', variant: 'destructive' });
                    } finally {
                      setDownloadingTemplate(false);
                    }
                  }}
                >
                  {downloadingTemplate ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Baixar modelo PDF
                </Button>
              )}
            </div>

            {termsPdfUrl ? (
              <div className="space-y-2">
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  <iframe
                    src={`${termsPdfUrl}#toolbar=1&navpanes=0`}
                    title="Termo de Parceria"
                    className="w-full h-[500px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Se o PDF não aparecer aqui, use <strong>Abrir em nova aba</strong> acima.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto">
                {termsHtml ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: termsHtml }} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8" />
                    <p>O termo de parceria ainda não foi configurado pelo administrador.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Passo 2: Aceite eletrônico */}
          <div className="border rounded-lg p-4 bg-primary/5">
            <h4 className="font-semibold mb-3 flex items-center gap-2 flex-wrap">
              Passo 2: Aceite Eletrônico
              <Badge variant="destructive" className="text-xs">OBRIGATÓRIO</Badge>
            </h4>
            <div className="flex items-start space-x-4">
              <Checkbox
                id="read_terms"
                checked={hasReadTerms}
                onCheckedChange={(c) => setHasReadTerms(c as boolean)}
                className="h-6 w-6 border-2 mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="read_terms" className="cursor-pointer text-base font-semibold block mb-1">
                  Li e aceito o Termo de Parceria
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ao marcar, você está <strong>aceitando eletronicamente</strong> este termo. Registramos nome, email, IP e data/hora.
                </p>
              </div>
            </div>
          </div>

          {/* Passo 3: Upload PDF assinado */}
          <div className="p-4 border-2 rounded-lg border-dashed border-primary/50">
            <h4 className="font-semibold mb-2 flex items-center gap-2 flex-wrap">
              <Upload className="w-4 h-4" /> Passo 3: Enviar PDF Assinado
              <Badge variant="destructive" className="text-xs">OBRIGATÓRIO</Badge>
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Baixe o termo acima, assine digitalmente (gov.br, certificado digital, etc.) ou imprima e assine à mão (depois escaneie em PDF), e envie aqui. <strong>Apenas arquivos .pdf</strong> são aceitos.
            </p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {uploadedPdf && (
              <p className="text-sm text-primary mt-2 font-medium">✅ {uploadedPdf.name} selecionado</p>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <Button
              onClick={handleAcceptTerms}
              disabled={saving || !hasReadTerms || !uploadedPdf}
              className="flex-1"
              size="lg"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar Cadastro</>
              )}
            </Button>
          </div>

          {(!hasReadTerms || !uploadedPdf) && (
            <p className="text-center text-sm text-destructive font-medium">
              ⚠️ Aceite o termo e envie o PDF assinado para finalizar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
