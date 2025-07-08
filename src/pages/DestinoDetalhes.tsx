import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, ArrowLeft, Play, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AdminEditButton from "@/components/admin/AdminEditButton";

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

const DestinoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [details, setDetails] = useState<DestinationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Acesso restrito",
          description: "Faça seu cadastro para acessar os detalhes dos destinos.",
          variant: "destructive",
        });
        navigate("/register");
        return;
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchDestination = async () => {
      if (!id) return;

      try {
        // Buscar informações básicas do destino
        const { data: destinationData, error: destError } = await supabase
          .from('destinations')
          .select('*')
          .eq('id', id)
          .single();

        if (destError) throw destError;

        // Buscar detalhes do destino
        const { data: detailsData, error: detailsError } = await supabase
          .from('destination_details')
          .select('*')
          .eq('destination_id', id)
          .single();

        setDestination(destinationData);
        if (detailsData) {
          setDetails({
            ...detailsData,
            video_type: detailsData.video_type as 'youtube' | 'upload' | null
          });
        }
      } catch (error) {
        console.error('Erro ao carregar destino:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do destino.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id, toast]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando detalhes do destino...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Destino não encontrado</h1>
            <Link to="/destinos" className="text-ms-primary-blue hover:underline">
              Voltar para destinos
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
          style={{ backgroundImage: `url(${destination.image_url})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="ms-container">
              <div className="flex justify-between items-start mb-4">
                <Link 
                  to="/destinos"
                  className="inline-flex items-center text-white hover:text-ms-secondary-yellow transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Voltar para Destinos
                </Link>
                <AdminEditButton editPath={`/destinos/${destination.id}/edit`} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {destination.name}
              </h1>
              <div className="flex items-center text-white/90">
                <MapPin size={20} className="mr-2" />
                <span className="text-lg">{destination.location}, {destination.region}</span>
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
                  <h2 className="text-2xl font-bold text-ms-primary-blue mb-4">Sobre o destino</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {destination.description}
                  </p>
                  {details?.promotional_text && (
                    <div className="bg-ms-pantanal-green/10 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        {details.promotional_text}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vídeo */}
              {details?.video_url && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-4 flex items-center">
                      <Play size={24} className="mr-2" />
                      Vídeo Institucional
                    </h2>
                    <div className="aspect-video">
                      {details.video_type === 'youtube' ? (
                        <iframe
                          src={getYouTubeEmbedUrl(details.video_url)}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                          title="Vídeo do destino"
                        />
                      ) : (
                        <video
                          src={details.video_url}
                          controls
                          className="w-full h-full rounded-lg"
                          title="Vídeo do destino"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Galeria de imagens */}
              {details?.image_gallery && details.image_gallery.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-4">Galeria de Fotos</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {details.image_gallery.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${destination.name} - Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tags de turismo */}
              {details?.tourism_tags && details.tourism_tags.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-ms-primary-blue mb-4 flex items-center">
                      <Tag size={20} className="mr-2" />
                      Tipos de Turismo
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {details.tourism_tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-ms-pantanal-green/20 text-ms-pantanal-green">
                          {tag}
                        </Badge>
                      ))}
                    </div>
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

              {/* Informações extras */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-ms-primary-blue mb-4">Informações</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Região:</strong> {destination.region}</p>
                    <p><strong>Localização:</strong> {destination.location}</p>
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

export default DestinoDetalhes;
