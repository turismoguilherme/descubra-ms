import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, HelpCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PassportRewardsManager: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [avatars, setAvatars] = useState<any[]>([]);
  const [emittedByRewardId, setEmittedByRewardId] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    route_id: '',
    partner_name: '',
    reward_type: 'desconto' as 'desconto' | 'brinde' | 'experiencia' | 'avatar' | 'outros',
    reward_description: '',
    reward_code_prefix: '',
    discount_percentage: 0,
    partner_address: '',
    partner_phone: '',
    partner_email: '',
    avatar_id: '', // Novo campo para avatar
    max_avatars_per_route: 3, // Novo campo para limite de avatares por rota
    max_vouchers: null as number | null,
    max_per_user: 1,
    is_fallback: false,
    expires_at: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔵 [PassportRewardsManager] Componente montado, carregando dados...');
    loadData();
  }, []);

  useEffect(() => {
    console.log('🔵 [PassportRewardsManager] showForm mudou para:', showForm);
  }, [showForm]);

  // Validação em tempo real
  useEffect(() => {
    if (showForm) {
      validateForm();
    }
  }, [formData, showForm]);

  // Log de renderização apenas quando estados importantes mudam
  useEffect(() => {
    console.log('🔵 [PassportRewardsManager] Estado atual:', {
      loading,
      routesCount: routes.length,
      rewardsCount: rewards.length,
      showForm,
      emittedByRewardIdCount: Object.keys(emittedByRewardId).length,
    });
  }, [loading, routes.length, rewards.length, showForm, emittedByRewardId]);

  const loadData = async () => {
    console.log('🔵 [PassportRewardsManager] ========== loadData INICIADO ==========');
    try {
      setLoading(true);
      console.log('🔵 [PassportRewardsManager] Buscando rotas, recompensas e avatares...');
      const [routesRes, rewardsRes, avatarsRes] = await Promise.all([
        supabase.from('routes').select('*').eq('is_active', true),
        passportAdminService.getRewards(),
        supabase.from('pantanal_avatars').select('*').eq('is_active', true).order('name'),
      ]);

      if (routesRes.error) {
        console.error('❌ [PassportRewardsManager] Erro ao buscar rotas:', routesRes.error);
        throw routesRes.error;
      }
      
      console.log('✅ [PassportRewardsManager] Rotas carregadas:', routesRes.data?.length || 0);
      console.log('✅ [PassportRewardsManager] Recompensas carregadas:', rewardsRes?.length || 0);
      console.log('✅ [PassportRewardsManager] Avatares carregados:', avatarsRes.data?.length || 0);

      setRoutes(routesRes.data || []);
      setRewards(rewardsRes);
      setAvatars(avatarsRes.data || []);

      // Carregar quantidade de vouchers emitidos por recompensa (para exibir estoque)
      const rewardIds = (rewardsRes || []).map((r: any) => r.id).filter(Boolean);
      console.log('🔵 [PassportRewardsManager] Reward IDs encontrados:', rewardIds.length);
      
      if (rewardIds.length > 0) {
        console.log('🔵 [PassportRewardsManager] Buscando vouchers emitidos...');
        const { data: userRewardsData, error: userRewardsError } = await supabase
          .from('user_rewards')
          .select('reward_id')
          .in('reward_id', rewardIds);

        if (userRewardsError) {
          console.error('❌ [PassportRewardsManager] Erro ao buscar vouchers:', userRewardsError);
          throw userRewardsError;
        }

        const counts = (userRewardsData || []).reduce((acc: Record<string, number>, row: any) => {
          const rid = row.reward_id;
          acc[rid] = (acc[rid] || 0) + 1;
          return acc;
        }, {});

        console.log('✅ [PassportRewardsManager] Contagem de vouchers emitidos:', counts);
        setEmittedByRewardId(counts);
      } else {
        console.log('🔵 [PassportRewardsManager] Nenhuma recompensa encontrada, zerando contagem');
        setEmittedByRewardId({});
      }
    } catch (error: any) {
      console.error('❌ [PassportRewardsManager] Erro completo ao carregar dados:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('🔵 [PassportRewardsManager] loadData finalizado');
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.route_id) {
      errors.route_id = 'Selecione uma rota';
    }

    if (!formData.partner_name.trim()) {
      errors.partner_name = 'Nome do parceiro é obrigatório';
    }

    if (!formData.reward_description.trim()) {
      errors.reward_description = 'Descrição da recompensa é obrigatória';
    }

    // Validações específicas para avatar
    if (formData.reward_type === 'avatar') {
      if (!formData.avatar_id) {
        errors.avatar_id = 'Selecione um avatar do Pantanal';
      }
      if (!formData.max_avatars_per_route || formData.max_avatars_per_route < 1) {
        errors.max_avatars_per_route = 'Defina um limite válido (mínimo 1)';
      }
    }

    // Validações específicas para desconto
    if (formData.reward_type === 'desconto') {
      if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
        errors.discount_percentage = 'Percentual deve ser entre 0 e 100';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    console.log('🔵 [PassportRewardsManager] ========== handleSave INICIADO ==========');
    console.log('🔵 [PassportRewardsManager] Form data:', JSON.stringify(formData, null, 2));

    // Executar validações
    if (!validateForm()) {
      console.log('❌ [PassportRewardsManager] Validações falharam');
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios antes de salvar',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('✅ [PassportRewardsManager] Validações passadas, criando recompensa...');

    setSaving(true);
    setFormErrors({}); // Limpar erros anteriores

    try {
      // Filtrar apenas campos que existem na tabela passport_rewards
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassportRewardsManager.tsx:197',message:'Building rewardData',data:{formData:JSON.stringify(formData)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const rewardData = {
        route_id: formData.route_id,
        partner_name: formData.partner_name,
        reward_type: formData.reward_type,
        reward_description: formData.reward_description,
        reward_code_prefix: formData.reward_code_prefix || null,
        discount_percentage: formData.discount_percentage,
        partner_address: formData.partner_address || null,
        partner_phone: formData.partner_phone || null,
        partner_email: formData.partner_email || null,
        max_vouchers: formData.max_vouchers || null,
        max_per_user: formData.max_per_user || null,
        is_fallback: formData.is_fallback || false,
        expires_at: formData.expires_at || null,
        is_active: true,
        // Adicionar campos de avatar apenas se suportados
        ...(formData.reward_type === 'avatar' && {
          avatar_id: formData.avatar_id,
          max_avatars_per_route: formData.max_avatars_per_route,
        }),
      };
      console.log('🔵 [PassportRewardsManager] Dados para criação:', JSON.stringify(rewardData, null, 2));
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassportRewardsManager.tsx:219',message:'rewardData built',data:{rewardData:JSON.stringify(rewardData),hasEmptyStrings:Object.values(rewardData).some(v=>v==='')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      await passportAdminService.createReward(rewardData);

      console.log('✅ [PassportRewardsManager] Recompensa criada com sucesso');
      toast({
        title: 'Recompensa criada com sucesso! ✅',
        description: 'A recompensa foi adicionada ao sistema.',
      });
      setShowForm(false);
      setFormData({
        route_id: '',
        partner_name: '',
        reward_type: 'desconto',
        reward_description: '',
        reward_code_prefix: '',
        discount_percentage: 0,
        partner_address: '',
        partner_phone: '',
        partner_email: '',
        avatar_id: '',
        max_avatars_per_route: 3,
        max_vouchers: null,
        max_per_user: 1,
        is_fallback: false,
        expires_at: '',
      });
      setFormErrors({}); // Limpar erros
      console.log('🔵 [PassportRewardsManager] Formulário resetado, recarregando dados...');
      await loadData();
    } catch (error: any) {
      console.error('❌ [PassportRewardsManager] Erro completo ao salvar recompensa:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      toast({
        title: 'Erro ao criar recompensa',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rewardId: string) => {
    console.log('🔵 [PassportRewardsManager] ========== handleDelete ==========');
    console.log('🔵 [PassportRewardsManager] Reward ID:', rewardId);
    
    if (!confirm('Tem certeza que deseja excluir esta recompensa?')) {
      console.log('🔵 [PassportRewardsManager] Exclusão cancelada pelo usuário');
      return;
    }

    try {
      console.log('🔵 [PassportRewardsManager] Deletando recompensa...');
      await passportAdminService.deleteReward(rewardId);
      console.log('✅ [PassportRewardsManager] Recompensa deletada com sucesso');
      toast({
        title: 'Recompensa excluída',
      });
      loadData();
    } catch (error: any) {
      console.error('❌ [PassportRewardsManager] Erro completo ao excluir recompensa:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    console.log('🔵 [PassportRewardsManager] Renderizando estado de loading');
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recompensas</CardTitle>
            <Button 
              type="button"
              onClick={() => {
                console.log('🔵 [PassportRewardsManager] Botão "Nova Recompensa" clicado. showForm atual:', showForm);
                setShowForm(!showForm);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Recompensa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Nova Recompensa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={formErrors.route_id ? 'text-red-500' : ''}>Rota *</Label>
                  <Select
                    value={formData.route_id}
                    onValueChange={(v) => setFormData({ ...formData, route_id: v })}
                  >
                    <SelectTrigger className={formErrors.route_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione uma rota" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.route_id && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.route_id}</p>
                  )}
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={formData.reward_type}
                    onValueChange={(v: any) => setFormData({ ...formData, reward_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desconto">Desconto</SelectItem>
                      <SelectItem value="brinde">Brinde</SelectItem>
                      <SelectItem value="experiencia">Experiência</SelectItem>
                      <SelectItem value="avatar">Avatar do Pantanal</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={formErrors.partner_name ? 'text-red-500' : ''}>Nome do Parceiro *</Label>
                  <Input
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                    className={formErrors.partner_name ? 'border-red-500' : ''}
                  />
                  {formErrors.partner_name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.partner_name}</p>
                  )}
                </div>
                {formData.reward_type === 'desconto' && (
                  <div>
                    <Label className={formErrors.discount_percentage ? 'text-red-500' : ''}>Percentual de Desconto *</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })
                      }
                      className={formErrors.discount_percentage ? 'border-red-500' : ''}
                    />
                    {formErrors.discount_percentage && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.discount_percentage}</p>
                    )}
                  </div>
                )}
                {formData.reward_type === 'avatar' && (
                  <div className="space-y-4">
                    <div>
                      <Label className={formErrors.avatar_id ? 'text-red-500' : ''}>Selecionar Avatar do Pantanal *</Label>
                      <Select
                        value={formData.avatar_id}
                        onValueChange={(value) => setFormData({ ...formData, avatar_id: value })}
                      >
                        <SelectTrigger className={formErrors.avatar_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Escolha um avatar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {avatars.map((avatar: any) => (
                            <SelectItem key={avatar.id} value={avatar.id}>
                              <div className="flex items-center gap-2">
                                {avatar.image_url && (
                                  <img
                                    src={avatar.image_url}
                                    alt={avatar.name}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                )}
                                <span>{avatar.name}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  avatar.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                                  avatar.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                                  avatar.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {avatar.rarity === 'legendary' ? 'Lendário' :
                                   avatar.rarity === 'epic' ? 'Épico' :
                                   avatar.rarity === 'rare' ? 'Raro' : 'Comum'}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.avatar_id && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.avatar_id}</p>
                      )}
                    </div>
                    <div>
                      <Label className={formErrors.max_avatars_per_route ? 'text-red-500' : ''}>Máximo de Avatares por Rota *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.max_avatars_per_route}
                        onChange={(e) =>
                          setFormData({ ...formData, max_avatars_per_route: parseInt(e.target.value) || 1 })
                        }
                        className={formErrors.max_avatars_per_route ? 'border-red-500' : ''}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Número máximo de avatares que podem ser desbloqueados ao completar esta rota
                      </p>
                      {formErrors.max_avatars_per_route && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.max_avatars_per_route}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label className={formErrors.reward_description ? 'text-red-500' : ''}>
                  {formData.reward_type === 'outros' ? 'Qual é a recompensa?' : 'Descrição'} *
                </Label>
                <Textarea
                  value={formData.reward_description}
                  onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
                  className={formErrors.reward_description ? 'border-red-500' : ''}
                />
                {formErrors.reward_description && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.reward_description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label>Prefixo do Voucher (opcional)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p><strong>⚠️ IMPORTANTE: Este é diferente do "Código do Parceiro" usado nos checkpoints!</strong></p>
                          <p className="mt-2">O prefixo do voucher é usado para gerar códigos únicos quando o turista <strong>ganha a recompensa</strong> (após completar a rota).</p>
                          <p className="mt-2 text-xs">Exemplo: Se o prefixo for "CG10", cada turista receberá um código único como:</p>
                          <p className="text-xs font-mono">• CG10-A1B2C3D4</p>
                          <p className="text-xs font-mono">• CG10-X9Y8Z7W6</p>
                          <p className="mt-2 text-xs">O turista apresenta este código ao parceiro para resgatar a recompensa.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    value={formData.reward_code_prefix}
                    onChange={(e) => setFormData({ ...formData, reward_code_prefix: e.target.value })}
                    placeholder="Ex: CG10, MSFURNAS"
                  />
                </div>
                <div>
                  <Label>Validade (opcional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label>Estoque (max vouchers)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Quantidade máxima de vouchers que podem ser emitidos para esta recompensa.</p>
                          <p className="mt-2 text-xs"><strong>Exemplo:</strong> Se colocar 50, apenas os primeiros 50 turistas que completarem a rota receberão esta recompensa.</p>
                          <p className="mt-2 text-xs"><strong>Deixe vazio</strong> para permitir vouchers ilimitados (sem estoque).</p>
                          <p className="mt-2 text-xs">Cada turista recebe um código único de voucher quando ganha a recompensa.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={formData.max_vouchers ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData({ ...formData, max_vouchers: v === '' ? null : Math.max(0, parseInt(v) || 0) });
                    }}
                    placeholder="Vazio = ilimitado"
                  />
                </div>
                <div>
                  <Label>Limite por usuário</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_per_user}
                    onChange={(e) => setFormData({ ...formData, max_per_user: Math.max(1, parseInt(e.target.value) || 1) })}
                  />
                </div>
                <div>
                  <Label>Secundária (fallback)</Label>
                  <Select
                    value={formData.is_fallback ? 'true' : 'false'}
                    onValueChange={(v) => setFormData({ ...formData, is_fallback: v === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Não</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔵 [PassportRewardsManager] Botão "Salvar" clicado');
                    handleSave();
                  }}
                  disabled={saving}
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    console.log('🔵 [PassportRewardsManager] Botão "Cancelar" clicado');
                    setShowForm(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{reward.partner_name}</h3>
                      <p className="text-sm text-muted-foreground">{reward.reward_description}</p>
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        <div>
                          <strong>Tipo:</strong> {reward.reward_type}
                          {reward.is_fallback ? ' (fallback)' : ''}
                        </div>
                        <div>
                          <strong>Estoque:</strong>{' '}
                          {reward.max_vouchers == null
                            ? 'Ilimitado'
                            : (() => {
                                const emitted = emittedByRewardId[reward.id] || 0;
                                const remaining = reward.max_vouchers - emitted;
                                return remaining > 0
                                  ? `${remaining}/${reward.max_vouchers} disponíveis`
                                  : `ESGOTADO (0/${reward.max_vouchers})`;
                              })()}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔵 [PassportRewardsManager] Botão "Excluir" clicado para recompensa:', reward.id);
                        handleDelete(reward.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PassportRewardsManager;

