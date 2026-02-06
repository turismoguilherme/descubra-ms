import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Star, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { optimizeEventCardImage } from "@/utils/imageOptimization";

interface EventItem {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  location: string;
  image_url?: string;
  logo_evento?: string;
  is_sponsored: boolean;
  sponsor_payment_status?: string;
}

const EventosDestaqueSection = () => {
  const { t } = useTranslation('pages');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Buscar eventos aprovados e visíveis, apenas futuros
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_visible', true)
        .eq('approval_status', 'approved')
        .gte('start_date', today)
        .order('start_date', { ascending: true })
        .limit(20); // Buscar mais para poder filtrar melhor

      if (error) {
        console.error("Erro na query de eventos:", error);
        throw error;
      }

      console.log("Eventos encontrados:", data?.length || 0);

      const eventsList: EventItem[] = (data || []).map((event: {
        id: string;
        name?: string | null;
        description?: string | null;
        start_date: string;
        end_date?: string | null;
        start_time?: string | null;
        location?: string | null;
        image_url?: string | null;
        logo_evento?: string | null;
        is_sponsored?: boolean | null;
        sponsor_payment_status?: string | null;
      }) => ({
        id: event.id,
        name: event.name || '',
        description: event.description || '',
        start_date: event.start_date,
        end_date: event.end_date || undefined,
        start_time: event.start_time || undefined,
        location: event.location || '',
        image_url: event.image_url || undefined,
        logo_evento: event.logo_evento || undefined,
        is_sponsored: event.is_sponsored && (event.sponsor_payment_status === 'paid' || !event.sponsor_payment_status),
        sponsor_payment_status: event.sponsor_payment_status || undefined,
      }));

      // Ordenar: patrocinados primeiro, depois por data
      eventsList.sort((a, b) => {
        if (a.is_sponsored && !b.is_sponsored) return -1;
        if (!a.is_sponsored && b.is_sponsored) return 1;
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });

      console.log("Eventos processados:", eventsList.length);

      // Pegar apenas os 3 primeiros para layout mais visual
      setEvents(eventsList.slice(0, 3));
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      }).replace('.', '');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
        <div className="ms-container">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ms-cerrado-orange" />
          </div>
        </div>
      </section>
    );
  }

  // Mostrar seção mesmo sem eventos para debug (remover depois)
  // if (events.length === 0) {
  //   return null; // Não mostrar seção se não houver eventos
  // }

  return (
    <section className="py-24 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
      <div className="ms-container">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-ms-cerrado-orange to-ms-secondary-yellow p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Calendar size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-5">
            {t('home.events.title', { defaultValue: 'Próximos Eventos' })}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('home.events.description', { defaultValue: 'Confira os principais eventos e festivais que acontecem em Mato Grosso do Sul' })}
          </p>
        </div>

        {/* Grid de Eventos - Layout visual melhorado (3 eventos em destaque) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <Link
              key={event.id}
              to={`/descubrams/eventos?evento=${event.id}`}
              className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 h-full border border-gray-100 hover:border-ms-cerrado-orange/30">
                {/* Badge Patrocinado */}
                {event.is_sponsored && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Star size={14} className="fill-white" />
                    Destaque
                  </div>
                )}

                {/* Imagem - Maior para melhor visualização */}
                <div className="h-72 overflow-hidden relative">
                  {(() => {
                    const imageUrl = event.logo_evento || event.image_url;
                    
                    const optimizedUrl = imageUrl ? optimizeEventCardImage(imageUrl) : '';
                    const finalUrl = optimizedUrl || imageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800";

                    return (
                      <img
                        src={finalUrl}
                        alt={event.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onLoad={(e) => {
                          
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          
                          if (target.src !== "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800") {
                            target.src = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800";
                          }
                        }}
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-ms-primary-blue mb-3 group-hover:text-ms-cerrado-orange transition-colors duration-300 line-clamp-2">
                    {event.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Informações */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={16} className="text-ms-cerrado-orange flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {formatDate(event.start_date)}
                        {event.end_date && event.end_date !== event.start_date && (
                          <> - {formatDate(event.end_date)}</>
                        )}
                      </span>
                    </div>
                    
                    {event.start_time && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={16} className="text-ms-cerrado-orange flex-shrink-0" />
                        <span className="text-sm">{formatTime(event.start_time)}</span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} className="text-ms-cerrado-orange flex-shrink-0" />
                        <span className="text-sm line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Link */}
                  <div className="flex items-center gap-2 text-ms-cerrado-orange font-semibold text-sm group-hover:gap-3 transition-all duration-300 pt-4 border-t border-gray-100">
                    <span>{t('home.events.seeMore', { defaultValue: 'Ver detalhes' })}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Botão Ver Todos */}
        <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link
            to="/descubrams/eventos"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-ms-cerrado-orange to-ms-secondary-yellow text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
          >
            {t('home.events.viewAll', { defaultValue: 'Ver Todos os Eventos' })}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EventosDestaqueSection;

