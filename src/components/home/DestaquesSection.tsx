
import { Link } from "react-router-dom";

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
  return (
    <section className="py-16 bg-white">
      <div className="ms-container">
        <h2 className="section-title">Destinos em Destaque</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinos.map((destino) => (
            <Link key={destino.id} to={`/destinos/${destino.id}`} className="card-hover">
              <div className="bg-white rounded-lg overflow-hidden shadow-md h-full">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={destino.imagem} 
                    alt={destino.nome} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-ms-pantanal-green mb-2">{destino.nome}</h3>
                  <p className="text-gray-600">{destino.descricao}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link 
            to="/destinos" 
            className="btn-primary inline-block"
          >
            Ver Todos os Destinos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DestaquesSection;
