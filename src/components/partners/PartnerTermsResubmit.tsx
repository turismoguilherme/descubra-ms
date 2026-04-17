import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Shield, CheckCircle2, Loader2, Upload, AlertCircle } from 'lucide-react';
import { policyService } from '@/services/public/policyService';
import { generatePartnerTermsPDF, savePartnerTermsAcceptance } from '@/services/partners/partnerTermsService';
import { supabase } from '@/integrations/supabase/client';

interface PartnerTermsResubmitProps {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  onComplete: () => void;
}

/**
 * Reenvio de termo após admin marcar ajuste (review_status ou status revision_requested).
 */
export default function PartnerTermsResubmit({
  partnerId,
  partnerName,
  partnerEmail,
  onComplete,
}: PartnerTermsResubmitProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [termsVersion, setTermsVersion] = useState(1);
  const [termsPdfUrl, setTermsPdfUrl] = useState<string | null>(null);
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const policy = await policyService.getPublishedPolicy('partner_terms', 'descubra_ms');
        if (policy) {
          setTermsContent((policy.content || '').trim());
          setTermsVersion(policy.version || 1);
          setTermsPdfUrl(policy.terms_pdf_url?.trim() || null);
        }
        const { data: last } = await supabase
          .from('partner_terms_acceptances')
          .select('review_notes')
          .eq('partner_id', partnerId)
          .order('signed_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setReviewNotes(last?.review_notes ?? null);
      } catch (e) {
        console.error(e);
        toast({ title: 'Erro', description: 'Não foi possível carregar o termo.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [partnerId, toast]);

  const handlePdfUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.type !== 'application/pdf') {
        toast({ title: 'Arquivo inválido', description: 'Envie apenas PDF.', variant: 'destructive' });
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Arquivo muito grande', description: 'Máximo 10MB.', variant: 'destructive' });
        e.target.value = '';
        return;
      }
      setUploadedPdf(file);
    },
    [toast],
  );

  const uploadSignedPdf = async (): Promise<string> => {
    if (!uploadedPdf) return '';
    const fileName = `partner-terms-uploaded/${partnerId}-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('documents').upload(fileName, uploadedPdf, {
      contentType: 'application/pdf',
    });
    if (error) return '';
    const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
    return data?.publicUrl || '';
  };

  const handleSubmit = async () => {
    if (!hasReadTerms || !uploadedPdf) {
      toast({ title: 'Campos obrigatórios', description: 'Aceite o termo e envie o PDF assinado.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let ipAddress: string | null = null;
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ipAddress = ipData.ip;
      } catch {
        /* ignore */
      }
      const uploadedPdfUrl = await uploadSignedPdf();
      if (!uploadedPdfUrl) throw new Error('Falha ao enviar o PDF.');

      let pdfUrl = '';
      try {
        pdfUrl = await generatePartnerTermsPDF(partnerId, partnerName, partnerEmail, termsVersion, ipAddress);
      } catch {
        /* optional */
      }

      await savePartnerTermsAcceptance(
        partnerId,
        partnerName,
        partnerEmail,
        termsVersion,
        pdfUrl,
        ipAddress,
        undefined,
        uploadedPdfUrl,
      );

      await supabase
        .from('institutional_partners')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', partnerId);

      toast({ title: 'Enviado', description: 'Novo termo enviado para análise.' });
      onComplete();
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  const termsHtml = termsContent.trim() ? policyService.markdownToHtml(termsContent) : '';

  return (
    <Card className="border-orange-200 bg-orange-50/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Shield className="w-5 h-5" />
          Reenvio do termo de parceria
        </CardTitle>
        <CardDescription>
          Foi solicitado ajuste no documento. Envie novamente o PDF assinado; sua assinatura permanece ativa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviewNotes && (
          <div className="rounded-md border border-orange-200 bg-white p-3 text-sm text-orange-950">
            <strong>Mensagem da equipe:</strong> {reviewNotes}
          </div>
        )}
        <div className="border rounded-lg p-3 bg-white max-h-48 overflow-y-auto text-sm">
          {termsPdfUrl ? (
            <a href={termsPdfUrl} className="text-primary font-medium underline" target="_blank" rel="noreferrer">
              Abrir / baixar PDF do termo
            </a>
          ) : termsHtml ? (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: termsHtml }} />
          ) : (
            <p className="text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Termo indisponível. Contate o suporte.
            </p>
          )}
        </div>
        <div className="flex items-start space-x-3 border rounded-lg p-3 bg-white">
          <Checkbox id="resubmit_read" checked={hasReadTerms} onCheckedChange={(c) => setHasReadTerms(!!c)} />
          <Label htmlFor="resubmit_read" className="cursor-pointer text-sm leading-snug">
            Li e aceito o termo na versão vigente <Badge variant="secondary">v{termsVersion}</Badge>
          </Label>
        </div>
        <div className="border-2 border-dashed border-orange-200 rounded-lg p-3 bg-white">
          <Label className="flex items-center gap-2 font-semibold text-sm mb-2">
            <Upload className="w-4 h-4" /> PDF assinado
          </Label>
          <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="block w-full text-sm" />
          {uploadedPdf && <p className="text-sm text-primary mt-2">{uploadedPdf.name}</p>}
        </div>
        <Button onClick={handleSubmit} disabled={saving || !hasReadTerms || !uploadedPdf} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          Enviar para nova análise
        </Button>
      </CardContent>
    </Card>
  );
}
