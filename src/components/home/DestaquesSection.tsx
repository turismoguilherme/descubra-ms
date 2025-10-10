
import { Link } from "react-router-dom";
import { InteractionTracker } from "@/services/tracking/InteractionTrackerService";

const destinos = [
  {
    id: 1,
    nome: "Bonito",
    imagem: "https://source.unsplash.com/photo-1433086966358-54859d0ed716",
    descricao: "Águas cristalinas e ecoturismo de classe mundial"
  },
  {
    id: 2,
    nome: "Pantanal",
    imagem: "https://source.unsplash.com/photo-1472396961693-142e6e269027",
    descricao: "A maior planície alagável do mundo e sua biodiversidade única"
  },
  {
    id: 3,
    nome: "Corumbá",
    imagem: "https://source.unsplash.com/photo-1482938289607-e9573fc25ebb",
    descricao: "A capital do Pantanal, com rica história e cultura"
  },
  {
    id: 4,
    nome: "Campo Grande",
    imagem: "https://source.unsplash.com/photo-1518495973542-4542c06a5843",
    descricao: "A capital do estado, com atrativos urbanos e culturais"
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
    <section className="py-20 bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-pantanal-green/5">
      <div className="ms-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ms-primary-blue mb-4">
            Destinos em Destaque
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra os principais destinos turísticos de Mato Grosso do Sul
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinos.map((destino) => (
            <Link 
              key={destino.id} 
              to={`/destinos/${destino.id}`} 
              className="group block"
              onClick={() => handleDestinationClick(destino)}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full border border-gray-100">
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={destino.imagem} 
                    alt={destino.nome} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Destaque
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-ms-primary-blue mb-3 group-hover:text-ms-discovery-teal transition-colors">
                    {destino.nome}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {destino.descricao}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link 
            to="/ms/destinos" 
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Ver Todos os Destinos
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DestaquesSection;
