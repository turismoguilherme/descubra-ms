/**
 * Consent Term Component
 * Termo de consentimento para benchmarking (para TODOS - privado e público)
 * Exibido após o pagamento no onboarding
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateConsentPDF, saveConsentWithPDF } from '@/services/consentService';

interface ConsentTermProps {
  onComplete: () => void;
  onSkip?: () => void; // Removido - termo agora é obrigatório
}

// Todos os tipos de dados serão compartilhados automaticamente
const ALL_DATA_TYPES = ['revenue', 'occupancy', 'pricing', 'ratings', 'services', 'capacity'];

export default function ConsentTerm({ onComplete, onSkip }: ConsentTermProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  // Termo é obrigatório - consentGiven sempre será true
  const consentGiven = true;
  const [userName, setUserName] = useState('');
  const [userCNPJ, setUserCNPJ] = useState<string | undefined>(undefined);

  // Buscar dados do usuário para assinatura
  useEffect(() => {
    if (user) {
      // Buscar nome do perfil ou metadata
      const name = userProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      setUserName(name);

      // Buscar CNPJ se disponível
      const fetchCNPJ = async () => {
        try {
          // Tentar buscar do perfil ou de outra tabela
          const { data } = await supabase
            .from('user_profiles')
            .select('cnpj')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (data?.cnpj) {
            setUserCNPJ(data.cnpj);
          }
        } catch (error) {
          console.log('CNPJ não encontrado, continuando sem ele');
        }
      };
      fetchCNPJ();
    }
  }, [user, userProfile]);

  const handleSaveConsent = async () => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    // Termo é obrigatório - deve aceitar os termos
    if (!hasReadTerms) {
      toast({
        title: 'Leia os termos',
        description: 'Por favor, leia e aceite os termos de consentimento para continuar',
        variant: 'destructive',
      });
      return;
    }

    // Termo é obrigatório - sempre dar consentimento

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

      // Gerar PDF do termo assinado (sempre, pois termo é obrigatório)
      let pdfUrl = '';
      let signatureData = null;

      try {
        pdfUrl = await generateConsentPDF(
          user.id,
          userName || user.email || 'Usuário',
          user.email || '',
          userCNPJ,
          ipAddress
        );

        // Criar metadados da assinatura
        const termText = `Termo de Consentimento ViaJAR - ${new Date().toISOString()}`;
        const documentHash = btoa(termText).substring(0, 32);
        
        signatureData = {
          signed_name: userName || user.email || 'Usuário',
          signed_at: new Date().toISOString(),
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          document_hash: documentHash
        };
      } catch (pdfError) {
        console.error('Erro ao gerar PDF:', pdfError);
        // Continuar mesmo se o PDF falhar
      }

      // Salvar consentimento com TODOS os tipos de dados automaticamente
      const consentData = {
        user_id: user.id,
        consent_given: true, // Sempre true, pois é obrigatório
        consent_date: new Date().toISOString(),
        data_types_shared: ALL_DATA_TYPES, // Compartilhar TODOS automaticamente
        revoked_at: null,
        consent_version: '1.0',
        terms_url: window.location.origin + '/termos-consentimento-benchmarking',
        terms_pdf_url: pdfUrl || null,
        signature_data: signatureData,
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase
        .from('data_sharing_consents')
        .upsert(consentData, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast({
        title: 'Consentimento registrado!',
        description: 'Seus dados agregados serão usados para benchmarking. Você pode revogar a qualquer momento.',
      });

      onComplete();
    } catch (error: any) {
      console.error('Erro ao salvar consentimento:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar consentimento',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Termo de Consentimento para Benchmarking
          </CardTitle>
          <CardDescription>
            Compartilhe dados agregados e anonimizados para comparação com outras empresas do setor turístico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avisos Importantes */}
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Avisos Importantes:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>A ViaJAR é uma plataforma nova e em constante evolução. Podem ocorrer erros técnicos ou inconsistências nos processos de agregação e análise de dados.</li>
                <li>Ao aceitar este termo, você reconhece que a plataforma pode cometer erros e mesmo assim aceita compartilhar seus dados agregados e anonimizados.</li>
                <li>A plataforma se compromete a corrigir erros quando identificados e a manter a segurança dos dados compartilhados.</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">O que é compartilhado?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Apenas dados <strong>agregados</strong> e <strong>anonimizados</strong></li>
                <li>Nenhum dado individual ou identificável é compartilhado</li>
                <li>Dados são combinados com outras empresas para criar médias e comparações</li>
                <li>Você pode revogar o consentimento a qualquer momento</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Benefícios do Benchmarking</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Compare seu desempenho com o mercado</li>
                <li>Identifique oportunidades de melhoria</li>
                <li>Entenda tendências do setor</li>
                <li>Receba recomendações personalizadas</li>
              </ul>
            </div>
          </div>

          {/* Informação sobre dados compartilhados - Termo é obrigatório */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Compartilhamento de Dados (Obrigatório)
                </h4>
                <p className="text-sm text-blue-800 mb-2">
                  Para continuar, você deve autorizar o compartilhamento de <strong>TODOS</strong> os seguintes tipos de dados agregados e anonimizados:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1 ml-2">
                  <li>Receita (dados agregados, sem valores individuais)</li>
                  <li>Ocupação (taxa média, sem dados específicos)</li>
                  <li>Preços (faixas médias, sem valores exatos)</li>
                  <li>Avaliações (médias, sem comentários individuais)</li>
                  <li>Serviços (tipos de serviços oferecidos)</li>
                  <li>Capacidade (média, sem dados específicos)</li>
                </ul>
              </div>
            </div>
          </div>


          {/* Termo de consentimento - OBRIGATÓRIO */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="read_terms"
                checked={hasReadTerms}
                onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="read_terms" className="cursor-pointer">
                  Li e aceito o{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsDialog(true)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Termo de Consentimento para Benchmarking
                  </button>
                  {' '}(Obrigatório)
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Ao aceitar, você está assinando eletronicamente este termo. Um PDF será gerado e salvo para seus registros.
                </p>
              </div>
            </div>
          </div>

          {/* Assinatura eletrônica */}
          {hasReadTerms && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold mb-2">Assinatura Eletrônica</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Nome: <strong>{userName || user?.email || 'Usuário'}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Email: <strong>{user?.email}</strong>
              </p>
              {userCNPJ && (
                <p className="text-sm text-muted-foreground mb-2">
                  CNPJ: <strong>{userCNPJ}</strong>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Ao confirmar, você declara que leu, compreendeu e concorda com todos os termos acima.
                Esta assinatura eletrônica tem validade legal conforme a LGPD.
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSaveConsent}
              disabled={saving || !hasReadTerms}
              className="flex-1"
              size="lg"
            >
              {saving ? 'Salvando e Gerando PDF...' : 'Confirmar e Assinar Termo'}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Você pode revisar e alterar este consentimento a qualquer momento nas Configurações da sua conta.
          </p>
        </CardContent>
      </Card>

      {/* Dialog com termos */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termo de Consentimento para Benchmarking</DialogTitle>
            <DialogDescription>
              Leia atentamente os termos antes de dar seu consentimento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Objetivo</h3>
              <p className="text-muted-foreground">
                Este termo autoriza o compartilhamento de dados agregados e anonimizados da sua empresa/organização
                para fins de benchmarking e comparação com outras empresas/organizações do setor turístico.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">1.1. Aviso sobre Plataforma Nova</h3>
              <p className="text-muted-foreground">
                A ViaJAR é uma plataforma nova e em constante evolução. Podem ocorrer erros técnicos, 
                inconsistências ou melhorias nos processos de agregação e análise de dados. Ao aceitar 
                este termo, você reconhece e aceita que:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground mt-2">
                <li>A plataforma pode cometer erros no processamento de dados</li>
                <li>Os dados compartilhados são agregados e anonimizados</li>
                <li>Você aceita compartilhar seus dados mesmo com essas limitações</li>
                <li>A plataforma se compromete a corrigir erros quando identificados</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Dados Compartilhados</h3>
              <p className="text-muted-foreground">
                Apenas dados agregados e anonimizados serão compartilhados. Nenhum dado individual,
                identificável ou confidencial será divulgado. Os dados são combinados com informações
                de outras empresas para criar estatísticas e médias do mercado.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Finalidade do Compartilhamento</h3>
              <p className="text-muted-foreground">
                Os dados serão utilizados exclusivamente para:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground">
                <li>Comparação de desempenho com o mercado</li>
                <li>Geração de insights e recomendações</li>
                <li>Análise de tendências do setor</li>
                <li>Melhoria dos serviços da plataforma</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Segurança e Privacidade</h3>
              <p className="text-muted-foreground">
                Todos os dados são tratados de acordo com a LGPD (Lei Geral de Proteção de Dados).
                Implementamos medidas técnicas e organizacionais para garantir a segurança e
                privacidade dos dados compartilhados.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Direitos do Titular (LGPD)</h3>
              <p className="text-muted-foreground">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground">
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar informações sobre como seus dados são utilizados</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar exclusão dos dados compartilhados</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">6. Revogação do Consentimento</h3>
              <p className="text-muted-foreground">
                Você pode revogar seu consentimento a qualquer momento através desta interface.
                Após a revogação, seus dados não serão mais utilizados para novos benchmarks,
                mas dados já agregados podem permanecer em análises históricas.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setHasReadTerms(true);
              setShowTermsDialog(false);
            }}>
              Li e Aceito
            </Button>
            <Button variant="outline" onClick={() => setShowTermsDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


