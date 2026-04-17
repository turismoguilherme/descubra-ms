import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Shield, CheckCircle2, ArrowLeft, Loader2, Upload, Download } from 'lucide-react';
import { policyService } from '@/services/public/policyService';
import { generatePartnerTermsPDF, savePartnerTermsAcceptance } from '@/services/partners/partnerTermsService';
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
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [termsVersion, setTermsVersion] = useState(1);
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const policy = await policyService.getPublishedPolicy('partner_terms', 'descubra_ms');
      if (policy) {
        setTermsContent(policy.content || '');
        setTermsVersion(policy.version || 1);
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
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.type)) {
      setUploadedPdf(file);
    } else {
      toast({ title: 'Arquivo inválido', description: 'Envie um arquivo PDF, JPG ou PNG', variant: 'destructive' });
    }
  }, [toast]);

  const uploadPhysicalPdf = async (): Promise<string> => {
    if (!uploadedPdf) return '';
    try {
      const ext = uploadedPdf.name.split('.').pop() || 'pdf';
      const fileName = `partner-terms-uploaded/${partnerId}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('documents').upload(fileName, uploadedPdf, { contentType: uploadedPdf.type });
      if (error) {
        console.error('Erro upload PDF físico:', error);
        return '';
      }
      const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
      return data?.publicUrl || '';
    } catch (err) {
      console.error('Erro upload PDF físico:', err);
      return '';
    }
  };

  const handleAcceptTerms = async () => {
    if (!hasReadTerms) {
      toast({ title: 'Leia os termos', description: 'Você deve ler e aceitar o termo de parceria', variant: 'destructive' });
      return;
    }
    if (!uploadedPdf) {
      toast({ title: 'Upload obrigatório', description: 'Envie o termo assinado fisicamente (PDF/JPG/PNG)', variant: 'destructive' });
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

      const uploadedPdfUrl = await uploadPhysicalPdf();
      if (!uploadedPdfUrl) {
        throw new Error('Falha ao enviar o documento físico. Tente novamente.');
      }

      let pdfUrl = '';
      try {
        pdfUrl = await generatePartnerTermsPDF(partnerId, partnerName, partnerEmail, termsVersion, ipAddress);
      } catch (pdfErr) {
        console.error('Erro ao gerar PDF digital:', pdfErr);
      }

      await savePartnerTermsAcceptance(partnerId, partnerName, partnerEmail, termsVersion, pdfUrl, ipAddress, undefined, uploadedPdfUrl);

      toast({ title: 'Termo aceito!', description: 'Aceite registrado e documento enviado para revisão.' });
      onComplete({ termsAccepted: true, termsVersion });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao aceitar termo:', err);
      toast({ title: 'Erro', description: err.message || 'Não foi possível processar o aceite', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBlankTerm = () => {
    const blob = new Blob([termsContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `termo-parceria-v${termsVersion}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando termo de parceria...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Termo de Parceria
          </CardTitle>
          <CardDescription>Leia, baixe para assinar fisicamente, depois aceite e envie</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Passo 1: Ler */}
          <div className="border rounded-lg p-4 bg-muted/50 max-h-64 overflow-y-auto">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: policyService.markdownToHtml(termsContent.substring(0, 500) + '...') }} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowTermsDialog(true)} className="flex-1">
              <FileText className="w-4 h-4 mr-2" /> Ler Termo Completo
            </Button>
            <Button variant="outline" onClick={handleDownloadBlankTerm} className="flex-1">
              <Download className="w-4 h-4 mr-2" /> Baixar Termo para Assinar
            </Button>
          </div>

          {/* Passo 2: Aceite digital */}
          <div className="border rounded-lg p-4 bg-primary/5">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="read_terms"
                checked={hasReadTerms}
                onCheckedChange={(c) => setHasReadTerms(c as boolean)}
                className="h-6 w-6 border-2 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Label htmlFor="read_terms" className="cursor-pointer text-base font-semibold">
                    Li e aceito o{' '}
                    <button type="button" onClick={() => setShowTermsDialog(true)} className="text-primary hover:underline font-bold">
                      Termo de Parceria
                    </button>
                  </Label>
                  <Badge variant="destructive">OBRIGATÓRIO</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ao aceitar, você está <strong>assinando eletronicamente</strong> este termo (registramos nome, email, IP e data/hora).
                </p>
              </div>
            </div>
          </div>

          {/* Passo 3: Upload físico obrigatório */}
          <div className="p-4 border-2 rounded-lg border-dashed border-primary/50">
            <h4 className="font-semibold mb-2 flex items-center gap-2 flex-wrap">
              <Upload className="w-4 h-4" /> Enviar Termo Assinado Fisicamente
              <Badge variant="destructive" className="text-xs">OBRIGATÓRIO</Badge>
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Imprima o termo, assine à mão, escaneie ou fotografe e faça upload aqui (PDF, JPG ou PNG).
            </p>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
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
              ⚠️ Aceite o termo e envie o documento assinado para finalizar
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termo de Parceria - Versão {termsVersion}</DialogTitle>
            <DialogDescription>Leia atentamente todos os termos e condições</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none mt-4" dangerouslySetInnerHTML={{ __html: policyService.markdownToHtml(termsContent) }} />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleDownloadBlankTerm}>
              <Download className="w-4 h-4 mr-2" /> Baixar Termo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
