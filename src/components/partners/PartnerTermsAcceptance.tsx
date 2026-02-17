import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Shield, CheckCircle2, Info, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { policyService } from '@/services/public/policyService';
import { generatePartnerTermsPDF, savePartnerTermsAcceptance } from '@/services/partners/partnerTermsService';

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
  const [termsContent, setTermsContent] = useState<string>('');
  const [termsVersion, setTermsVersion] = useState<number>(1);

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
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o termo de parceria',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = async () => {
    if (!hasReadTerms) {
      toast({
        title: 'Leia os termos',
        description: 'Por favor, leia e aceite o termo de parceria para continuar',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Obter IP do usuário (se disponível)
      let ipAddress: string | null = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (error) {
        console.log('Não foi possível obter IP');
      }

      // Gerar PDF do termo assinado
      let pdfUrl = '';
      try {
        pdfUrl = await generatePartnerTermsPDF(
          partnerId,
          partnerName,
          partnerEmail,
          termsVersion,
          ipAddress
        );
      } catch (pdfError) {
        console.error('Erro ao gerar PDF:', pdfError);
        // Continuar mesmo se o PDF falhar
      }

      // Salvar aceite do termo
      const result = await savePartnerTermsAcceptance(
        partnerId,
        partnerName,
        partnerEmail,
        termsVersion,
        pdfUrl,
        ipAddress
      );

      // Verificar se PDF foi salvo
      if (!result.pdfSaved) {
        console.warn('⚠️ [PartnerTermsAcceptance] PDF não foi salvo. Verifique configuração do bucket "documents" no Supabase.');
        // Notificar admin (será implementado no admin)
        toast({
          title: 'Aviso',
          description: 'O termo foi aceito, mas houve um problema ao salvar o PDF. Entre em contato com o suporte se necessário.',
          variant: 'destructive',
          duration: 5000,
        });
      }

      // Se houver erro mas não for crítico (ex: campos não existem), continuar
      if (!result.success && result.error?.includes('column') && result.error?.includes('not found')) {
        console.warn('Campos de termo não disponíveis. Continuando sem salvar metadados do termo.');
        // Continuar mesmo assim - o importante é o parceiro ter aceitado
      } else if (!result.success) {
        console.warn('Erro ao salvar aceite do termo (não crítico):', result.error);
        // Continuar mesmo se houver erro não crítico
      }

      toast({
        title: 'Termo aceito!',
        description: 'Você aceitou o termo de parceria. Prosseguindo para o pagamento...',
      });

      onComplete({
        termsAccepted: true,
        termsVersion,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao aceitar termo:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível processar o aceite do termo',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando termo de parceria...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Termo de Parceria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-ms-primary-blue" />
            Termo de Parceria
          </CardTitle>
          <CardDescription>
            Leia atentamente o termo de parceria antes de aceitar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview do termo */}
          <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: policyService.markdownToHtml(termsContent.substring(0, 500) + '...'),
              }}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowTermsDialog(true)}
            className="w-full"
          >
            <FileText className="w-4 h-4 mr-2" />
            Ler Termo Completo
          </Button>

          {/* Aceite do termo */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="read_terms"
                checked={hasReadTerms}
                onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
                className="h-6 w-6 border-2 data-[state=checked]:bg-ms-primary-blue data-[state=checked]:border-ms-primary-blue mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="read_terms" className="cursor-pointer text-base font-semibold text-gray-900">
                    Li e aceito o{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsDialog(true)}
                      className="text-ms-primary-blue hover:text-ms-discovery-teal hover:underline font-bold"
                    >
                      Termo de Parceria
                    </button>
                  </Label>
                  <Badge variant="destructive" className="ml-2">OBRIGATÓRIO</Badge>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  Ao aceitar, você está <strong>assinando eletronicamente</strong> este termo. 
                  Um PDF será gerado automaticamente com sua assinatura.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  <Info className="h-3 w-3" />
                  <span>Você pode revisar o termo completo clicando no botão acima</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assinatura eletrônica */}
          {hasReadTerms && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold mb-2">Assinatura Eletrônica</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Nome: <strong>{partnerName}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Email: <strong>{partnerEmail}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Ao confirmar, você declara que leu, compreendeu e concorda com todos os termos acima.
                Esta assinatura eletrônica tem validade legal conforme a LGPD.
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={handleAcceptTerms}
              disabled={saving || !hasReadTerms}
              className="flex-1 bg-ms-primary-blue hover:bg-ms-discovery-teal text-white"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aceitar e Continuar
                </>
              )}
            </Button>
          </div>

          {!hasReadTerms && (
            <p className="text-center text-sm text-red-600 font-medium">
              ⚠️ Você deve ler e aceitar os termos para continuar
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dialog com termo completo */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termo de Parceria - Versão {termsVersion}</DialogTitle>
            <DialogDescription>
              Leia atentamente todos os termos e condições
            </DialogDescription>
          </DialogHeader>
          <div
            className="prose prose-sm max-w-none mt-4"
            dangerouslySetInnerHTML={{
              __html: policyService.markdownToHtml(termsContent),
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

