import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PassportCheckpointManager: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      loadCheckpoints();
    }
  }, [selectedRoute]);

  const loadRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true);

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

  const handleUpdateCheckpoint = async (checkpointId: string, updates: any) => {
    try {
      await passportAdminService.updateCheckpoint(checkpointId, updates);
      toast({
        title: 'Checkpoint atualizado',
      });
      loadCheckpoints();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Checkpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Selecione uma Rota</Label>
            <select
              className="w-full p-2 border rounded-md mt-1"
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
            >
              <option value="">Selecione uma rota</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>

          {selectedRoute && checkpoints.length > 0 && (
            <div className="space-y-4">
              {checkpoints.map((checkpoint) => (
                <Card key={checkpoint.id} className="border">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold">{checkpoint.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Fragmento do Carimbo</Label>
                        <Input
                          type="number"
                          value={checkpoint.stamp_fragment_number || ''}
                          onChange={(e) =>
                            handleUpdateCheckpoint(checkpoint.id, {
                              stamp_fragment_number: parseInt(e.target.value) || null,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Raio Geofence (metros)</Label>
                        <Input
                          type="number"
                          value={checkpoint.geofence_radius || 100}
                          onChange={(e) =>
                            handleUpdateCheckpoint(checkpoint.id, {
                              geofence_radius: parseInt(e.target.value) || 100,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`photo-${checkpoint.id}`}
                        checked={checkpoint.requires_photo || false}
                        onCheckedChange={(checked) =>
                          handleUpdateCheckpoint(checkpoint.id, {
                            requires_photo: checked,
                          })
                        }
                      />
                      <Label htmlFor={`photo-${checkpoint.id}`}>
                        Foto obrigatória
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PassportCheckpointManager;

