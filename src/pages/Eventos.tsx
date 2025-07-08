
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date?: string;
  image_url: string;
}

const Eventos = () => {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('start_date');

        if (error) throw error;
        setEventos(data || []);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os eventos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [toast]);

  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      return `${format(start, 'dd/MM', { locale: ptBR })} a ${format(end, 'dd/MM', { locale: ptBR })}`;
    }
    return format(start, 'dd/MM/yyyy', { locale: ptBR });
  };

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
              {eventos.map((evento) => (
                <div key={evento.id} className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden shadow-md card-hover">
                  <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                    <img 
                      src={evento.image_url} 
                      alt={evento.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-ms-pantanal-green">{evento.name}</h3>
                      <span className="bg-ms-cerrado-orange/10 text-ms-cerrado-orange px-2 py-1 rounded text-sm font-medium">
                        {formatEventDate(evento.start_date, evento.end_date)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{evento.location}</p>
                    <p className="text-gray-600 mb-4 line-clamp-3">{evento.description}</p>
                    <Link 
                      to={`/eventos/${evento.id}`}
                      className="inline-block bg-ms-secondary-yellow text-black px-4 py-2 rounded hover:bg-ms-secondary-yellow/90 transition-colors"
                    >
                      Saiba Mais
                    </Link>
                  </div>
                </div>
              ))}
              
              {eventos.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">Nenhum evento encontrado.</p>
                </div>
              )}
            </div>
          )}
          
          {eventos.length > 0 && (
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
