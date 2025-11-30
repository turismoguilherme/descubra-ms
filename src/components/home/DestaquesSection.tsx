import { Link } from "react-router-dom";
import { InteractionTracker } from "@/services/tracking/InteractionTrackerService";
import { MapPin, ArrowRight, Compass } from "lucide-react";

const destinos = [
  {
    id: 1,
    nome: "Bonito",
    imagem: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
    descricao: "Águas cristalinas e ecoturismo de classe mundial",
    regiao: "Sudoeste"
  },
  {
    id: 2,
    nome: "Pantanal",
    imagem: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
    descricao: "A maior planície alagável do mundo e sua biodiversidade única",
    regiao: "Pantanal"
  },
  {
    id: 3,
    nome: "Corumbá",
    imagem: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
    descricao: "A capital do Pantanal, com rica história e cultura",
    regiao: "Pantanal"
  },
  {
    id: 4,
    nome: "Campo Grande",
    imagem: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    descricao: "A capital do estado, com atrativos urbanos e culturais",
    regiao: "Centro"
  }
];

const DestaquesSection = () => {
  const handleDestinationClick = (destino: { id: number; nome: string }) => {
    InteractionTracker.track({
      interaction_type: 'destination_click',
      target_id: destino.id.toString(),
      target_name: destino.nome,
    });
  };

  return (
    <section className="bg-gradient-to-b from-white via-blue-50/50 to-green-50/50 pt-12 pb-20">
      <div className="ms-container">
        {/* Header simples */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-3 rounded-full">
              <Compass size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-ms-primary-blue mb-4">
            Destinos em Destaque
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra os principais destinos turísticos de Mato Grosso do Sul
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinos.map((destino) => (
            <Link 
              key={destino.id} 
              to={`/descubramatogrossodosul/destinos/${destino.id}`} 
              className="group block"
              onClick={() => handleDestinationClick(destino)}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full border border-gray-100">
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={destino.imagem} 
                    alt={destino.nome} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                    {destino.regiao}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-ms-primary-blue mb-2 group-hover:text-ms-discovery-teal transition-colors">
                    {destino.nome}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {destino.descricao}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin size={14} className="text-ms-pantanal-green" />
                      <span className="text-xs font-medium">{destino.regiao}</span>
                    </div>
                    <div className="flex items-center gap-1 text-ms-primary-blue font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Explorar</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Botão Ver Todos */}
        <div className="mt-12 text-center">
          <Link 
            to="/descubramatogrossodosul/destinos" 
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Ver Todos os Destinos
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DestaquesSection;
