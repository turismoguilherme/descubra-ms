import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Shield, CheckCircle2, Info, ArrowLeft, Loader2, Upload, Download } from 'lucide-react';
import { policyService } from '@/services/public/policyService';
import { generatePartnerTermsPDF, savePartnerTermsAcceptance } from '@/services/partners/partnerTermsService';
import { supabase } from '@/integrations/supabase/client';
import SignatureCanvas from './SignatureCanvas';

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
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

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

  const handleSignatureChange = useCallback((dataUrl: string | null) => {
    setSignatureDataUrl(dataUrl);
  }, []);

  const handlePdfUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedPdf(file);
    } else {
      toast({ title: 'Arquivo inválido', description: 'Por favor, envie um arquivo PDF', variant: 'destructive' });
    }
  }, [toast]);

  const uploadSignatureImage = async (): Promise<string> => {
    if (!signatureDataUrl) return '';
    try {
      const res = await fetch(signatureDataUrl);
      const blob = await res.blob();
      const fileName = `signatures/sig-${partnerId}-${Date.now()}.png`;
      const { error } = await supabase.storage.from('documents').upload(fileName, blob, { contentType: 'image/png' });
      if (error) {
        console.error('Erro upload assinatura:', error);
        return '';
      }
      const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
      return data?.publicUrl || '';
    } catch (err) {
      console.error('Erro upload assinatura:', err);
      return '';
    }
  };

  const uploadPhysicalPdf = async (): Promise<string> => {
    if (!uploadedPdf) return '';
    try {
      const fileName = `partner-terms-uploaded/${partnerId}-${Date.now()}.pdf`;
      const { error } = await supabase.storage.from('documents').upload(fileName, uploadedPdf, { contentType: 'application/pdf' });
      if (error) {
        console.error('Erro upload PDF:', error);
        return '';
      }
      const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
      return data?.publicUrl || '';
    } catch (err) {
      console.error('Erro upload PDF:', err);
      return '';
    }
  };

  const handleAcceptTerms = async () => {
    if (!hasReadTerms) {
      toast({ title: 'Leia os termos', description: 'Por favor, leia e aceite o termo de parceria para continuar', variant: 'destructive' });
      return;
    }
    if (!signatureDataUrl) {
      toast({ title: 'Assinatura obrigatória', description: 'Por favor, desenhe sua assinatura digital para continuar', variant: 'destructive' });
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

      // Upload signature image
      const sigUrl = await uploadSignatureImage();

      // Upload physical PDF if provided
      const uploadedPdfUrl = await uploadPhysicalPdf();

      // Generate digital PDF
      let pdfUrl = '';
      try {
        pdfUrl = await generatePartnerTermsPDF(partnerId, partnerName, partnerEmail, termsVersion, ipAddress, signatureDataUrl);
        setGeneratedPdfUrl(pdfUrl);
      } catch (pdfErr) {
        console.error('Erro ao gerar PDF:', pdfErr);
      }

      // Save acceptance
      await savePartnerTermsAcceptance(partnerId, partnerName, partnerEmail, termsVersion, pdfUrl, ipAddress, sigUrl, uploadedPdfUrl);

      toast({ title: 'Termo aceito!', description: 'Você aceitou o termo de parceria. Prosseguindo...' });
      onComplete({ termsAccepted: true, termsVersion });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao aceitar termo:', err);
      toast({ title: 'Erro', description: err.message || 'Não foi possível processar o aceite do termo', variant: 'destructive' });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Termo de Parceria
          </CardTitle>
          <CardDescription>Leia atentamente o termo de parceria antes de aceitar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview */}
          <div className="border rounded-lg p-4 bg-muted/50 max-h-64 overflow-y-auto">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: policyService.markdownToHtml(termsContent.substring(0, 500) + '...') }} />
          </div>

          <Button variant="outline" onClick={() => setShowTermsDialog(true)} className="w-full">
            <FileText className="w-4 h-4 mr-2" /> Ler Termo Completo
          </Button>

          {/* Aceite */}
          <div className="border rounded-lg p-4 bg-primary/5">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="read_terms"
                checked={hasReadTerms}
                onCheckedChange={(c) => setHasReadTerms(c as boolean)}
                className="h-6 w-6 border-2 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="read_terms" className="cursor-pointer text-base font-semibold">
                    Li e aceito o{' '}
                    <button type="button" onClick={() => setShowTermsDialog(true)} className="text-primary hover:underline font-bold">
                      Termo de Parceria
                    </button>
                  </Label>
                  <Badge variant="destructive" className="ml-2">OBRIGATÓRIO</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Ao aceitar, você está <strong>assinando eletronicamente</strong> este termo.
                </p>
              </div>
            </div>
          </div>

          {/* Assinatura Digital */}
          {hasReadTerms && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 border rounded-lg">
                <h4 className="font-semibold mb-1">Dados da Assinatura</h4>
                <p className="text-sm text-muted-foreground">Nome: <strong>{partnerName}</strong></p>
                <p className="text-sm text-muted-foreground">Email: <strong>{partnerEmail}</strong></p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Assinatura Digital <Badge variant="destructive" className="ml-2 text-xs">OBRIGATÓRIO</Badge></h4>
                <p className="text-sm text-muted-foreground mb-3">Desenhe sua assinatura no campo abaixo (mouse ou toque):</p>
                <SignatureCanvas onSignatureChange={handleSignatureChange} />
              </div>

              {/* Upload PDF opcional */}
              <div className="p-4 border rounded-lg border-dashed">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Enviar Termo Assinado em PDF
                  <Badge variant="secondary" className="text-xs">OPCIONAL</Badge>
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Se preferir, baixe o termo, assine fisicamente e envie o PDF digitalizado.
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {uploadedPdf && (
                  <p className="text-sm text-green-600 mt-2">✅ {uploadedPdf.name} selecionado</p>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <Button
              onClick={handleAcceptTerms}
              disabled={saving || !hasReadTerms || !signatureDataUrl}
              className="flex-1"
              size="lg"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Aceitar e Continuar</>
              )}
            </Button>
          </div>

          {!hasReadTerms && (
            <p className="text-center text-sm text-destructive font-medium">⚠️ Você deve ler e aceitar os termos para continuar</p>
          )}
        </CardContent>
      </Card>

      {/* Dialog termo completo */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termo de Parceria - Versão {termsVersion}</DialogTitle>
            <DialogDescription>Leia atentamente todos os termos e condições</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none mt-4" dangerouslySetInnerHTML={{ __html: policyService.markdownToHtml(termsContent) }} />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => {
              const blob = new Blob([termsContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `termo-parceria-v${termsVersion}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}>
              <Download className="w-4 h-4 mr-2" /> Baixar Termo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
