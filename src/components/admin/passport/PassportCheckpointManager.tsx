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
import { Plus, Edit, Trash2, MapPin, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LocationPicker from '@/components/admin/LocationPicker';

const PassportCheckpointManager: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
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
    partner_code: '',
    requires_photo: false,
    stamp_fragment_number: null as number | null,
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      loadCheckpoints();
      // Resetar formulário ao trocar de rota
      setCreatingCheckpoint(false);
      setEditingCheckpoint(null);
    }
  }, [selectedRoute]);

  const loadRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setRoutes(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar rotas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCheckpoints = async () => {
    if (!selectedRoute) return;
    
    try {
      const { data, error } = await supabase
        .from('route_checkpoints')
        .select('*')
        .eq('route_id', selectedRoute)
        .order('order_sequence', { ascending: true });

      if (error) throw error;
      setCheckpoints(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar checkpoints',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
    if (locationPickerFor === 'create') {
      setNewCheckpointForm({
        ...newCheckpointForm,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } else if (locationPickerFor === 'edit') {
      setEditCheckpointForm({
        ...editCheckpointForm,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
    setShowLocationPicker(false);
    setLocationPickerFor(null);
  };

  const handleCreateCheckpoint = async () => {
    if (!selectedRoute) {
      toast({
        title: 'Selecione uma rota',
        variant: 'destructive',
      });
      return;
    }

    if (!newCheckpointForm.name.trim()) {
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
      toast({
        title: 'Localização necessária',
        description: 'Este modo de validação requer coordenadas. Selecione a localização no mapa.',
        variant: 'destructive',
      });
      return;
    }

    // Validar se precisa de código
    if ((newCheckpointForm.validation_mode === 'code' || newCheckpointForm.validation_mode === 'mixed') && 
        !newCheckpointForm.partner_code.trim()) {
      toast({
        title: 'Código do parceiro necessário',
        description: 'Este modo de validação requer um código do parceiro.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('route_checkpoints').insert({
        route_id: selectedRoute,
        name: newCheckpointForm.name,
        description: newCheckpointForm.description || null,
        order_sequence: newCheckpointForm.order_sequence,
        latitude: newCheckpointForm.latitude,
        longitude: newCheckpointForm.longitude,
        geofence_radius: newCheckpointForm.geofence_radius,
        validation_mode: newCheckpointForm.validation_mode,
        partner_code: newCheckpointForm.partner_code || null,
        requires_photo: newCheckpointForm.requires_photo,
        stamp_fragment_number: newCheckpointForm.stamp_fragment_number,
        is_mandatory: true,
      });

      if (error) throw error;

      toast({
        title: 'Checkpoint criado',
        description: 'O novo checkpoint foi criado com sucesso.',
      });

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
      loadCheckpoints();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar checkpoint',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditCheckpoint = (checkpoint: any) => {
    setEditingCheckpoint(checkpoint.id);
    setEditCheckpointForm({
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
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCheckpoint) return;

    try {
      await passportAdminService.updateCheckpoint(editingCheckpoint, editCheckpointForm);
      toast({
        title: 'Checkpoint atualizado',
      });
      setEditingCheckpoint(null);
      loadCheckpoints();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCheckpoint = async (checkpointId: string) => {
    if (!confirm('Tem certeza que deseja excluir este checkpoint?')) return;

    try {
      const { error } = await supabase
        .from('route_checkpoints')
        .delete()
        .eq('id', checkpointId);

      if (error) throw error;

      toast({
        title: 'Checkpoint excluído',
      });
      loadCheckpoints();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const generatePartnerCode = () => {
    const prefix = 'MS';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random}`;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gerenciar Checkpoints</CardTitle>
            {selectedRoute && (
              <Button onClick={() => setCreatingCheckpoint(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Checkpoint
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Selecione uma Rota</Label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
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
                    <div>
                      <Label htmlFor="new_name">Nome do Ponto *</Label>
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
                      <Label htmlFor="new_description">Descrição</Label>
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
                        <Label htmlFor="new_order">Ordem na Rota</Label>
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
                        <Label htmlFor="new_fragment">Fragmento do Carimbo</Label>
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
                      <Label>Tipo de Validação *</Label>
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
                        <Label>Localização (Latitude/Longitude) *</Label>
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
                      <div>
                        <Label htmlFor="new_partner_code">Código do Parceiro *</Label>
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
                            onClick={() =>
                              setNewCheckpointForm({
                                ...newCheckpointForm,
                                partner_code: generatePartnerCode(),
                              })
                            }
                          >
                            Gerar Código
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Código curto que o parceiro informará ao turista (ex: MS-4281)
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new_radius">Raio Geofence (metros)</Label>
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
                        <Label htmlFor="new_photo">Foto obrigatória</Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateCheckpoint}>
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
                              <Button onClick={handleSaveEdit}>
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
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCheckpoint(checkpoint)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCheckpoint(checkpoint.id)}
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
