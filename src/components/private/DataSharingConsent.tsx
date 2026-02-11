// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, CheckCircle2, AlertCircle, Info, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConsentData {
  consent_given: boolean;
  consent_date: string | null;
  data_types_shared: string[];
  revoked_at: string | null;
  consent_version: string;
}

const DATA_TYPES = [
  { id: 'revenue', label: 'Receita', description: 'Dados agregados de receita (sem valores individuais)' },
  { id: 'occupancy', label: 'Ocupação', description: 'Taxa de ocupação média (sem dados específicos)' },
  { id: 'pricing', label: 'Preços', description: 'Faixas de preço médias (sem valores exatos)' },
  { id: 'ratings', label: 'Avaliações', description: 'Médias de avaliações (sem comentários individuais)' },
  { id: 'services', label: 'Serviços', description: 'Tipos de serviços oferecidos' },
  { id: 'capacity', label: 'Capacidade', description: 'Capacidade média (sem dados específicos)' },
];

export default function DataSharingConsent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  useEffect(() => {
    fetchConsent();
  }, [user]);

  const fetchConsent = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('data_sharing_consents')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConsent(data);
        setSelectedDataTypes(data.data_types_shared || []);
      }
    } catch (error) {
      console.error('Erro ao buscar consentimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataTypeToggle = (dataTypeId: string, checked: boolean) => {
    if (checked) {
      setSelectedDataTypes([...selectedDataTypes, dataTypeId]);
    } else {
      setSelectedDataTypes(selectedDataTypes.filter(id => id !== dataTypeId));
    }
  };

  const handleSaveConsent = async (giveConsent: boolean) => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    if (giveConsent && selectedDataTypes.length === 0) {
      toast({
        title: 'Selecione tipos de dados',
        description: 'Selecione pelo menos um tipo de dado para compartilhar',
        variant: 'destructive',
      });
      return;
    }

    if (giveConsent && !hasReadTerms) {
      toast({
        title: 'Leia os termos',
        description: 'Por favor, leia e aceite os termos de consentimento',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const consentData = {
        user_id: user.id,
        consent_given: giveConsent,
        consent_date: giveConsent ? new Date().toISOString() : null,
        data_types_shared: giveConsent ? selectedDataTypes : [],
        revoked_at: !giveConsent ? new Date().toISOString() : null,
        consent_version: '1.0',
        terms_url: window.location.origin + '/termos-consentimento-benchmarking',
        ip_address: null, // Pode ser obtido via API se necessário
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase
        .from('data_sharing_consents')
        .upsert(consentData, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setConsent(consentData as ConsentData);

      toast({
        title: giveConsent ? 'Consentimento registrado!' : 'Consentimento revogado',
        description: giveConsent
          ? 'Seus dados agregados serão usados para benchmarking. Você pode revogar a qualquer momento.'
          : 'Seu consentimento foi revogado. Seus dados não serão mais compartilhados.',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar consentimento:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar consentimento',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const isConsentActive = consent?.consent_given && !consent?.revoked_at;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consentimento para Benchmarking
          </CardTitle>
          <CardDescription>
            Compartilhe dados agregados e anonimizados para comparação com outras empresas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status atual */}
          {isConsentActive ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Consentimento ativo</strong> desde {consent?.consent_date ? new Date(consent.consent_date).toLocaleDateString('pt-BR') : ''}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você ainda não deu consentimento para compartilhamento de dados para benchmarking.
              </AlertDescription>
            </Alert>
          )}

          {/* Informações sobre o consentimento */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                O que é compartilhado?
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                <li>Apenas dados <strong>agregados</strong> e <strong>anonimizados</strong></li>
                <li>Nenhum dado individual ou identificável é compartilhado</li>
                <li>Dados são combinados com outras empresas para criar médias e comparações</li>
                <li>Você pode revogar o consentimento a qualquer momento</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Benefícios do Benchmarking</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                <li>Compare seu desempenho com o mercado</li>
                <li>Identifique oportunidades de melhoria</li>
                <li>Entenda tendências do setor</li>
                <li>Receba recomendações personalizadas</li>
              </ul>
            </div>
          </div>

          {/* Tipos de dados */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Selecione os tipos de dados para compartilhar:
            </Label>
            <div className="space-y-3">
              {DATA_TYPES.map((dataType) => (
                <div
                  key={dataType.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={`data_type_${dataType.id}`}
                    checked={selectedDataTypes.includes(dataType.id)}
                    onCheckedChange={(checked) => handleDataTypeToggle(dataType.id, checked as boolean)}
                    disabled={!isConsentActive && !hasReadTerms}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`data_type_${dataType.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {dataType.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{dataType.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Termo de consentimento */}
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
                </Label>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-4">
            {isConsentActive ? (
              <Button
                variant="destructive"
                onClick={() => handleSaveConsent(false)}
                disabled={saving}
              >
                Revogar Consentimento
              </Button>
            ) : (
              <Button
                onClick={() => handleSaveConsent(true)}
                disabled={saving || !hasReadTerms || selectedDataTypes.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Dar Consentimento
              </Button>
            )}
            {isConsentActive && (
              <Button
                variant="outline"
                onClick={() => handleSaveConsent(true)}
                disabled={saving || !hasReadTerms || selectedDataTypes.length === 0}
              >
                Atualizar Tipos de Dados
              </Button>
            )}
          </div>
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
                Este termo autoriza o compartilhamento de dados agregados e anonimizados da sua empresa
                para fins de benchmarking e comparação com outras empresas do setor turístico.
              </p>
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
              <h3 className="font-semibold mb-2">3. Finalidade</h3>
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
              <h3 className="font-semibold mb-2">5. Direitos do Titular</h3>
              <p className="text-muted-foreground">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground">
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar informações sobre como seus dados são utilizados</li>
                <li>Escolher quais tipos de dados compartilhar</li>
                <li>Solicitar exclusão dos dados compartilhados</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">6. Revogação</h3>
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

