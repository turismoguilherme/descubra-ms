
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { seoOptimizationService } from "@/services/ai/seo/seoOptimizationService"; // Importar o serviço de SEO

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  region: string;
  image_url: string;
}

interface DestinationDetails {
  id: string;
  promotional_text: string;
  video_url: string;
  video_type: 'youtube' | 'upload' | null;
  map_latitude: number;
  map_longitude: number;
  tourism_tags: string[];
  image_gallery: string[];
}

interface SeoSuggestions {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
}

const DestinationEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [details, setDetails] = useState<DestinationDetails>({
    id: '',
    promotional_text: '',
    video_url: '',
    video_type: null,
    map_latitude: 0,
    map_longitude: 0,
    tourism_tags: [],
    image_gallery: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');
  const [seoSuggestions, setSeoSuggestions] = useState<SeoSuggestions | null>(null);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Buscar informações básicas do destino
        const { data: destinationData, error: destError } = await supabase
          .from('destinations')
          .select('*')
          .eq('id', id)
          .single();

        if (destError) throw destError;
        setDestination(destinationData);

        // Buscar detalhes do destino
        const { data: detailsData, error: detailsError } = await supabase
          .from('destination_details')
          .select('*')
          .eq('destination_id', id)
          .single();

        if (detailsData) {
          // Converter o video_type corretamente
          const videoType = detailsData.video_type === 'youtube' || detailsData.video_type === 'upload' 
            ? detailsData.video_type 
            : null;

          setDetails({
            id: detailsData.id,
            promotional_text: detailsData.promotional_text || '',
            video_url: detailsData.video_url || '',
            video_type: videoType,
            map_latitude: detailsData.map_latitude || 0,
            map_longitude: detailsData.map_longitude || 0,
            tourism_tags: detailsData.tourism_tags || [],
            image_gallery: detailsData.image_gallery || []
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do destino.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleSave = async () => {
    if (!destination || !id) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para editar.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar ou inserir detalhes
      const { error } = await supabase
        .from('destination_details')
        .upsert({
          destination_id: id,
          promotional_text: details.promotional_text,
          video_url: details.video_url,
          video_type: details.video_type,
          map_latitude: details.map_latitude,
          map_longitude: details.map_longitude,
          tourism_tags: details.tourism_tags,
          image_gallery: details.image_gallery,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Destino atualizado com sucesso!",
      });

      navigate(`/destinos/${id}`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !details.tourism_tags.includes(newTag.trim())) {
      setDetails(prev => ({
        ...prev,
        tourism_tags: [...prev.tourism_tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setDetails(prev => ({
      ...prev,
      tourism_tags: prev.tourism_tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addImage = () => {
    if (newImage.trim() && !details.image_gallery.includes(newImage.trim())) {
      setDetails(prev => ({
        ...prev,
        image_gallery: [...prev.image_gallery, newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const removeImage = (imageToRemove: string) => {
    setDetails(prev => ({
      ...prev,
      image_gallery: prev.image_gallery.filter(img => img !== imageToRemove)
    }));
  };

  const handleDeletePhoto = (imageToRemove: string) => {
    setDetails(prev => ({
      ...prev,
      image_gallery: prev.image_gallery.filter(img => img !== imageToRemove)
    }));
  };

  const handleGenerateSeo = async () => {
    if (!destination || !destination.name) {
      toast({
        title: "Nome do Destino Necessário",
        description: "Por favor, preencha o nome do destino antes de gerar sugestões de SEO.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingSeo(true);
    setSeoSuggestions(null); // Limpar sugestões anteriores
    try {
      const suggestions = await seoOptimizationService.generateDestinationSeo(
        destination.name,
        destination.description || undefined
      );
      setSeoSuggestions(suggestions);
      toast({
        title: "Sugestões de SEO Geradas!",
        description: "As sugestões de SEO foram geradas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar SEO:", error);
      toast({
        title: "Erro de IA",
        description: "Não foi possível gerar sugestões de SEO. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setGeneratingSeo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Destino não encontrado</h1>
          <Button onClick={() => navigate('/destinos')}>Voltar para Destinos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="ms-container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/destinos/${id}`)}
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-ms-primary-blue">
            Editar: {destination.name}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} className="mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Texto Promocional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="promotional_text">Texto Promocional</Label>
              <Textarea
                id="promotional_text"
                value={details.promotional_text}
                onChange={(e) => setDetails(prev => ({ ...prev, promotional_text: e.target.value }))}
                rows={6}
                placeholder="Descreva os pontos destacados do destino..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Otimização SEO com IA para Destinos */}
        <Card>
          <CardHeader>
            <CardTitle>Otimização SEO com IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateSeo} disabled={generatingSeo || !destination || !destination.name}>
              {generatingSeo ? "Gerando..." : "Gerar Sugestões de SEO"}
            </Button>
            {seoSuggestions && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Título SEO (Meta Title)</Label>
                  <Input value={seoSuggestions.seoTitle} readOnly />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigator.clipboard.writeText(seoSuggestions.seoTitle)}>
                    Copiar
                  </Button>
                </div>
                <div>
                  <Label>Meta Descrição (Meta Description)</Label>
                  <Textarea value={seoSuggestions.metaDescription} readOnly rows={3} />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigator.clipboard.writeText(seoSuggestions.metaDescription)}>
                    Copiar
                  </Button>
                </div>
                <div>
                  <Label>Palavras-chave (Keywords)</Label>
                  <Input value={seoSuggestions.keywords.join(', ')} readOnly />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigator.clipboard.writeText(seoSuggestions.keywords.join(', '))}>
                    Copiar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vídeo */}
        <Card>
          <CardHeader>
            <CardTitle>Vídeo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video_type">Tipo de Vídeo</Label>
              <Select
                value={details.video_type || 'none'}
                onValueChange={(value) => setDetails(prev => ({ 
                  ...prev, 
                  video_type: value === 'none' ? null : value as 'youtube' | 'upload'
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="upload">Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {details.video_type && (
              <div>
                <Label htmlFor="video_url">URL do Vídeo</Label>
                <Input
                  id="video_url"
                  value={details.video_url}
                  onChange={(e) => setDetails(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder={details.video_type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'URL do arquivo de vídeo'}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle>Localização no Mapa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={details.map_latitude}
                  onChange={(e) => setDetails(prev => ({ ...prev, map_latitude: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={details.map_longitude}
                  onChange={(e) => setDetails(prev => ({ ...prev, map_longitude: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags de Turismo */}
        <Card>
          <CardHeader>
            <CardTitle>Tags de Turismo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar nova tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm">
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {details.tourism_tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Galeria de Imagens */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Galeria de Imagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="URL da imagem..."
                onKeyPress={(e) => e.key === 'Enter' && addImage()}
              />
              <Button onClick={addImage} size="sm">
                <Plus size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {details.image_gallery.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Galeria ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(image)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DestinationEditor;
