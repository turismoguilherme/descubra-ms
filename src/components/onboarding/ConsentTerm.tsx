// @ts-nocheck
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, CheckCircle2, AlertCircle, FileText, Info, Circle } from 'lucide-react';
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
        const termText = `Termo de Consentimento ViajARTur - ${new Date().toISOString()}`;
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
          {/* Resumo Visual - O que você está aceitando? */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  O que você está aceitando?
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Este termo é <strong className="text-red-600">OBRIGATÓRIO</strong> para continuar. Ao aceitar, você autoriza:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Compartilhamento automático</strong> de TODOS os seus dados agregados e anonimizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Uso dos dados para <strong>benchmarking</strong> e comparação com outras empresas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Geração de PDF assinado</strong> que ficará disponível nas suas configurações</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-900">
                    <strong>⚠️ Aviso:</strong> A ViajARTur é uma plataforma nova. Podem ocorrer erros técnicos. Ao aceitar, você reconhece isso e mesmo assim autoriza o compartilhamento.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Avisos Importantes */}
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Avisos Importantes:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>A ViajARTur é uma plataforma nova e em constante evolução. Podem ocorrer erros técnicos ou inconsistências nos processos de agregação e análise de dados.</li>
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


          {/* Termo de consentimento - OBRIGATÓRIO - MELHORADO */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="read_terms"
                checked={hasReadTerms}
                onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
                className="h-6 w-6 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="read_terms" className="cursor-pointer text-base font-semibold text-gray-900">
                    Li e aceito o{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsDialog(true)}
                      className="text-blue-600 hover:text-blue-700 hover:underline font-bold"
                    >
                      Termo de Consentimento para Benchmarking
                    </button>
                  </Label>
                  <Badge variant="destructive" className="ml-2">OBRIGATÓRIO</Badge>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  Ao aceitar, você está <strong>assinando eletronicamente</strong> este termo. Um PDF será gerado automaticamente e ficará disponível nas suas configurações para download.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  <Info className="h-3 w-3" />
                  <span>Você pode revisar o termo completo clicando no link acima</span>
                </div>
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

          {/* Ações - MELHORADO */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
              <div className={`flex items-center gap-2 ${hasReadTerms ? 'text-green-600' : 'text-gray-400'}`}>
                {hasReadTerms ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span>Passo 1: Ler e aceitar os termos</span>
              </div>
              <span className="text-gray-300">→</span>
              <div className={`flex items-center gap-2 ${hasReadTerms ? 'text-blue-600' : 'text-gray-400'}`}>
                <span>Passo 2: Confirmar e assinar</span>
              </div>
            </div>
            <Button
              onClick={handleSaveConsent}
              disabled={saving || !hasReadTerms}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg"
              size="lg"
            >
              {saving ? (
                <>
                  <FileText className="h-5 w-5 mr-2 animate-pulse" />
                  Salvando e Gerando PDF...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Confirmar e Assinar Termo
                </>
              )}
            </Button>
            {!hasReadTerms && (
              <p className="text-center text-sm text-red-600 font-medium">
                ⚠️ Você deve ler e aceitar os termos para continuar
              </p>
            )}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Você pode revisar e alterar este consentimento a qualquer momento nas Configurações da sua conta.
          </p>
        </CardContent>
      </Card>

      {/* Dialog com termos - Overlay transparente para mostrar dashboard no fundo */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent 
          className="max-w-3xl max-h-[85vh] bg-white p-0"
          overlayClassName="bg-black/30"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Termo de Consentimento para Benchmarking</DialogTitle>
            <DialogDescription>
              Leia atentamente os termos antes de dar seu consentimento
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-4 space-y-4 text-sm max-h-[calc(85vh-180px)]">
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
                A ViajARTur é uma plataforma nova e em constante evolução. Podem ocorrer erros técnicos, 
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
          <div className="flex flex-row gap-3 justify-end items-center px-6 py-4 border-t bg-gray-50">
            <Button 
              variant="outline" 
              onClick={() => setShowTermsDialog(false)}
              type="button"
              className="min-w-[100px]"
            >
              Fechar
            </Button>
            <Button 
              onClick={() => {
                setHasReadTerms(true);
                setShowTermsDialog(false);
              }}
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              Li e Aceito
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


