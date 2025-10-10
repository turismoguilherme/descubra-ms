import UniversalLayout from "@/components/layout/UniversalLayout";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interface para eventos
interface Event {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  start_date: string;
  end_date?: string;
  image_url?: string;
  source: string;
  external_url?: string;
  is_active?: boolean;
  is_visible?: boolean;
  active?: boolean;
}

const EventosMS = () => {
  console.log("📅 EVENTOS: Componente EventosMS sendo renderizado");
  
  const [eventos, setEventos] = useState<Event[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  console.log("📅 EVENTOS: Estado - loading:", loading, "eventos.length:", eventos.length);

  // Efeito para verificar autenticação (removido - eventos são públicos)
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const { data: { session } } = await supabase.auth.getSession();
  //     if (!session) {
  //       toast({
  //         title: "Acesso restrito",
  //         description: "Faça seu cadastro para descobrir os eventos do Descubra Mato Grosso do Sul.",
  //         variant: "destructive",
  //       });
  //       navigate("/ms/register");
  //       return;
  //     }
  //   };

  //   checkAuth();
  // }, [navigate, toast]);

  // Buscar eventos do Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data: manualEvents, error: manualError } = await supabase
          .from('events')
          .select(`
            *,
            event_details ( is_visible )
          `)
          .order('start_date');

        if (manualError) throw manualError;

        // Mapear eventos para a interface Event
        const mappedEvents: Event[] = (manualEvents || []).map(me => ({
          id: me.id,
          title: me.name,
          description: me.description,
          location: { address: me.location, city: "" },
          start_date: me.start_date,
          end_date: me.end_date,
          image_url: me.image_url,
          source: "Manual",
          external_url: null,
          is_active: true,
          is_visible: true
        }));

        // Filtrar eventos ativos e visíveis, e ordenar por data
        const activeAndVisibleEvents = mappedEvents.filter(event => 
          new Date(event.end_date || event.start_date) >= new Date() &&
          (('is_visible' in event) ? event.is_visible !== false : true) &&
          (('active' in event) ? event.active !== false : true)
        );
        activeAndVisibleEvents.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

        // Se não há eventos do Supabase, usar dados mock
        if (activeAndVisibleEvents.length === 0) {
          console.log("📅 EVENTOS: Nenhum evento encontrado no Supabase, usando dados mock");
          const mockEvents: Event[] = [
            {
              id: '1',
              title: 'Festival de Inverno de Bonito',
              description: 'Celebre a temporada de inverno com música, gastronomia e aventuras em Bonito',
              location: { address: 'Centro de Bonito', city: 'Bonito' },
              start_date: '2024-07-15',
              end_date: '2024-07-20',
              image_url: '/images/festival-bonito.jpg',
              source: 'Mock',
              external_url: null,
              is_active: true,
              is_visible: true
            },
            {
              id: '2',
              title: 'Pantanal em Foco',
              description: 'Exposição fotográfica sobre a biodiversidade do Pantanal',
              location: { address: 'Museu da Imagem e do Som', city: 'Campo Grande' },
              start_date: '2024-08-01',
              end_date: '2024-08-31',
              image_url: '/images/pantanal-expo.jpg',
              source: 'Mock',
              external_url: null,
              is_active: true,
              is_visible: true
            },
            {
              id: '3',
              title: 'Rota Gastronômica MS',
              description: 'Descubra os sabores únicos de Mato Grosso do Sul',
              location: { address: 'Vários restaurantes', city: 'Campo Grande' },
              start_date: '2024-09-10',
              end_date: '2024-09-15',
              image_url: '/images/rota-gastronomica.jpg',
              source: 'Mock',
              external_url: null,
              is_active: true,
              is_visible: true
            }
          ];
          setEventos(mockEvents);
        } else {
          setEventos(activeAndVisibleEvents);
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        console.log("📅 EVENTOS: Erro no Supabase, usando dados mock");
        
        // Em caso de erro, usar dados mock
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Festival de Inverno de Bonito',
            description: 'Celebre a temporada de inverno com música, gastronomia e aventuras em Bonito',
            location: { address: 'Centro de Bonito', city: 'Bonito' },
            start_date: '2024-07-15',
            end_date: '2024-07-20',
            image_url: '/images/festival-bonito.jpg',
            source: 'Mock',
            external_url: null,
            is_active: true,
            is_visible: true
          }
        ];
        setEventos(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (start.getFullYear() !== end.getFullYear()) {
        return `${format(start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`;
      }
      return `${format(start, 'dd/MM', { locale: ptBR })} a ${format(end, 'dd/MM', { locale: ptBR })}`;
    }
    return format(start, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Lógica de filtragem de eventos visíveis
  const eventosVisiveis = eventos.filter(evento => {
    const startDate = new Date(evento.start_date);
    const endDate = evento.end_date ? new Date(evento.end_date) : startDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filtroAtivo) {
      case "Hoje":
        return startDate.toDateString() === today.toDateString();
      case "Esta semana":
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return (startDate >= firstDayOfWeek && startDate <= lastDayOfWeek) || (endDate >= firstDayOfWeek && endDate <= lastDayOfWeek);
      case "Este mês":
        return startDate.getMonth() === today.getMonth() && startDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  });

  return (
    <UniversalLayout>
      <main className="flex-grow">
          <div className="bg-gradient-to-r from-ms-cerrado-orange to-ms-guavira-purple py-16">
            <div className="ms-container text-center">
              <Calendar size={48} className="text-white mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-6">Eventos</h1>
              <p className="text-white/90 text-xl max-w-2xl mx-auto">
                Confira o calendário de eventos culturais, festivais e celebrações do Descubra Mato Grosso do Sul
              </p>
            </div>
          </div>

          <div className="ms-container py-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="section-title">Próximos Eventos</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFiltroAtivo("Hoje")}
                  className={`px-3 py-1 border rounded ${
                    filtroAtivo === "Hoje" 
                      ? "border-ms-pantanal-green bg-ms-pantanal-green text-white" 
                      : "border-ms-pantanal-green text-ms-pantanal-green hover:bg-ms-pantanal-green/10"
                  }`}
                >
                  Hoje
                </button>
                <button 
                  onClick={() => setFiltroAtivo("Esta semana")}
                  className={`px-3 py-1 border rounded ${
                    filtroAtivo === "Esta semana" 
                      ? "border-ms-pantanal-green bg-ms-pantanal-green text-white" 
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Esta semana
                </button>
                <button 
                  onClick={() => setFiltroAtivo("Este mês")}
                  className={`px-3 py-1 border rounded ${
                    filtroAtivo === "Este mês" 
                      ? "border-ms-pantanal-green bg-ms-pantanal-green text-white" 
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Este mês
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {eventosVisiveis.length > 0 ? (
                  eventosVisiveis.map((evento) => (
                    <div key={evento.id} className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden shadow-md card-hover">
                      <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                        <img 
                          src={evento.image_url} 
                          alt={evento.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-ms-pantanal-green">{evento.title}</h3>
                          <span className="bg-ms-cerrado-orange/10 text-ms-cerrado-orange px-2 py-1 rounded text-sm font-medium">
                            {formatEventDate(evento.start_date, evento.end_date)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{evento.location.address}, {evento.location.city}</p>
                        <p className="text-gray-600 mb-4 line-clamp-3">{evento.description}</p>
                        {evento.external_url ? (
                          <a 
                            href={evento.external_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-ms-secondary-yellow text-black px-4 py-2 rounded hover:bg-ms-secondary-yellow/90 transition-colors"
                          >
                            Saiba Mais
                          </a>
                        ) : (
                          <Link 
                            to={`/ms/eventos/${evento.id}`}
                            className="inline-block bg-ms-secondary-yellow text-black px-4 py-2 rounded hover:bg-ms-secondary-yellow/90 transition-colors"
                          >
                            Saiba Mais
                          </Link>
                        )}
                        {evento.source && (
                          <span className="ml-2 text-xs text-gray-500">Fonte: {evento.source}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600 text-lg">Nenhum evento encontrado.</p>
                  </div>
                )}
              </div>
            )}
            
            {eventosVisiveis.length > 0 && (
              <div className="mt-12 text-center">
                <button className="btn-primary">Ver Todos os Eventos</button>
              </div>
            )}
          </div>
        </main>
    </UniversalLayout>
  );
};

export default EventosMS;