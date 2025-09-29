
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { seoOptimizationService } from "@/services/ai/seo/seoOptimizationService"; // Importar o serviço de SEO

interface Event {
  id: string; // Pode ser opcional para novos eventos
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  image_url: string | null;
}

interface EventDetails {
  id: string;
  event_id: string;
  official_name: string | null;
  exact_location: string | null;
  cover_image_url: string | null;
  video_url: string | null;
  detailed_description: string | null;
  schedule_info: string | null;
  event_type: string | null;
  registration_link: string | null;
  extra_info: string | null;
  map_latitude: number | null;
  map_longitude: number | null;
  is_free: boolean;
  visibility_end_date: string | null;
  auto_hide: boolean;
}

interface SeoSuggestions {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
}

const EventEditor = () => {
  const { id } = useParams<{ id: string }>(); // O ID pode ser undefined para novos eventos
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event>({
    id: '',
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: null,
    image_url: null,
  });
  const [details, setDetails] = useState<EventDetails>({
    id: '',
    event_id: '',
    official_name: '',
    exact_location: '',
    cover_image_url: '',
    video_url: null,
    detailed_description: null,
    schedule_info: null,
    event_type: '',
    registration_link: null,
    extra_info: null,
    map_latitude: null,
    map_longitude: null,
    is_free: false,
    visibility_end_date: null,
    auto_hide: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState<SeoSuggestions | null>(null);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) { // Se não há ID, é um novo evento
        setLoading(false);
        return;
      }

      try {
        // Buscar informações básicas do evento
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Buscar detalhes do evento
        const { data: detailsData, error: detailsError } = await supabase
          .from('event_details')
          .select('*')
          .eq('event_id', id)
          .single();

        if (detailsData) {
          setDetails({
            id: detailsData.id,
            event_id: detailsData.event_id,
            official_name: detailsData.official_name || '',
            exact_location: detailsData.exact_location || '',
            cover_image_url: detailsData.cover_image_url || '',
            video_url: detailsData.video_url,
            detailed_description: detailsData.detailed_description,
            schedule_info: detailsData.schedule_info,
            event_type: detailsData.event_type || '',
            registration_link: detailsData.registration_link,
            extra_info: detailsData.extra_info,
            map_latitude: detailsData.map_latitude,
            map_longitude: detailsData.map_longitude,
            is_free: detailsData.is_free || false,
            visibility_end_date: (detailsData as any).visibility_end_date || null,
            auto_hide: (detailsData as any).auto_hide || true
          });
        } else {
          // Se não existem detalhes, criar um registro com valores padrão
          setDetails(prev => ({
            ...prev,
            event_id: id
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do evento.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleSave = async () => {
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

      let currentEventId = id; // Usar o ID da URL se existir

      if (!currentEventId) {
        // Se não há ID na URL, é um novo evento - inserir na tabela 'events' primeiro
        const { data: newEvent, error: newEventError } = await supabase
          .from('events')
          .insert({
            name: event?.name || 'Novo Evento', // Usar um nome padrão se vazio
            description: event?.description || '',
            location: event?.location || '',
            start_date: event?.start_date || new Date().toISOString(),
            end_date: event?.end_date || null,
            image_url: event?.image_url || null,
            created_by: user.id,
            updated_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (newEventError) throw newEventError;
        currentEventId = newEvent.id; // Obter o ID do evento recém-criado
      }

      // Atualizar ou inserir detalhes
      const { error } = await supabase
        .from('event_details')
        .upsert({
          id: details.id || undefined, // Garantir que o ID exista para upsert se for atualização, ou undefined para inserção
          event_id: currentEventId,
          official_name: details.official_name,
          exact_location: details.exact_location,
          cover_image_url: details.cover_image_url,
          video_url: details.video_url,
          detailed_description: details.detailed_description,
          schedule_info: details.schedule_info,
          event_type: details.event_type,
          registration_link: details.registration_link,
          extra_info: details.extra_info,
          map_latitude: details.map_latitude,
          map_longitude: details.map_longitude,
          is_free: details.is_free,
          visibility_end_date: details.visibility_end_date,
          auto_hide: details.auto_hide,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        } as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento salvo com sucesso!",
      });

      navigate(`/admin/event-editor/${currentEventId}`); // Redirecionar para o editor do evento salvo
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

  const handleGenerateSeo = async () => {
    if (!event.name) {
      toast({
        title: "Nome do Evento Necessário",
        description: "Por favor, preencha o nome do evento antes de gerar sugestões de SEO.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingSeo(true);
    setSeoSuggestions(null); // Limpar sugestões anteriores
    try {
      const suggestions = await seoOptimizationService.generateEventSeo(
        event.name,
        event.description || undefined
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

  // if (!event && id) { // Removido, pois event inicializado com valores padrão
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-800 mb-4">Evento não encontrado</h1>
  //         <Button onClick={() => navigate('/eventos')}>Voltar para Eventos</Button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="ms-container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/events-management')} // Ajustado para voltar à lista de gerenciamento
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Gerenciamento
          </Button>
          <h1 className="text-3xl font-bold text-ms-primary-blue">
            {id ? `Editar: ${event.name}` : 'Novo Evento'} {/* Exibir título dinâmico */}
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
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Evento</Label>
              <Input
                id="name"
                value={event.name || ''}
                onChange={(e) => setEvent(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do evento (ex: Festival de Inverno)"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição Curta</Label>
              <Textarea
                id="description"
                value={event.description || ''}
                onChange={(e) => setEvent(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Uma breve descrição do evento..."
              />
            </div>
            <div>
              <Label htmlFor="location">Localização (Cidade/Bairro)</Label>
              <Input
                id="location"
                value={event.location || ''}
                onChange={(e) => setEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Campo Grande, Centro"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Data e Hora de Início</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEvent(prev => ({ 
                  ...prev, 
                  start_date: e.target.value ? new Date(e.target.value).toISOString() : '' 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data e Hora de Término (opcional)</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEvent(prev => ({ 
                  ...prev, 
                  end_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="image_url">URL da Imagem de Lista</Label>
              <Input
                id="image_url"
                value={event.image_url || ''}
                onChange={(e) => setEvent(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="URL da imagem para a lista de eventos"
              />
            </div>
            <div>
              <Label htmlFor="official_name">Nome Oficial</Label>
              <Input
                id="official_name"
                value={details.official_name || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, official_name: e.target.value }))}
                placeholder="Nome oficial do evento"
              />
            </div>
            <div>
              <Label htmlFor="exact_location">Localização Exata</Label>
              <Input
                id="exact_location"
                value={details.exact_location || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, exact_location: e.target.value }))}
                placeholder="Endereço completo do evento"
              />
            </div>
            <div>
              <Label htmlFor="event_type">Tipo de Evento</Label>
              <Select
                value={details.event_type || ''}
                onValueChange={(value) => setDetails(prev => ({ ...prev, event_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="esportivo">Esportivo</SelectItem>
                  <SelectItem value="gastronômico">Gastronômico</SelectItem>
                  <SelectItem value="religioso">Religioso</SelectItem>
                  <SelectItem value="educativo">Educativo</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_free"
                checked={details.is_free}
                onCheckedChange={(checked) => setDetails(prev => ({ ...prev, is_free: !!checked }))}
              />
              <Label htmlFor="is_free">Evento gratuito</Label>
            </div>
            <div>
              <Label htmlFor="visibility_end_date">Data de Remoção da Plataforma</Label>
              <Input
                id="visibility_end_date"
                type="datetime-local"
                value={details.visibility_end_date ? new Date(details.visibility_end_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setDetails(prev => ({ 
                  ...prev, 
                  visibility_end_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                }))}
              />
              <p className="text-sm text-gray-500 mt-1">
                Data em que o evento será automaticamente removido da plataforma (se 'Ocultar automaticamente' estiver marcado)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto_hide"
                checked={details.auto_hide}
                onCheckedChange={(checked) => setDetails(prev => ({ ...prev, auto_hide: !!checked }))}
              />
              <Label htmlFor="auto_hide">Ocultar automaticamente após a data de remoção</Label>
            </div>
          </CardContent>
        </Card>

        {/* Otimização SEO com IA para Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Otimização SEO com IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateSeo} disabled={generatingSeo || !event.name}>
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

        {/* Mídia */}
        <Card>
          <CardHeader>
            <CardTitle>Mídia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cover_image_url">Imagem de Capa (Detalhes)</Label>
              <Input
                id="cover_image_url"
                value={details.cover_image_url || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, cover_image_url: e.target.value }))}
                placeholder="URL da imagem de capa para a página de detalhes"
              />
            </div>
            <div>
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input
                id="video_url"
                value={details.video_url || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, video_url: e.target.value || null }))}
                placeholder="URL do vídeo promocional"
              />
            </div>
          </CardContent>
        </Card>

        {/* Descrição detalhada */}
        <Card>
          <CardHeader>
            <CardTitle>Descrição Detalhada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="detailed_description">Descrição Completa</Label>
              <Textarea
                id="detailed_description"
                value={details.detailed_description || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, detailed_description: e.target.value || null }))}
                rows={6}
                placeholder="Descrição completa e detalhada do evento..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schedule_info">Programação</Label>
              <Textarea
                id="schedule_info"
                value={details.schedule_info || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, schedule_info: e.target.value || null }))}
                rows={3}
                placeholder="Informações sobre horários, atrações e programação diária..."
              />
            </div>
            <div>
              <Label htmlFor="registration_link">Link de Inscrição</Label>
              <Input
                id="registration_link"
                value={details.registration_link || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, registration_link: e.target.value || null }))}
                placeholder="URL para inscrições ou compra de ingressos"
              />
            </div>
            <div>
              <Label htmlFor="extra_info">Informações Extras</Label>
              <Textarea
                id="extra_info"
                value={details.extra_info || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, extra_info: e.target.value || null }))}
                rows={3}
                placeholder="Outras informações relevantes, como contato, requisitos especiais, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Coordenadas do Mapa */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Coordenadas no Mapa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="map_latitude">Latitude</Label>
                <Input
                  id="map_latitude"
                  type="number"
                  step="any"
                  value={details.map_latitude || ''}
                  onChange={(e) => setDetails(prev => ({ ...prev, map_latitude: parseFloat(e.target.value) || null }))}
                  placeholder="Latitude do evento (ex: -20.45)"
                />
              </div>
              <div>
                <Label htmlFor="map_longitude">Longitude</Label>
                <Input
                  id="map_longitude"
                  type="number"
                  step="any"
                  value={details.map_longitude || ''}
                  onChange={(e) => setDetails(prev => ({ ...prev, map_longitude: parseFloat(e.target.value) || null }))}
                  placeholder="Longitude do evento (ex: -54.65)"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventEditor;
