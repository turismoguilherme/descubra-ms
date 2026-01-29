import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, HelpCircle, CheckCircle2, AlertCircle, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CancellationPolicy {
  id: string;
  partner_id: string | null;
  name: string;
  description?: string;
  days_before_7_refund_percent: number;
  days_before_1_2_refund_percent: number;
  days_before_0_refund_percent: number;
  is_default: boolean;
  is_active: boolean;
}

interface PartnerCancellationPolicyEditorProps {
  partnerId: string;
  onUpdate?: () => void;
}

export default function PartnerCancellationPolicyEditor({
  partnerId,
  onUpdate,
}: PartnerCancellationPolicyEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultPolicy, setDefaultPolicy] = useState<CancellationPolicy | null>(null);
  const [customPolicy, setCustomPolicy] = useState<CancellationPolicy | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    days_before_7_refund_percent: 100,
    days_before_1_2_refund_percent: 50,
    days_before_0_refund_percent: 0,
    name: 'Política Personalizada',
    description: '',
  });

  useEffect(() => {
    loadPolicies();
  }, [partnerId]);

  const loadPolicies = async () => {
    try {
      setLoading(true);

      // Buscar política padrão
      const { data: defaultData } = await supabase
        .from('partner_cancellation_policies')
        .select('*')
        .is('partner_id', null)
        .eq('is_default', true)
        .eq('is_active', true)
        .maybeSingle();

      if (defaultData) {
        setDefaultPolicy(defaultData);
      }

      // Buscar política personalizada do parceiro
      const { data: customData } = await supabase
        .from('partner_cancellation_policies')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('is_active', true)
        .maybeSingle();

      if (customData) {
        setCustomPolicy(customData);
        setFormData({
          days_before_7_refund_percent: customData.days_before_7_refund_percent,
          days_before_1_2_refund_percent: customData.days_before_1_2_refund_percent,
          days_before_0_refund_percent: customData.days_before_0_refund_percent,
          name: customData.name,
          description: customData.description || '',
        });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar políticas:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as políticas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (customPolicy) {
        // Atualizar política existente
        const { error } = await supabase
          .from('partner_cancellation_policies')
          .update({
            name: formData.name,
            description: formData.description || null,
            days_before_7_refund_percent: formData.days_before_7_refund_percent,
            days_before_1_2_refund_percent: formData.days_before_1_2_refund_percent,
            days_before_0_refund_percent: formData.days_before_0_refund_percent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customPolicy.id);

        if (error) throw error;
      } else {
        // Criar nova política personalizada
        const { error } = await supabase
          .from('partner_cancellation_policies')
          .insert({
            partner_id: partnerId,
            name: formData.name,
            description: formData.description || null,
            days_before_7_refund_percent: formData.days_before_7_refund_percent,
            days_before_1_2_refund_percent: formData.days_before_1_2_refund_percent,
            days_before_0_refund_percent: formData.days_before_0_refund_percent,
            is_default: false,
            is_active: true,
          });

        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Política de cancelamento salva com sucesso',
      });

      setShowEditDialog(false);
      await loadPolicies();
      onUpdate?.();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar política:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível salvar a política',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUseDefault = async () => {
    if (!confirm('Tem certeza que deseja voltar a usar a política padrão? Sua política personalizada será desativada.')) {
      return;
    }

    try {
      if (customPolicy) {
        const { error } = await supabase
          .from('partner_cancellation_policies')
          .update({ is_active: false })
          .eq('id', customPolicy.id);

        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Agora você está usando a política padrão',
      });

      await loadPolicies();
      onUpdate?.();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao desativar política:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar a política personalizada',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Carregando políticas...</p>
      </div>
    );
  }

  const activePolicy = customPolicy || defaultPolicy;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-semibold text-gray-900">Política de Cancelamento</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>A política de cancelamento é única para todos os seus produtos. Você pode personalizar ou usar a política padrão da plataforma.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-gray-600">
          Configure as regras de reembolso para cancelamentos de reservas
        </p>
      </div>

      {/* Política Atual */}
      {activePolicy && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {customPolicy ? (
                    <>
                      <Badge variant="default" className="bg-ms-primary-blue">Política Personalizada</Badge>
                      {activePolicy.name}
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary">Política Padrão</Badge>
                      {activePolicy.name}
                    </>
                  )}
                </CardTitle>
                {activePolicy.description && (
                  <CardDescription className="mt-2">{activePolicy.description}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">7+ dias antes</h4>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {activePolicy.days_before_7_refund_percent}%
                </p>
                <p className="text-xs text-green-600 mt-1">de reembolso</p>
              </div>

              <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">1-2 dias antes</h4>
                </div>
                <p className="text-2xl font-bold text-yellow-700">
                  {activePolicy.days_before_1_2_refund_percent}%
                </p>
                <p className="text-xs text-yellow-600 mt-1">de reembolso</p>
              </div>

              <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-900">No dia ou após</h4>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {activePolicy.days_before_0_refund_percent}%
                </p>
                <p className="text-xs text-red-600 mt-1">de reembolso</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              {customPolicy ? (
                <>
                  <Button onClick={() => setShowEditDialog(true)} className="flex-1">
                    Editar Política
                  </Button>
                  <Button variant="outline" onClick={handleUseDefault}>
                    Usar Política Padrão
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowEditDialog(true)} className="flex-1">
                  Criar Política Personalizada
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Política Padrão (somente leitura) */}
      {defaultPolicy && (
        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="text-sm">Política Padrão da Plataforma</CardTitle>
            <CardDescription>
              Esta é a política padrão. Você pode criar uma política personalizada para substituí-la.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p>• 7+ dias antes: {defaultPolicy.days_before_7_refund_percent}% de reembolso</p>
              <p>• 1-2 dias antes: {defaultPolicy.days_before_1_2_refund_percent}% de reembolso</p>
              <p>• No dia ou após: {defaultPolicy.days_before_0_refund_percent}% de reembolso</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {customPolicy ? 'Editar Política Personalizada' : 'Criar Política Personalizada'}
            </DialogTitle>
            <DialogDescription>
              Defina as regras de reembolso para cancelamentos de reservas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="policy_name">Nome da Política</Label>
              <Input
                id="policy_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Política Flexível"
              />
            </div>

            <div>
              <Label htmlFor="policy_description">Descrição (opcional)</Label>
              <Textarea
                id="policy_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva sua política de cancelamento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="refund_7_days">Reembolso 7+ dias antes (%)</Label>
                <Input
                  id="refund_7_days"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.days_before_7_refund_percent}
                  onChange={(e) => setFormData({
                    ...formData,
                    days_before_7_refund_percent: parseFloat(e.target.value) || 0,
                  })}
                />
                <p className="text-xs text-gray-500 mt-1">Cancelamentos com 7 ou mais dias de antecedência</p>
              </div>

              <div>
                <Label htmlFor="refund_1_2_days">Reembolso 1-2 dias antes (%)</Label>
                <Input
                  id="refund_1_2_days"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.days_before_1_2_refund_percent}
                  onChange={(e) => setFormData({
                    ...formData,
                    days_before_1_2_refund_percent: parseFloat(e.target.value) || 0,
                  })}
                />
                <p className="text-xs text-gray-500 mt-1">Cancelamentos com 1-2 dias de antecedência</p>
              </div>

              <div>
                <Label htmlFor="refund_0_days">Reembolso no dia ou após (%)</Label>
                <Input
                  id="refund_0_days"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.days_before_0_refund_percent}
                  onChange={(e) => setFormData({
                    ...formData,
                    days_before_0_refund_percent: parseFloat(e.target.value) || 0,
                  })}
                />
                <p className="text-xs text-gray-500 mt-1">Cancelamentos no dia da reserva ou após</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Política'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

