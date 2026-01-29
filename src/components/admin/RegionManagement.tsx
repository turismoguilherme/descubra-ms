
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  MapPin, 
  Upload,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TouristRegion, RegionCity } from "@/types/digitalPassport";
import { 
  fetchTouristRegions, 
  fetchRegionCities 
} from "@/services/digitalPassportService";
import { supabase } from "@/integrations/supabase/client";

interface RegionManagementProps {
  userRegion?: string;
}

const RegionManagement: React.FC<RegionManagementProps> = ({ userRegion }) => {
  const { toast } = useToast();
  const [regions, setRegions] = useState<TouristRegion[]>([]);
  const [cities, setCities] = useState<Record<string, RegionCity[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingRegion, setEditingRegion] = useState<TouristRegion | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visual_art_url: '',
    video_url: '',
    guardian_avatar_url: '',
    map_image_url: '',
    is_active: true
  });

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const regionsData = await fetchTouristRegions();
      setRegions(regionsData);

      // Carregar cidades para cada região
      const citiesData: Record<string, RegionCity[]> = {};
      for (const region of regionsData) {
        const regionCities = await fetchRegionCities(region.id);
        citiesData[region.id] = regionCities;
      }
      setCities(citiesData);
    } catch (error) {
      console.error('Erro ao carregar regiões:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar regiões turísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRegion = () => {
    setEditingRegion(null);
    setFormData({
      name: '',
      description: '',
      visual_art_url: '',
      video_url: '',
      guardian_avatar_url: '',
      map_image_url: '',
      is_active: true
    });
    setShowForm(true);
  };

  const handleEditRegion = (region: TouristRegion) => {
    setEditingRegion(region);
    setFormData({
      name: region.name,
      description: region.description || '',
      visual_art_url: region.visual_art_url || '',
      video_url: region.video_url || '',
      guardian_avatar_url: region.guardian_avatar_url || '',
      map_image_url: region.map_image_url || '',
      is_active: region.is_active
    });
    setShowForm(true);
  };

  const handleSaveRegion = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      if (editingRegion) {
        // Atualizar região existente
        const { error } = await supabase
          .from('tourist_regions')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRegion.id);

        if (error) throw error;

        toast({
          title: "✅ Região atualizada",
          description: `A região ${formData.name} foi atualizada com sucesso.`,
        });
      } else {
        // Criar nova região
        const { error } = await supabase
          .from('tourist_regions')
          .insert({
            ...formData,
          } as any);

        if (error) throw error;

        toast({
          title: "✅ Região criada",
          description: `A região ${formData.name} foi criada com sucesso.`,
        });
      }

      setShowForm(false);
      setEditingRegion(null);
      loadRegions();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar região:', err);
      toast({
        title: "❌ Erro ao salvar",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const toggleRegionStatus = async (region: TouristRegion) => {
    try {
      const { error } = await supabase
        .from('tourist_regions')
        .update({
          is_active: !region.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', region.id);

      if (error) throw error;

      toast({
        title: region.is_active ? "🔴 Região desativada" : "🟢 Região ativada",
        description: `A região ${region.name} foi ${region.is_active ? 'desativada' : 'ativada'}.`,
      });

      loadRegions();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao alterar status:', err);
      toast({
        title: "❌ Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRegion = async (region: TouristRegion) => {
    if (!window.confirm(`Tem certeza que deseja excluir a região "${region.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tourist_regions')
        .delete()
        .eq('id', region.id);

      if (error) throw error;

      toast({
        title: "🗑️ Região excluída",
        description: `A região ${region.name} foi excluída permanentemente.`,
      });

      loadRegions();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao excluir região:', err);
      toast({
        title: "❌ Erro ao excluir",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🏞️ Gestão de Regiões Turísticas</h2>
          <p className="text-gray-600">
            Gerencie as regiões turísticas oficiais de Mato Grosso do Sul
          </p>
        </div>
        <Button onClick={handleCreateRegion} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Região
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingRegion ? 'Editar Região' : 'Nova Região'}
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Região *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Pantanal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">URL do Vídeo</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva a região turística..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visual_art_url">Arte Visual</Label>
                <Input
                  id="visual_art_url"
                  value={formData.visual_art_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, visual_art_url: e.target.value }))}
                  placeholder="URL da imagem"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian_avatar_url">Avatar Guardião</Label>
                <Input
                  id="guardian_avatar_url"
                  value={formData.guardian_avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardian_avatar_url: e.target.value }))}
                  placeholder="URL do avatar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="map_image_url">Imagem do Mapa</Label>
                <Input
                  id="map_image_url"
                  value={formData.map_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, map_image_url: e.target.value }))}
                  placeholder="URL do mapa"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Região ativa no aplicativo</Label>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSaveRegion} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingRegion ? 'Atualizar' : 'Criar'} Região
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Regiões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions.map((region) => (
          <Card key={region.id} className={`${region.is_active ? '' : 'opacity-60'}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {region.name}
                    {region.is_active ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </CardTitle>
                  <Badge 
                    className={region.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                  >
                    {region.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEditRegion(region)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleRegionStatus(region)}>
                    {region.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteRegion(region)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {region.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {region.description}
                </p>
              )}

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-600">
                    {cities[region.id]?.length || 0}
                  </div>
                  <div className="text-gray-600">Cidades</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">0</div>
                  <div className="text-gray-600">Roteiros</div>
                </div>
              </div>

              {/* URLs configuradas */}
              <div className="flex gap-2 flex-wrap">
                {region.visual_art_url && (
                  <Badge variant="outline" className="text-xs">🎨 Arte</Badge>
                )}
                {region.video_url && (
                  <Badge variant="outline" className="text-xs">🎥 Vídeo</Badge>
                )}
                {region.guardian_avatar_url && (
                  <Badge variant="outline" className="text-xs">👤 Guardião</Badge>
                )}
                {region.map_image_url && (
                  <Badge variant="outline" className="text-xs">🗺️ Mapa</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {regions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma região encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando sua primeira região turística.
            </p>
            <Button onClick={handleCreateRegion}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Região
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegionManagement;
