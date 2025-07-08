
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Star } from "lucide-react";

// Temporary mock data - in a real implementation this would come from Supabase
const mockRoteiros = [
  {
    id: 1,
    title: "Bonito: Natureza em Estado Puro",
    description: "Um roteiro de 3 dias com as principais atrações naturais de Bonito.",
    image: "https://source.unsplash.com/photo-1589491106922-a8e488615f01",
    days: 3,
    category: "Natureza",
    rating: 4.9,
    location: "Bonito, MS"
  },
  {
    id: 2,
    title: "Pantanal Sul: Safári Brasileiro",
    description: "Explore a maior planície alagada do mundo e observe a fauna local.",
    image: "https://source.unsplash.com/photo-1513635269975-59663e0ac1ad",
    days: 4,
    category: "Ecoturismo",
    rating: 4.8,
    location: "Miranda, MS"
  },
  {
    id: 3,
    title: "Campo Grande Cultural",
    description: "Conheça a capital de MS através de sua história e cultura.",
    image: "https://source.unsplash.com/photo-1544989164-31dc3c645987",
    days: 2,
    category: "Cultura",
    rating: 4.5,
    location: "Campo Grande, MS"
  }
];

const Roteiros = () => {
  const navigate = useNavigate();
  const [roteiros, setRoteiros] = useState(mockRoteiros);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from the database
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-ms-primary-blue text-white py-10">
          <div className="ms-container">
            <h1 className="text-3xl font-semibold mb-4">Roteiros recomendados</h1>
            <p className="text-xl max-w-2xl">
              Com base no seu perfil, selecionamos os melhores roteiros para você aproveitar sua experiência em Mato Grosso do Sul.
            </p>
          </div>
        </div>

        <div className="ms-container py-10">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ms-primary-blue"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roteiros.map((roteiro) => (
                <div 
                  key={roteiro.id} 
                  className="bg-white rounded-lg shadow-lg overflow-hidden card-hover border border-gray-200"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={roteiro.image} 
                      alt={roteiro.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-ms-secondary-yellow text-black text-sm px-3 py-1 rounded-full">
                        {roteiro.category}
                      </span>
                      <div className="flex items-center text-ms-secondary-yellow">
                        <Star className="fill-ms-secondary-yellow text-ms-secondary-yellow" size={18} />
                        <span className="ml-1 text-gray-700">{roteiro.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-ms-primary-blue">{roteiro.title}</h3>
                    
                    <p className="text-gray-600 mb-4">{roteiro.description}</p>
                    
                    <div className="flex items-center text-gray-500 mb-4">
                      <MapPin size={18} className="mr-1" />
                      <span className="text-sm">{roteiro.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500 mb-6">
                      <Clock size={18} className="mr-1" />
                      <span className="text-sm">{roteiro.days} dias</span>
                    </div>
                    
                    <Button className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90">
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Button 
              variant="outline" 
              className="border-ms-primary-blue text-ms-primary-blue hover:bg-ms-primary-blue/10"
              onClick={() => navigate("/passaporte")}
            >
              <Calendar className="mr-2" size={18} />
              Acessar meu passaporte digital
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Roteiros;
