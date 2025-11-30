import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PassportRouteManager: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    video_url: '',
    passport_number_prefix: 'MS',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

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

  const handleEdit = (route: any) => {
    setEditingRoute(route);
    setFormData({
      video_url: route.video_url || '',
      passport_number_prefix: route.passport_number_prefix || 'MS',
    });
  };

  const handleSave = async () => {
    if (!editingRoute) return;

    try {
      await passportAdminService.updateRoute(editingRoute.id, formData);
      toast({
        title: 'Rota atualizada',
        description: 'As configurações do passaporte foram salvas.',
      });
      setEditingRoute(null);
      loadRoutes();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando rotas...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Rotas do Passaporte</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma rota encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {routes.map((route) => (
                <Card key={route.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{route.name}</h3>
                        {route.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {route.description}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">Vídeo:</span>{' '}
                            {route.video_url ? (
                              <a
                                href={route.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Ver vídeo
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Não configurado</span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Prefixo:</span>{' '}
                            {route.passport_number_prefix || 'MS'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(route)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingRoute && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Rota: {editingRoute.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) =>
                  setFormData({ ...formData, video_url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label htmlFor="prefix">Prefixo do Número do Passaporte</Label>
              <Input
                id="prefix"
                value={formData.passport_number_prefix}
                onChange={(e) =>
                  setFormData({ ...formData, passport_number_prefix: e.target.value })
                }
                placeholder="MS"
                maxLength={10}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Salvar</Button>
              <Button variant="outline" onClick={() => setEditingRoute(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PassportRouteManager;

