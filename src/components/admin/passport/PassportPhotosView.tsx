import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Loader2, Calendar, MapPin, User, Route, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PhotoStamp {
  id: string;
  photo_url: string;
  stamped_at: string;
  checkpoint_id: string;
  route_id: string;
  user_id: string;
  checkpoint_name?: string;
  route_name?: string;
  user_email?: string;
}

const PassportPhotosView: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoStamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoStamp | null>(null);
  const [filterRoute, setFilterRoute] = useState<string>('all');
  const [filterCheckpoint, setFilterCheckpoint] = useState<string>('all');
  const [routes, setRoutes] = useState<any[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadRoutes();
    loadPhotos();
  }, []);

  useEffect(() => {
    if (filterRoute && filterRoute !== 'all') {
      loadCheckpoints(filterRoute);
    } else {
      setCheckpoints([]);
    }
  }, [filterRoute]);

  const loadRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setRoutes(data || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar rotas:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as rotas.',
        variant: 'destructive',
      });
    }
  };

  const loadCheckpoints = async (routeId: string) => {
    try {
      const { data, error } = await supabase
        .from('route_checkpoints')
        .select('id, name')
        .eq('route_id', routeId)
        .order('name');

      if (error) throw error;
      setCheckpoints(data || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar checkpoints:', err);
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      
      // Buscar stamps com fotos
      let query = supabase
        .from('passport_stamps')
        .select('id, photo_url, stamped_at, checkpoint_id, route_id, user_id')
        .not('photo_url', 'is', null)
        .order('stamped_at', { ascending: false });

      if (filterRoute && filterRoute !== 'all') {
        query = query.eq('route_id', filterRoute);
      }

      if (filterCheckpoint && filterCheckpoint !== 'all') {
        query = query.eq('checkpoint_id', filterCheckpoint);
      }

      const { data: stamps, error: stampsError } = await query;

      if (stampsError) throw stampsError;

      if (!stamps || stamps.length === 0) {
        setPhotos([]);
        return;
      }

      // Buscar informações adicionais (checkpoints, rotas, usuários)
      const checkpointIds = [...new Set(stamps.map(s => s.checkpoint_id))];
      const routeIds = [...new Set(stamps.map(s => s.route_id))];
      const userIds = [...new Set(stamps.map(s => s.user_id))];

      // Buscar checkpoints
      const { data: checkpointsData } = await supabase
        .from('route_checkpoints')
        .select('id, name')
        .in('id', checkpointIds);

      // Buscar rotas
      const { data: routesData } = await supabase
        .from('routes')
        .select('id, name')
        .in('id', routeIds);

      // Buscar usuários (via auth.users - pode precisar de permissões especiais)
      // Tentar buscar de user_passports ou user_profiles
      const { data: usersData } = await supabase
        .from('user_passports')
        .select('user_id, passport_number')
        .in('user_id', userIds);

      // Mapear dados
      const checkpointMap = new Map(checkpointsData?.map(cp => [cp.id, cp.name]) || []);
      const routeMap = new Map(routesData?.map(r => [r.id, r.name]) || []);

      const photosWithDetails: PhotoStamp[] = stamps.map(stamp => ({
        ...stamp,
        checkpoint_name: checkpointMap.get(stamp.checkpoint_id),
        route_name: routeMap.get(stamp.route_id),
        user_email: undefined, // Não conseguimos buscar email sem permissões especiais
      }));

      setPhotos(photosWithDetails);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar fotos:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as fotos dos check-ins.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [filterRoute, filterCheckpoint]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Fotos dos Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="filter-route">Filtrar por Rota</Label>
              <Select value={filterRoute} onValueChange={setFilterRoute}>
                <SelectTrigger id="filter-route">
                  <SelectValue placeholder="Todas as rotas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as rotas</SelectItem>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-checkpoint">Filtrar por Checkpoint</Label>
              <Select 
                value={filterCheckpoint} 
                onValueChange={setFilterCheckpoint}
                disabled={!filterRoute || filterRoute === 'all' || checkpoints.length === 0}
              >
                <SelectTrigger id="filter-checkpoint">
                  <SelectValue placeholder="Todos os checkpoints" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os checkpoints</SelectItem>
                  {checkpoints.map((checkpoint) => (
                    <SelectItem key={checkpoint.id} value={checkpoint.id}>
                      {checkpoint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Galeria de fotos */}
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Carregando fotos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma foto encontrada.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card 
                  key={photo.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={photo.photo_url}
                        alt={`Check-in em ${photo.checkpoint_name || 'checkpoint'}`}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        <Camera className="h-3 w-3 inline mr-1" />
                        Foto
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Route className="h-4 w-4" />
                        <span className="truncate">{photo.route_name || 'Rota desconhecida'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{photo.checkpoint_name || 'Checkpoint desconhecido'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(photo.stamped_at), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para visualizar foto em tamanho maior */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto do Check-in
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={selectedPhoto.photo_url}
                  alt={`Check-in em ${selectedPhoto.checkpoint_name || 'checkpoint'}`}
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Rota:</span>
                  <span>{selectedPhoto.route_name || 'Desconhecida'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Checkpoint:</span>
                  <span>{selectedPhoto.checkpoint_name || 'Desconhecido'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Data:</span>
                  <span>
                    {format(new Date(selectedPhoto.stamped_at), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Usuário ID:</span>
                  <span className="text-xs font-mono">{selectedPhoto.user_id.substring(0, 8)}...</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PassportPhotosView;

