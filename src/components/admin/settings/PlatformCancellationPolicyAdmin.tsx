import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Save, RefreshCw, Info, PlusCircle } from 'lucide-react';

type PlatformPolicyRow = {
  id: string;
  name: string;
  description: string | null;
  days_before_7_refund_percent: number;
  days_before_1_2_refund_percent: number;
  days_before_0_refund_percent: number;
  is_active: boolean;
  updated_at: string;
};

function clampPercent(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

export interface PlatformCancellationPolicyAdminProps {
  /** Quando true, omite o cabeçalho de página (uso dentro de abas / módulo). */
  embedded?: boolean;
}

export default function PlatformCancellationPolicyAdmin({
  embedded = false,
}: PlatformCancellationPolicyAdminProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [policyId, setPolicyId] = useState<string | null>(null);
  const [name, setName] = useState('Política Padrão de Cancelamento');
  const [description, setDescription] = useState('');
  const [days7, setDays7] = useState('100');
  const [days12, setDays12] = useState('50');
  const [days0, setDays0] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const loadPolicy = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_cancellation_policies')
        .select(
          'id, name, description, days_before_7_refund_percent, days_before_1_2_refund_percent, days_before_0_refund_percent, is_active, updated_at'
        )
        .is('partner_id', null)
        .eq('is_default', true)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      const row = (data?.[0] ?? null) as PlatformPolicyRow | null;

      if (row) {
        setPolicyId(row.id);
        setName(row.name);
        setDescription(row.description ?? '');
        setDays7(String(row.days_before_7_refund_percent));
        setDays12(String(row.days_before_1_2_refund_percent));
        setDays0(String(row.days_before_0_refund_percent));
        setIsActive(row.is_active);
      } else {
        setPolicyId(null);
        setName('Política Padrão de Cancelamento');
        setDescription('');
        setDays7('100');
        setDays12('50');
        setDays0('0');
        setIsActive(true);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Não foi possível carregar a política.';
      console.error(e);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  const parseField = (raw: string, label: string): number | null => {
    const n = parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(n)) {
      toast({
        title: 'Valor inválido',
        description: `${label} precisa ser um número.`,
        variant: 'destructive',
      });
      return null;
    }
    return clampPercent(n);
  };

  const handleSave = async () => {
    const p7 = parseField(days7, '7+ dias');
    const p12 = parseField(days12, '1–2 dias');
    const p0 = parseField(days0, 'No dia ou após');
    if (p7 === null || p12 === null || p0 === null) return;

    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe um nome para a política.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (policyId) {
        const { error } = await supabase
          .from('partner_cancellation_policies')
          .update({
            name: name.trim(),
            description: description.trim() || null,
            days_before_7_refund_percent: p7,
            days_before_1_2_refund_percent: p12,
            days_before_0_refund_percent: p0,
            is_active: isActive,
          })
          .eq('id', policyId);

        if (error) throw error;
        toast({ title: 'Salvo', description: 'Política de cancelamento da plataforma atualizada.' });
      } else {
        const { error } = await supabase.from('partner_cancellation_policies').insert({
          partner_id: null,
          name: name.trim(),
          description: description.trim() || null,
          days_before_7_refund_percent: p7,
          days_before_1_2_refund_percent: p12,
          days_before_0_refund_percent: p0,
          is_default: true,
          is_active: isActive,
          created_by: user?.id ?? null,
        });

        if (error) throw error;
        toast({ title: 'Criada', description: 'Política padrão registrada no banco.' });
      }
      await loadPolicy();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao salvar.';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDefaults = async () => {
    setCreating(true);
    try {
      const { error } = await supabase.from('partner_cancellation_policies').insert({
        partner_id: null,
        name: 'Política Padrão de Cancelamento',
        description:
          'Política padrão da plataforma para reservas de parceiros (cancelamento pelo cliente).',
        days_before_7_refund_percent: 100,
        days_before_1_2_refund_percent: 50,
        days_before_0_refund_percent: 0,
        is_default: true,
        is_active: true,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      toast({ title: 'Pronto', description: 'Política padrão criada com valores iniciais.' });
      await loadPolicy();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Não foi possível criar.';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div
        className={
          embedded
            ? 'text-center py-8 text-sm text-muted-foreground'
            : 'text-center py-12 text-muted-foreground'
        }
      >
        Carregando política de cancelamento…
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? 'space-y-4'
          : 'space-y-6 max-w-3xl mx-auto px-4 pb-10'
      }
    >
      {!embedded && (
        <AdminPageHeader
          title="Cancelamento — reservas parceiros"
          description="Percentuais de reembolso aplicados quando o cliente cancela uma reserva. Uma única política vale para todos os parceiros (sem política própria por parceiro)."
          helpText="O sistema usa: 7 ou mais dias antes da data → primeira faixa; 1 ou 2 dias antes → segunda faixa; demais casos (incluindo no dia) → terceira faixa. O valor do reembolso é o total da reserva × percentual ÷ 100."
        />
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Como o cancelamento usa estes números</AlertTitle>
        <AlertDescription className="text-sm mt-1">
          A Edge Function de cancelamento e a área do turista leem esta linha (<code className="text-xs">partner_id</code>{' '}
          nulo, <code className="text-xs">is_default</code>) para calcular o reembolso. Desativar a política pode
          impedir cancelamentos até você reativar ou corrigir o cadastro.
        </AlertDescription>
      </Alert>

      {!policyId && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertTitle className="text-amber-900">Nenhuma política padrão encontrada</AlertTitle>
          <AlertDescription className="text-amber-900/90 text-sm mt-1">
            Crie com um clique (valores 100% / 50% / 0%) ou preencha o formulário abaixo e salve.
          </AlertDescription>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleCreateDefaults}
            disabled={creating}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {creating ? 'Criando…' : 'Criar política padrão (100 / 50 / 0%)'}
          </Button>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Política padrão da plataforma</CardTitle>
          <CardDescription>
            Nome e texto auxiliar (ex.: nota sobre taxas Stripe) aparecem para referência interna; os percentuais
            são o que entram no cálculo automático.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="policy-name">Nome</Label>
            <Input
              id="policy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Política Padrão de Cancelamento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy-desc">Descrição (opcional)</Label>
            <Textarea
              id="policy-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Ex.: informações sobre desconto de taxas no reembolso…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p7">7+ dias antes (%)</Label>
              <Input
                id="p7"
                type="text"
                inputMode="decimal"
                value={days7}
                onChange={(e) => setDays7(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p12">1–2 dias antes (%)</Label>
              <Input
                id="p12"
                type="text"
                inputMode="decimal"
                value={days12}
                onChange={(e) => setDays12(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p0">No dia ou após / outros (%)</Label>
              <Input
                id="p0"
                type="text"
                inputMode="decimal"
                value={days0}
                onChange={(e) => setDays0(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Política ativa</p>
              <p className="text-sm text-muted-foreground">Se desligada, o cancelamento pode falhar ao buscar regras.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando…' : policyId ? 'Salvar alterações' : 'Criar e salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={loadPolicy} disabled={saving || loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
