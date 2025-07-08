
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const categorias = [
  "Todos", "Ecoturismo", "Turismo Cultural", "Gastronomia", "Aventura"
];

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  region: string;
  image_url: string;
}

const Destinos = () => {
  const [destinos, setDestinos] = useState<Destination[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Acesso restrito",
          description: "Faça seu cadastro para explorar os destinos de Mato Grosso do Sul.",
          variant: "destructive",
        });
        navigate("/register");
        return;
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchDestinos = async () => {
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name');

        if (error) throw error;
        setDestinos(data || []);
      } catch (error) {
        console.error('Erro ao buscar destinos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os destinos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDestinos();
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-pantanal-blue py-16">
          <div className="ms-container text-center">
            <Compass size={48} className="text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-6">Destinos</h1>
            <p className="text-white/90 text-xl max-w-2xl mx-auto">
              Explore os mais belos e diversos destinos de Mato Grosso do Sul
            </p>
          </div>
        </div>

        <div className="ms-container py-12">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categorias.map((cat, index) => (
              <button
                key={index}
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-4 py-2 rounded-full ${
                  categoriaAtiva === cat 
                    ? "bg-ms-pantanal-green text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-ms-pantanal-green/20"
                } transition-colors`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinos.map((destino) => (
                <Link 
                  key={destino.id} 
                  to={`/destinos/${destino.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md card-hover block"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img 
                      src={destino.image_url} 
                      alt={destino.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <span className="absolute top-4 right-4 bg-white/90 text-ms-pantanal-green px-2 py-1 rounded-md text-sm font-medium">
                      {destino.region}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-ms-pantanal-green mb-2">{destino.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{destino.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{destino.location}</span>
                      <span className="text-ms-primary-blue font-medium hover:underline">
                        Saiba Mais →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              
              {destinos.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">Nenhum destino encontrado.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Destinos;
