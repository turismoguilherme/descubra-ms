// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MapPin, Save, X, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LocationPicker from '@/components/admin/LocationPicker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PassportCheckpointManager: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingCheckpoint, setCreatingCheckpoint] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationPickerFor, setLocationPickerFor] = useState<'create' | 'edit' | null>(null);
  const { toast } = useToast();

  const [newCheckpointForm, setNewCheckpointForm] = useState({
    name: '',
    description: '',
    order_sequence: 1,
    latitude: null as number | null,
    longitude: null as number | null,
    geofence_radius: 100,
    validation_mode: 'geofence' as 'geofence' | 'code' | 'mixed',
    partner_id: null as string | null,
    partner_code: '',
    requires_photo: false,
    stamp_fragment_number: null as number | null,
  });

  const [editCheckpointForm, setEditCheckpointForm] = useState({
    name: '',
    description: '',
    order_sequence: 1,
    latitude: null as number | null,
    longitude: null as number | null,
    geofence_radius: 100,
    validation_mode: 'geofence' as 'geofence' | 'code' | 'mixed',
    partner_id: null as string | null,
    partner_code: '',
    requires_photo: false,
    stamp_fragment_number: null as number | null,
  });

  useEffect(() => {
    console.log('🔵 [PassportCheckpointManager] Componente montado, carregando rotas...');
    loadRoutes();
  }, []);

  useEffect(() => {
    console.log('🔵 [PassportCheckpointManager] selectedRoute mudou para:', selectedRoute);
    if (selectedRoute) {
      console.log('🔵 [PassportCheckpointManager] Carregando checkpoints para rota:', selectedRoute);
      loadCheckpoints();
      // Resetar formulário ao trocar de rota
      setCreatingCheckpoint(false);
      setEditingCheckpoint(null);
      console.log('🔵 [PassportCheckpointManager] Formulários resetados');
    }
  }, [selectedRoute]);

  useEffect(() => {
    console.log('🔵 [PassportCheckpointManager] creatingCheckpoint mudou para:', creatingCheckpoint);
  }, [creatingCheckpoint]);

  useEffect(() => {
    console.log('🔵 [PassportCheckpointManager] editingCheckpoint mudou para:', editingCheckpoint);
  }, [editingCheckpoint]);

  const loadRoutes = async () => {
    console.log('🔵 [PassportCheckpointManager] ========== loadRoutes INICIADO ==========');
    try {
      console.log('🔵 [PassportCheckpointManager] Buscando rotas ativas...');
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ [PassportCheckpointManager] Erro ao buscar rotas:', error);
        throw error;
      }
      console.log('✅ [PassportCheckpointManager] Rotas carregadas:', data?.length || 0);
      setRoutes(data || []);
    } catch (error: any) {
      console.error('❌ [PassportCheckpointManager] Erro completo ao carregar rotas:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      toast({
        title: 'Erro ao carregar rotas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('🔵 [PassportCheckpointManager] loadRoutes finalizado');
    }
  };

  const loadPartners = async () => {
    console.log('🔵 [PassportCheckpointManager] ========== loadPartners INICIADO ==========');
    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('id, name, contact_email')
        .order('name');

      if (error) {
        console.error('❌ [PassportCheckpointManager] Erro ao buscar parceiros:', error);
        // Não mostrar erro ao usuário, apenas logar
        return;
      }
      console.log('✅ [PassportCheckpointManager] Parceiros carregados:', data?.length || 0);
      setPartners(data || []);
    } catch (error: any) {
      console.error('❌ [PassportCheckpointManager] Erro ao carregar parceiros:', error);
    }
  };

  const loadCheckpoints = async () => {
    if (!selectedRoute) {
      console.log('🔵 [PassportCheckpointManager] loadCheckpoints: selectedRoute vazio, abortando');
      return;
    }
    
    console.log('🔵 [PassportCheckpointManager] ========== loadCheckpoints INICIADO ==========');
    console.log('🔵 [PassportCheckpointManager] Route ID:', selectedRoute);
    try {
      console.log('🔵 [PassportCheckpointManager] Buscando checkpoints...');
      const { data, error } = await supabase
        .from('route_checkpoints')
        .select('*')
        .eq('route_id', selectedRoute)
        .order('order_sequence', { ascending: true });

      if (error) {
        console.error('❌ [PassportCheckpointManager] Erro ao buscar checkpoints:', error);
        throw error;
      }
      console.log('✅ [PassportCheckpointManager] Checkpoints carregados:', data?.length || 0);
      console.log('🔵 [PassportCheckpointManager] Dados dos checkpoints:', data);
      setCheckpoints(data || []);
    } catch (error: any) {
      console.error('❌ [PassportCheckpointManager] Erro completo ao carregar checkpoints:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      toast({
        title: 'Erro ao carregar checkpoints',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
    console.log('🔵 [PassportCheckpointManager] ========== handleLocationSelect ==========');
    console.log('🔵 [PassportCheckpointManager] Location selecionada:', location);
    console.log('🔵 [PassportCheckpointManager] locationPickerFor:', locationPickerFor);
    
    if (locationPickerFor === 'create') {
      console.log('🔵 [PassportCheckpointManager] Atualizando formulário de criação');
      setNewCheckpointForm({
        ...newCheckpointForm,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } else if (locationPickerFor === 'edit') {
      console.log('🔵 [PassportCheckpointManager] Atualizando formulário de edição');
      setEditCheckpointForm({
        ...editCheckpointForm,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
    setShowLocationPicker(false);
    setLocationPickerFor(null);
    console.log('✅ [PassportCheckpointManager] Localização aplicada ao formulário');
  };

  const handleCreateCheckpoint = async () => {
    console.log('🔵 [PassportCheckpointManager] ========== handleCreateCheckpoint INICIADO ==========');
    console.log('🔵 [PassportCheckpointManager] Form data:', JSON.stringify(newCheckpointForm, null, 2));
    console.log('🔵 [PassportCheckpointManager] selectedRoute:', selectedRoute);
    
    if (!selectedRoute) {
      console.log('❌ [PassportCheckpointManager] Rota não selecionada');
      toast({
        title: 'Selecione uma rota',
        variant: 'destructive',
      });
      return;
    }

    if (!newCheckpointForm.name.trim()) {
      console.log('❌ [PassportCheckpointManager] Nome vazio');
      toast({
        title: 'Nome obrigatório',
        description: 'O nome do checkpoint é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    // Validar se precisa de coordenadas
    if ((newCheckpointForm.validation_mode === 'geofence' || newCheckpointForm.validation_mode === 'mixed') && 
        (!newCheckpointForm.latitude || !newCheckpointForm.longitude)) {
      console.log('❌ [PassportCheckpointManager] Coordenadas faltando para modo:', newCheckpointForm.validation_mode);
      toast({
        title: 'Localização necessária',
        description: 'Este modo de validação requer coordenadas. Selecione a localização no mapa.',
        variant: 'destructive',
      });
      return;
    }

    // Validar se precisa de parceiro e código
    if ((newCheckpointForm.validation_mode === 'code' || newCheckpointForm.validation_mode === 'mixed')) {
      if (!newCheckpointForm.partner_id) {
        console.log('❌ [PassportCheckpointManager] Parceiro não selecionado');
        toast({
          title: 'Parceiro obrigatório',
          description: 'Selecione um parceiro para este checkpoint',
          variant: 'destructive',
        });
        return;
      }
      
      if (!newCheckpointForm.partner_code.trim()) {
        console.log('❌ [PassportCheckpointManager] Código do parceiro faltando para modo:', newCheckpointForm.validation_mode);
        toast({
          title: 'Código do parceiro necessário',
          description: 'Este modo de validação requer um código do parceiro.',
          variant: 'destructive',
        });
        return;
      }
    }

    console.log('✅ [PassportCheckpointManager] Validações passadas, criando checkpoint...');
    
    try {
      const checkpointData = {
        route_id: selectedRoute,
        name: newCheckpointForm.name,
        description: newCheckpointForm.description || null,
        order_sequence: newCheckpointForm.order_sequence,
        latitude: newCheckpointForm.latitude,
        longitude: newCheckpointForm.longitude,
        geofence_radius: newCheckpointForm.geofence_radius,
        validation_mode: newCheckpointForm.validation_mode,
        partner_id: newCheckpointForm.partner_id || null,
        partner_code: newCheckpointForm.partner_code || null,
        requires_photo: newCheckpointForm.requires_photo,
        stamp_fragment_number: newCheckpointForm.stamp_fragment_number,
        is_mandatory: true,
      };
      
      console.log('🔵 [PassportCheckpointManager] Dados para inserção:', JSON.stringify(checkpointData, null, 2));
      
      const { data, error } = await supabase.from('route_checkpoints').insert(checkpointData).select();

      if (error) {
        console.error('❌ [PassportCheckpointManager] Erro ao inserir checkpoint:', error);
        throw error;
      }

      console.log('✅ [PassportCheckpointManager] Checkpoint criado com sucesso:', data);

      toast({
        title: 'Checkpoint criado',
        description: 'O novo checkpoint foi criado com sucesso.',
        duration: 5000,
      });

      console.log('🔵 [PassportCheckpointManager] Fechando formulário e resetando...');
      setCreatingCheckpoint(false);
      setNewCheckpointForm({
        name: '',
        description: '',
        order_sequence: checkpoints.length + 1,
        latitude: null,
        longitude: null,
        geofence_radius: 100,
        validation_mode: 'geofence',
        partner_id: null,
        partner_code: '',
        requires_photo: false,
        stamp_fragment_number: null,
      });
      
      console.log('🔵 [PassportCheckpointManager] Recarregando checkpoints...');
      await loadCheckpoints();
      console.log('✅ [PassportCheckpointManager] Processo completo finalizado');
    } catch (error: any) {
      console.error('❌ [PassportCheckpointManager] Erro completo ao criar checkpoint:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      
      toast({
        title: 'Erro ao criar checkpoint',
        description: error.message || 'Erro desconhecido. Verifique o console para mais detalhes.',
        variant: 'destructive',
        duration: 10000,
      });
      
      // Re-lançar o erro para que o onClick possa capturá-lo também
      throw error;
    }
  };

  const handleEditCheckpoint = (checkpoint: any) => {
    console.log('🔵 [PassportCheckpointManager] ========== handleEditCheckpoint ==========');
    console.log('🔵 [PassportCheckpointManager] Checkpoint selecionado:', checkpoint);
    setEditingCheckpoint(checkpoint.id);
    const formData = {
      name: checkpoint.name || '',
      description: checkpoint.description || '',
      order_sequence: checkpoint.order_sequence || 1,
      latitude: checkpoint.latitude,
      longitude: checkpoint.longitude,
      geofence_radius: checkpoint.geofence_radius || 100,
      validation_mode: checkpoint.validation_mode || 'geofence',
      partner_code: checkpoint.partner_code || '',
      requires_photo: checkpoint.requires_photo || false,
      stamp_fragment_number: checkpoint.stamp_fragment_number,
    };
    console.log('🔵 [PassportCheckpointManager] Formulário de edição preenchido:', formData);
    setEditCheckpointForm(formData);
  };

  const handleSaveEdit = async () => {
    console.log('🔵 [PassportCheckpointManager] ========== handleSaveEdit INICIADO ==========');
    console.log('🔵 [PassportCheckpointManager] editingCheckpoint:', editingCheckpoint);
    console.log('🔵 [PassportCheckpointManager] Form data:', JSON.stringify(editCheckpointForm, null, 2));
    
    if (!editingCheckpoint) {
      console.log('❌ [PassportCheckpointManager] Nenhum checkpoint em edição');
      return;
    }

    try {
      console.log('🔵 [PassportCheckpointManager] Chamando passportAdminService.updateCheckpoint...');
      await passportAdminService.updateCheckpoint(editingCheckpoint, editCheckpointForm);
      console.log('✅ [PassportCheckpointManager] Checkpoint atualizado com sucesso');
      toast({
        title: 'Checkpoint atualizado',
      });
      setEditingCheckpoint(null);
      loadCheckpoints();
    } catch (error: any) {
      console.error('❌ [PassportCheckpointManager] Erro completo ao atualizar checkpoint:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCheckpoint = async (checkpointId: string) => {
    console.log('🔵 [PassportCheckpointManager] ========== handleDeleteCheckpoint ==========');
    console.log('🔵 [PassportCheckpointManager] Checkpoint ID:', checkpointId);
    
    if (!confirm('Tem certeza que deseja excluir este checkpoint?')) {
      console.log('🔵 [PassportCheckpointManager] Exclusão cancelada pelo usuário');
      return;
    }

    try {
      console.log('🔵 [PassportCheckpointManager] Deletando checkpoint...');
      const { error } = await supabase
        .from('route_checkpoints')
        .delete()
        .eq('id', checkpointId);

      if (error) {
        console.error('❌ [PassportCheckpointManager] Erro ao deletar:', error);
        throw error;
      }

      console.log('✅ [PassportCheckpointManager] Checkpoint deletado com sucesso');
      toast({
        title: 'Checkpoint excluído',
      });
      loadCheckpoints();
    } catch (error: any) {
      console.error('❌ [PassportCheckpointManager] Erro completo ao excluir checkpoint:', {
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

  const generatePartnerCode = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('generate_partner_code');
      if (error) throw error;
      return data || 'MS-0000';
    } catch (error: any) {
      console.error('Erro ao gerar código:', error);
      // Fallback para geração local
      const prefix = 'MS';
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `${prefix}-${random}`;
    }
  };

  // Log de renderização apenas quando estados importantes mudam
  useEffect(() => {
    console.log('🔵 [PassportCheckpointManager] Estado atual:', {
      loading,
      routesCount: routes.length,
      selectedRoute,
      checkpointsCount: checkpoints.length,
      creatingCheckpoint,
      editingCheckpoint,
    });
  }, [loading, routes.length, selectedRoute, checkpoints.length, creatingCheckpoint, editingCheckpoint]);

  if (loading) {
    console.log('🔵 [PassportCheckpointManager] Renderizando estado de loading');
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gerenciar Checkpoints</CardTitle>
            {selectedRoute && (
              <Button 
                type="button"
                onClick={() => {
                  console.log('🔵 [PassportCheckpointManager] Botão "Novo Checkpoint" clicado');
                  setCreatingCheckpoint(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Checkpoint
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Selecione uma Rota</Label>
            <Select 
              value={selectedRoute} 
              onValueChange={(value) => {
                console.log('🔵 [PassportCheckpointManager] Rota selecionada:', value);
                setSelectedRoute(value);
              }}
            >
              <SelectTrigger>
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
          </div>

          {selectedRoute && (
            <>
              {creatingCheckpoint && (
                <Card className="mt-4 border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Novo Checkpoint</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TooltipProvider>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="new_name">Nome do Ponto *</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Nome do ponto turístico ou local que será visitado. Ex: "Casa do Artesão", "Bioparque", "Feira Central".</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="new_name"
                          value={newCheckpointForm.name}
                          onChange={(e) =>
                            setNewCheckpointForm({ ...newCheckpointForm, name: e.target.value })
                          }
                          placeholder="Ex: Mercadão Municipal"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="new_description">Descrição</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Descrição detalhada do ponto. Informe o que o turista encontrará neste local e por que vale a pena visitar.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          id="new_description"
                          value={newCheckpointForm.description}
                          onChange={(e) =>
                            setNewCheckpointForm({ ...newCheckpointForm, description: e.target.value })
                          }
                          placeholder="Descrição do ponto..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor="new_order">Ordem na Rota</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Número que define a ordem de visitação dos checkpoints. O turista deve visitar na sequência: 1, 2, 3, etc.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="new_order"
                            type="number"
                            min="1"
                            value={newCheckpointForm.order_sequence}
                            onChange={(e) =>
                              setNewCheckpointForm({
                                ...newCheckpointForm,
                                order_sequence: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor="new_fragment">Fragmento do Carimbo</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Número do fragmento do carimbo que será desbloqueado ao completar este checkpoint. Cada checkpoint desbloqueia uma parte do carimbo completo.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id="new_fragment"
                            type="number"
                            min="1"
                            value={newCheckpointForm.stamp_fragment_number || ''}
                            onChange={(e) =>
                              setNewCheckpointForm({
                                ...newCheckpointForm,
                                stamp_fragment_number: e.target.value ? parseInt(e.target.value) : null,
                              })
                            }
                            placeholder="Opcional"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Tipo de Validação *</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p><strong>📍 Apenas Geolocalização:</strong> Turista precisa estar no local (GPS).</p>
                              <p><strong>🔑 Apenas Código:</strong> Turista digita código fornecido pelo parceiro.</p>
                              <p><strong>🔒 Geolocalização + Código:</strong> Mais seguro - exige GPS E código correto.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      <Select
                        value={newCheckpointForm.validation_mode}
                        onValueChange={(v: any) =>
                          setNewCheckpointForm({ ...newCheckpointForm, validation_mode: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geofence">
                            📍 Apenas Geolocalização (GPS)
                          </SelectItem>
                          <SelectItem value="code">
                            🔑 Apenas Código do Parceiro
                          </SelectItem>
                          <SelectItem value="mixed">
                            🔒 Geolocalização + Código (Recomendado)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {newCheckpointForm.validation_mode === 'geofence' &&
                          'O turista precisa estar no local (GPS).'}
                        {newCheckpointForm.validation_mode === 'code' &&
                          'O turista precisa digitar o código fornecido pelo parceiro.'}
                        {newCheckpointForm.validation_mode === 'mixed' &&
                          'O turista precisa estar no local E digitar o código correto.'}
                      </p>
                    </div>

                    {(newCheckpointForm.validation_mode === 'geofence' ||
                      newCheckpointForm.validation_mode === 'mixed') && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Localização (Latitude/Longitude) *</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>Coordenadas GPS do ponto físico. Clique em "Selecionar no Mapa" para escolher visualmente ou digite manualmente.</p>
                              <p className="mt-2 text-xs">As coordenadas são usadas para validar se o turista está realmente no local.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newCheckpointForm.latitude?.toString() || ''}
                            placeholder="Latitude"
                            readOnly
                            className="flex-1"
                          />
                          <Input
                            value={newCheckpointForm.longitude?.toString() || ''}
                            placeholder="Longitude"
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              console.log('🔵 [PassportCheckpointManager] Botão "Selecionar no Mapa" clicado');
                              setLocationPickerFor('create');
                              setShowLocationPicker(true);
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Selecionar no Mapa
                          </Button>
                        </div>
                      </div>
                    )}

                    {(newCheckpointForm.validation_mode === 'code' ||
                      newCheckpointForm.validation_mode === 'mixed') && (
                      <>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor="new_partner_id">Parceiro *</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Selecione o parceiro responsável por este checkpoint. O parceiro poderá ver e gerenciar seu código no dashboard.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select
                            value={newCheckpointForm.partner_id || ''}
                            onValueChange={(v) =>
                              setNewCheckpointForm({ ...newCheckpointForm, partner_id: v || null })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um parceiro" />
                            </SelectTrigger>
                            <SelectContent>
                              {partners.map((partner) => (
                                <SelectItem key={partner.id} value={partner.id}>
                                  {partner.name} ({partner.contact_email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!newCheckpointForm.partner_id && (
                            <p className="text-xs text-yellow-600 mt-1">
                              ⚠️ Selecione um parceiro para continuar
                            </p>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor="new_partner_code">Código do Parceiro *</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p><strong>⚠️ IMPORTANTE: Este é diferente do "Código do Voucher" usado nas recompensas!</strong></p>
                              <p className="mt-2">O <strong>Código do Parceiro</strong> é um código fixo que o parceiro físico (dono do estabelecimento) fornece ao turista para validar o <strong>checkpoint</strong>.</p>
                              <p className="mt-2 text-xs"><strong>Exemplo:</strong> "MS-4281"</p>
                              <p className="mt-2 text-xs">• O turista chega no local</p>
                              <p className="text-xs">• O parceiro informa o código: "MS-4281"</p>
                              <p className="text-xs">• O turista digita este código no app para validar o check-in</p>
                              <p className="mt-2 text-xs"><strong>Este código é o mesmo para todos os turistas</strong> que visitam este checkpoint.</p>
                              <p className="mt-2 text-xs text-yellow-600">💡 O "Código do Voucher" é diferente: é gerado automaticamente quando o turista ganha uma recompensa (após completar a rota).</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="new_partner_code"
                            value={newCheckpointForm.partner_code}
                            onChange={(e) =>
                              setNewCheckpointForm({
                                ...newCheckpointForm,
                                partner_code: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="Ex: MS-4281"
                            maxLength={20}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              const code = await generatePartnerCode();
                              console.log('🔵 [PassportCheckpointManager] Código gerado:', code);
                              setNewCheckpointForm({
                                ...newCheckpointForm,
                                partner_code: code,
                              });
                            }}
                          >
                            Gerar Código
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Código curto que o parceiro informará ao turista (ex: MS-4281)
                        </p>
                      </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="new_radius">Raio Geofence (metros)</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>Distância máxima (em metros) que o turista pode estar do ponto para fazer check-in.</p>
                              <p className="mt-2 text-xs"><strong>Exemplos:</strong></p>
                              <p className="text-xs">• Loja pequena: 50-100m</p>
                              <p className="text-xs">• Praça/Parque: 100-200m</p>
                              <p className="text-xs">• Zoológico/Feira: 200-500m</p>
                              <p className="mt-1 text-xs">Padrão: 100 metros</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="new_radius"
                          type="number"
                          min="10"
                          max="1000"
                          value={newCheckpointForm.geofence_radius}
                          onChange={(e) =>
                            setNewCheckpointForm({
                              ...newCheckpointForm,
                              geofence_radius: parseInt(e.target.value) || 100,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Distância máxima para validar check-in (padrão: 100m)
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id="new_photo"
                          checked={newCheckpointForm.requires_photo}
                          onCheckedChange={(checked) =>
                            setNewCheckpointForm({
                              ...newCheckpointForm,
                              requires_photo: checked as boolean,
                            })
                          }
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="new_photo">Foto obrigatória</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Se marcado, o turista será obrigado a tirar uma foto ao fazer check-in neste checkpoint.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    </TooltipProvider>

                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔵 [PassportCheckpointManager] ========== BOTÃO "CRIAR CHECKPOINT" CLICADO ==========');
                          console.log('🔵 [PassportCheckpointManager] Event:', e);
                          console.log('🔵 [PassportCheckpointManager] Form data:', JSON.stringify(newCheckpointForm, null, 2));
                          try {
                            await handleCreateCheckpoint();
                            console.log('✅ [PassportCheckpointManager] handleCreateCheckpoint concluído com sucesso');
                          } catch (err) {
                            console.error('❌ [PassportCheckpointManager] Erro ao chamar handleCreateCheckpoint:', err);
                            toast({
                              title: 'Erro ao criar checkpoint',
                              description: err instanceof Error ? err.message : 'Erro desconhecido. Verifique o console.',
                              variant: 'destructive',
                              duration: 10000,
                            });
                          }
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Criar Checkpoint
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCreatingCheckpoint(false);
                          setNewCheckpointForm({
                            name: '',
                            description: '',
                            order_sequence: checkpoints.length + 1,
                            latitude: null,
                            longitude: null,
                            geofence_radius: 100,
                            validation_mode: 'geofence',
                            partner_code: '',
                            requires_photo: false,
                            stamp_fragment_number: null,
                          });
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {checkpoints.length > 0 && (
                <div className="mt-4 space-y-4">
                  {checkpoints.map((checkpoint) => (
                    <Card key={checkpoint.id} className="border">
                      <CardContent className="p-4">
                        {editingCheckpoint === checkpoint.id ? (
                          <div className="space-y-4">
                            <div>
                              <Label>Nome do Ponto *</Label>
                              <Input
                                value={editCheckpointForm.name}
                                onChange={(e) =>
                                  setEditCheckpointForm({
                                    ...editCheckpointForm,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <Label>Descrição</Label>
                              <Textarea
                                value={editCheckpointForm.description}
                                onChange={(e) =>
                                  setEditCheckpointForm({
                                    ...editCheckpointForm,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Ordem</Label>
                                <Input
                                  type="number"
                                  value={editCheckpointForm.order_sequence}
                                  onChange={(e) =>
                                    setEditCheckpointForm({
                                      ...editCheckpointForm,
                                      order_sequence: parseInt(e.target.value) || 1,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Fragmento</Label>
                                <Input
                                  type="number"
                                  value={editCheckpointForm.stamp_fragment_number || ''}
                                  onChange={(e) =>
                                    setEditCheckpointForm({
                                      ...editCheckpointForm,
                                      stamp_fragment_number: e.target.value
                                        ? parseInt(e.target.value)
                                        : null,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Tipo de Validação</Label>
                              <Select
                                value={editCheckpointForm.validation_mode}
                                onValueChange={(v: any) =>
                                  setEditCheckpointForm({
                                    ...editCheckpointForm,
                                    validation_mode: v,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="geofence">📍 Apenas Geolocalização</SelectItem>
                                  <SelectItem value="code">🔑 Apenas Código</SelectItem>
                                  <SelectItem value="mixed">🔒 Geolocalização + Código</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {(editCheckpointForm.validation_mode === 'geofence' ||
                              editCheckpointForm.validation_mode === 'mixed') && (
                              <div>
                                <Label>Localização</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={editCheckpointForm.latitude?.toString() || ''}
                                    placeholder="Latitude"
                                    readOnly
                                    className="flex-1"
                                  />
                                  <Input
                                    value={editCheckpointForm.longitude?.toString() || ''}
                                    placeholder="Longitude"
                                    readOnly
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setLocationPickerFor('edit');
                                      setShowLocationPicker(true);
                                    }}
                                  >
                                    <MapPin className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {(editCheckpointForm.validation_mode === 'code' ||
                              editCheckpointForm.validation_mode === 'mixed') && (
                              <div>
                                <Label>Código do Parceiro</Label>
                                <Input
                                  value={editCheckpointForm.partner_code}
                                  onChange={(e) =>
                                    setEditCheckpointForm({
                                      ...editCheckpointForm,
                                      partner_code: e.target.value.toUpperCase(),
                                    })
                                  }
                                  maxLength={20}
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Raio Geofence (metros)</Label>
                                <Input
                                  type="number"
                                  value={editCheckpointForm.geofence_radius}
                                  onChange={(e) =>
                                    setEditCheckpointForm({
                                      ...editCheckpointForm,
                                      geofence_radius: parseInt(e.target.value) || 100,
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center space-x-2 pt-6">
                                <Checkbox
                                  checked={editCheckpointForm.requires_photo}
                                  onCheckedChange={(checked) =>
                                    setEditCheckpointForm({
                                      ...editCheckpointForm,
                                      requires_photo: checked as boolean,
                                    })
                                  }
                                />
                                <Label>Foto obrigatória</Label>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🔵 [PassportCheckpointManager] Botão "Salvar" (edição) clicado');
                                  handleSaveEdit();
                                }}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingCheckpoint(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">
                                  {checkpoint.order_sequence}. {checkpoint.name}
                                </h3>
                                {checkpoint.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {checkpoint.description}
                                  </p>
                                )}
                                <div className="mt-2 space-y-1 text-sm">
                                  <div>
                                    <span className="font-medium">Validação:</span>{' '}
                                    {checkpoint.validation_mode === 'geofence' && '📍 Apenas GPS'}
                                    {checkpoint.validation_mode === 'code' && '🔑 Apenas Código'}
                                    {checkpoint.validation_mode === 'mixed' && '🔒 GPS + Código'}
                                  </div>
                                  {checkpoint.latitude && checkpoint.longitude && (
                                    <div>
                                      <span className="font-medium">Localização:</span>{' '}
                                      {checkpoint.latitude.toFixed(6)}, {checkpoint.longitude.toFixed(6)}
                                      {' '}
                                      <span className="text-muted-foreground">
                                        (raio: {checkpoint.geofence_radius || 100}m)
                                      </span>
                                    </div>
                                  )}
                                  {checkpoint.partner_code && (
                                    <div>
                                      <span className="font-medium">Código:</span>{' '}
                                      <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                                        {checkpoint.partner_code}
                                      </span>
                                    </div>
                                  )}
                                  {checkpoint.stamp_fragment_number && (
                                    <div>
                                      <span className="font-medium">Fragmento:</span>{' '}
                                      {checkpoint.stamp_fragment_number}
                                    </div>
                                  )}
                                  {checkpoint.requires_photo && (
                                    <div>
                                      <span className="font-medium">📷 Foto obrigatória</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('🔵 [PassportCheckpointManager] Botão "Editar" clicado para checkpoint:', checkpoint.id);
                                    handleEditCheckpoint(checkpoint);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('🔵 [PassportCheckpointManager] Botão "Excluir" clicado para checkpoint:', checkpoint.id);
                                    handleDeleteCheckpoint(checkpoint.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {selectedRoute && checkpoints.length === 0 && !creatingCheckpoint && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum checkpoint cadastrado. Clique em "Novo Checkpoint" para começar.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => {
          setShowLocationPicker(false);
          setLocationPickerFor(null);
        }}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          locationPickerFor === 'create'
            ? newCheckpointForm.latitude && newCheckpointForm.longitude
              ? {
                  latitude: newCheckpointForm.latitude,
                  longitude: newCheckpointForm.longitude,
                }
              : undefined
            : editCheckpointForm.latitude && editCheckpointForm.longitude
            ? {
                latitude: editCheckpointForm.latitude,
                longitude: editCheckpointForm.longitude,
              }
            : undefined
        }
      />
    </div>
  );
};

export default PassportCheckpointManager;
