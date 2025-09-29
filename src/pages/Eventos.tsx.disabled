
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AutoEventService, AutoEvent } from "@/services/events/autoEventService"; // Ajuste na importação

// A interface Evento foi ajustada para ser a mesma de AutoEvent para compatibilidade
interface Event {
  id: string;
  title: string; // Mudado de 'name' para 'title' para corresponder a AutoEvent
  description: string;
  location: {
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  start_date: string;
  end_date?: string;
  image_url?: string; // Made optional to match AutoEvent
  source: string; // Adicionado para exibir a fonte do evento
  external_url?: string; // Adicionado para permitir o link externo
  is_active?: boolean; // Adicionado para eventos de banco de dados
  is_visible?: boolean; // Adicionado para eventos de banco de dados (de event_details)
  active?: boolean; // Added for AutoEvent compatibility
}

const Eventos = () => {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Efeito para verificar autenticação (mantido como está)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Acesso restrito",
          description: "Faça seu cadastro para descobrir os eventos de Mato Grosso do Sul.",
          variant: "destructive",
        });
        navigate("/register");
        return;
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Novo useEffect para buscar eventos usando AutoEventService
  useEffect(() => {
    const fetchAutoAndManualEvents = async () => {
      setLoading(true);
      try {
        // Buscar eventos automáticos
        const autoEvents = await AutoEventService.getInstance().fetchAutoEvents("Campo Grande"); // Exemplo para Campo Grande, pode ser dinâmico

        // Buscar eventos cadastrados manualmente no Supabase, incluindo is_visible de event_details
        const { data: manualEvents, error: manualError } = await supabase
          .from('events')
          .select(`
            *,
            event_details ( is_visible )
          `)
          .order('start_date');

        if (manualError) throw manualError;

        // Mapear manualEvents para a interface Event, extraindo is_visible
        const mappedManualEvents: Event[] = (manualEvents || []).map(me => ({
          id: me.id,
          title: me.name,
          description: me.description,
          location: { address: me.location, city: "" }, // Ajustar se location for mais complexo
          start_date: me.start_date,
          end_date: me.end_date,
          image_url: me.image_url,
          source: "Manual",
          external_url: null, // Eventos manuais podem não ter URL externa
          is_active: true,
          is_visible: true
        }));

        // Combinar eventos automáticos e manuais
        const combinedEvents = [...autoEvents, ...mappedManualEvents];
        
        // Filtrar eventos ativos e visíveis, e ordenar por data
        const activeAndVisibleEvents = combinedEvents.filter(event => 
          new Date(event.end_date || event.start_date) >= new Date() && // Continua filtrando pela data
          (('is_visible' in event) ? event.is_visible !== false : true) && 
          (('active' in event) ? event.active !== false : true)
        );
        activeAndVisibleEvents.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

        setEventos(activeAndVisibleEvents); // Removido o cast explícito, já é Event[]
      } catch (error) {
        console.error('Erro ao buscar eventos (automáticos e manuais):', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os eventos. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAutoAndManualEvents();
  }, [toast]);

  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      // Apenas mostra o ano se o evento terminar em um ano diferente
      if (start.getFullYear() !== end.getFullYear()) {
        return `${format(start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`;
      }
      return `${format(start, 'dd/MM', { locale: ptBR })} a ${format(end, 'dd/MM', { locale: ptBR })}`;
    }
    return format(start, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Lógica de filtragem de eventos visíveis (Hoje, Esta semana, Este mês) - manter
  const eventosVisiveis = eventos.filter(evento => {
    const startDate = new Date(evento.start_date);
    const endDate = evento.end_date ? new Date(evento.end_date) : startDate; // Usar start_date se end_date não existir
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera hora para comparação

    switch (filtroAtivo) {
      case "Hoje":
        return startDate.toDateString() === today.toDateString();
      case "Esta semana":
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return (startDate >= firstDayOfWeek && startDate <= lastDayOfWeek) || (endDate >= firstDayOfWeek && endDate <= lastDayOfWeek);
      case "Este mês":
        return startDate.getMonth() === today.getMonth() && startDate.getFullYear() === today.getFullYear();
      default: // "Todos" ou outros filtros
        return true;
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-ms-cerrado-orange to-ms-guavira-purple py-16">
          <div className="ms-container text-center">
            <Calendar size={48} className="text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-6">Eventos</h1>
            <p className="text-white/90 text-xl max-w-2xl mx-auto">
              Confira o calendário de eventos culturais, festivais e celebrações de Mato Grosso do Sul
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
              {eventosVisiveis.length > 0 ? ( // Usar eventosVisiveis para renderizar
                eventosVisiveis.map((evento) => (
                  <div key={evento.id} className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden shadow-md card-hover">
                    <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                      <img 
                        src={evento.image_url} 
                        alt={evento.title} // Alterado para title
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-ms-pantanal-green">{evento.title}</h3> {/* Alterado para title */}
                        <span className="bg-ms-cerrado-orange/10 text-ms-cerrado-orange px-2 py-1 rounded text-sm font-medium">
                          {formatEventDate(evento.start_date, evento.end_date)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{evento.location.address}, {evento.location.city}</p> {/* Ajustado para location.address e location.city */}
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
                          to={`/eventos/${evento.id}`}
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
      <Footer />
    </div>
  );
};

export default Eventos;
