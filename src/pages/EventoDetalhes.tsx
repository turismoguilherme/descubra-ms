import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, ArrowLeft, Play, Calendar, ExternalLink, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AdminEditButton from "@/components/admin/AdminEditButton";

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date?: string;
  image_url: string;
}

interface EventDetails {
  id: string;
  official_name: string;
  exact_location: string;
  cover_image_url: string;
  video_url?: string;
  detailed_description?: string;
  schedule_info?: string;
  map_latitude?: number;
  map_longitude?: number;
  event_type: string;
  registration_link?: string;
  is_free: boolean;
  extra_info?: string;
}

const EventoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [details, setDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Acesso restrito",
          description: "Faça seu cadastro para acessar os detalhes dos eventos.",
          variant: "destructive",
        });
        navigate("/register");
        return;
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        // Buscar informações básicas do evento
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;

        // Buscar detalhes do evento
        const { data: detailsData, error: detailsError } = await supabase
          .from('event_details')
          .select('*')
          .eq('event_id', id)
          .single();

        setEvent(eventData);
        setDetails(detailsData || null);
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do evento.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, toast]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      return `${format(start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`;
    }
    return format(start, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando detalhes do evento...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Evento não encontrado</h1>
            <Link to="/eventos" className="text-ms-primary-blue hover:underline">
              Voltar para eventos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Header com imagem de fundo */}
        <div 
          className="relative h-[50vh] bg-cover bg-center"
          style={{ backgroundImage: `url(${details?.cover_image_url || event.image_url})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="ms-container">
              <div className="flex justify-between items-start mb-4">
                <Link 
                  to="/eventos"
                  className="inline-flex items-center text-white hover:text-ms-secondary-yellow transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Voltar para Eventos
                </Link>
                <AdminEditButton editPath={`/eventos/${event.id}/edit`} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {details?.official_name || event.name}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-white/90">
                <div className="flex items-center">
                  <MapPin size={20} className="mr-2" />
                  <span className="text-lg">{details?.exact_location || event.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={20} className="mr-2" />
                  <span className="text-lg">{formatEventDate(event.start_date, event.end_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ms-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Conteúdo principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Descrição */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-ms-primary-blue mb-4">Sobre o evento</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {event.description}
                  </p>
                  {details?.detailed_description && (
                    <div className="bg-ms-cerrado-orange/10 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        {details.detailed_description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Programação */}
              {details?.schedule_info && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-4">Programação</h2>
                    <div className="whitespace-pre-line text-gray-700">
                      {details.schedule_info}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vídeo */}
              {details?.video_url && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-4 flex items-center">
                      <Play size={24} className="mr-2" />
                      Vídeo do Evento
                    </h2>
                    <div className="aspect-video">
                      <iframe
                        src={getYouTubeEmbedUrl(details.video_url)}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                        title="Vídeo do evento"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informações extras */}
              {details?.extra_info && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-4">Informações Adicionais</h2>
                    <div className="whitespace-pre-line text-gray-700">
                      {details.extra_info}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tipo e entrada */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-ms-primary-blue mb-4">Informações do Evento</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <Badge variant="secondary" className="ml-2 bg-ms-cerrado-orange/20 text-ms-cerrado-orange">
                        {details?.event_type}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Gift size={16} className="mr-2 text-green-600" />
                      <span className={`font-medium ${details?.is_free ? 'text-green-600' : 'text-gray-600'}`}>
                        {details?.is_free ? 'Entrada Gratuita' : 'Evento Pago'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Link de inscrição */}
              {details?.registration_link && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-ms-primary-blue mb-4">Inscrições</h3>
                    <Button asChild className="w-full bg-ms-secondary-yellow text-black hover:bg-ms-secondary-yellow/90">
                      <a href={details.registration_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={16} className="mr-2" />
                        Fazer Inscrição
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Mapa */}
              {details?.map_latitude && details?.map_longitude && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-ms-primary-blue mb-4 flex items-center">
                      <MapPin size={20} className="mr-2" />
                      Localização
                    </h3>
                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-600 text-center">
                        Mapa interativo<br />
                        Lat: {details.map_latitude}<br />
                        Lng: {details.map_longitude}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detalhes da data */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-ms-primary-blue mb-4">Data e Horário</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Data:</strong> {formatEventDate(event.start_date, event.end_date)}</p>
                    <p><strong>Local:</strong> {details?.exact_location || event.location}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventoDetalhes;
