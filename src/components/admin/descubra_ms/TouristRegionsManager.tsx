import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MapPin, Plus, Edit, Trash2, Save, X, Loader2, 
  Palette, Image as ImageIcon, List, Star
} from 'lucide-react';

interface TouristRegion {
  id: string;
  name: string;
  slug: string;
  color: string;
  color_hover: string;
  description: string;
  cities: string[];
  highlights: string[];
  image_url: string | null;
  order_index: number;
  is_active: boolean;
}

export default function TouristRegionsManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [regions, setRegions] = useState<TouristRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<TouristRegion | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#FFCA28',
    color_hover: '#FFB300',
    description: '',
    image_url: '',
    order_index: 0,
    is_active: true,
  });

  const [cities, setCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tourist_regions')
        .select('*')
        .order('order_index', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // Converter JSONB arrays para arrays JavaScript
      const processedData = (data || []).map(region => ({
        ...region,
        cities: Array.isArray(region.cities) ? region.cities : [],
        highlights: Array.isArray(region.highlights) ? region.highlights : [],
      }));

      setRegions(processedData);
    } catch (error: any) {
      console.error('Erro ao carregar regiões:', error);
      toast({
        title: 'Erro ao carregar',
        description: error.message || 'Não foi possível carregar as regiões turísticas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRegion(null);
    setFormData({
      name: '',
      slug: '',
      color: '#FFCA28',
      color_hover: '#FFB300',
      description: '',
      image_url: '',
      order_index: regions.length,
      is_active: true,
    });
    setCities([]);
    setHighlights([]);
    setNewCity('');
    setNewHighlight('');
    setDialogOpen(true);
  };

  const handleEdit = (region: TouristRegion) => {
    setEditingRegion(region);
    setFormData({
      name: region.name,
      slug: region.slug,
      color: region.color,
      color_hover: region.color_hover || region.color,
      description: region.description,
      image_url: region.image_url || '',
      order_index: region.order_index || 0,
      is_active: region.is_active ?? true,
    });
    setCities([...region.cities]);
    setHighlights([...region.highlights]);
    setNewCity('');
    setNewHighlight('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e slug são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        color: formData.color,
        color_hover: formData.color_hover || formData.color,
        description: formData.description.trim(),
        cities: cities,
        highlights: highlights,
        image_url: formData.image_url.trim() || null,
        order_index: formData.order_index,
        is_active: formData.is_active,
        updated_by: user.id,
      };

      if (editingRegion) {
        // Atualizar
        const { error } = await supabase
          .from('tourist_regions')
          .update(payload)
          .eq('id', editingRegion.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Região atualizada com sucesso!',
        });
      } else {
        // Criar
        const { error } = await supabase
          .from('tourist_regions')
          .insert(payload);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Região criada com sucesso!',
        });
      }

      // Disparar evento para atualizar componentes que usam o hook
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('touristRegionsUpdated'));
      }

      setDialogOpen(false);
      loadRegions();
    } catch (error: any) {
      console.error('Erro ao salvar região:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar a região',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (region: TouristRegion) => {
    if (!confirm(`Tem certeza que deseja excluir a região "${region.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tourist_regions')
        .delete()
        .eq('id', region.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Região excluída com sucesso!',
      });

      // Disparar evento para atualizar componentes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('touristRegionsUpdated'));
      }

      loadRegions();
    } catch (error: any) {
      console.error('Erro ao excluir região:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir a região',
        variant: 'destructive',
      });
    }
  };

  const addCity = () => {
    if (newCity.trim() && !cities.includes(newCity.trim())) {
      setCities([...cities, newCity.trim()]);
      setNewCity('');
    }
  };

  const removeCity = (index: number) => {
    setCities(cities.filter((_, i) => i !== index));
  };

  const addHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  // Gerar slug automaticamente a partir do nome
  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!editingRegion) {
      // Gerar slug automaticamente apenas ao criar
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, name, slug }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Regiões Turísticas</h2>
          <p className="text-muted-foreground">
            Gerencie as 9 regiões turísticas de Mato Grosso do Sul
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Região
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((region) => (
          <Card key={region.id} className={!region.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: region.color }}
                    />
                    {region.name}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {region.description}
                  </CardDescription>
                </div>
                <Badge variant={region.is_active ? 'default' : 'secondary'}>
                  {region.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="text-sm text-muted-foreground">
                  <strong>{region.cities.length}</strong> cidades
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>{region.highlights.length}</strong> destaques
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(region)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(region)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição/Criação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRegion ? 'Editar Região' : 'Nova Região'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Pantanal"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ex: pantanal"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da região..."
                rows={3}
              />
            </div>

            {/* Cores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cor Principal *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#FFCA28"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="color_hover" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cor Hover
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="color_hover"
                    type="color"
                    value={formData.color_hover}
                    onChange={(e) => setFormData({ ...formData, color_hover: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color_hover}
                    onChange={(e) => setFormData({ ...formData, color_hover: e.target.value })}
                    placeholder="#FFB300"
                  />
                </div>
              </div>
            </div>

            {/* Imagem */}
            <div>
              <Label htmlFor="image_url" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                URL da Imagem
              </Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {/* Cidades */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Cidades
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                  placeholder="Nome da cidade"
                />
                <Button type="button" onClick={addCity} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cities.map((city, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {city}
                    <button
                      onClick={() => removeCity(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Destaques */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4" />
                Destaques
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  placeholder="Ex: Flutuação, Pesca esportiva..."
                />
                <Button type="button" onClick={addHighlight} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {highlights.map((highlight, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {highlight}
                    <button
                      onClick={() => removeHighlight(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ordem e Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_index">Ordem de Exibição</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Região Ativa</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



