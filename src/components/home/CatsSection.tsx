
import { MapPin, Clock, Info } from "lucide-react";

const cats = [
  {
    id: 1,
    nome: "CAT Campo Grande",
    endereco: "Av. Afonso Pena, 7000",
    horario: "Segunda a Sexta: 8h às 18h",
    coordenadas: { lat: -20.4697, lng: -54.6201 },
    cidade: "Campo Grande",
    regiao: "Campo Grande",
    atendentes: ["Ana Souza", "Paulo Rodriguez"]
  },
  {
    id: 2,
    nome: "CAT Bonito",
    endereco: "Rua Cel. Pilad Rebuá, 1780",
    horario: "Segunda a Domingo: 8h às 18h",
    coordenadas: { lat: -21.1261, lng: -56.4514 },
    cidade: "Bonito",
    regiao: "Bonito",
    atendentes: ["Pedro Alves", "Juliana Freitas"]
  },
  {
    id: 3,
    nome: "CAT Corumbá",
    endereco: "Rua Delamare, 1546",
    horario: "Segunda a Sexta: 8h às 18h",
    coordenadas: { lat: -19.0078, lng: -57.6506 },
    cidade: "Corumbá",
    regiao: "Pantanal",
    atendentes: ["Carla Lima"]
  },
  {
    id: 4,
    nome: "CAT Dourados",
    endereco: "Av. Weimar Gonçalves Torres, 825",
    horario: "Segunda a Sexta: 8h às 18h",
    coordenadas: { lat: -22.2210, lng: -54.8011 },
    cidade: "Dourados",
    regiao: "Dourados",
    atendentes: []
  }
];

const CatsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="ms-container">
        <h2 className="section-title mb-2">Centros de Atendimento ao Turista</h2>
        <p className="text-gray-600 max-w-2xl mb-8">
          Os CATs são pontos de apoio onde você encontra informações e orientações para
          aproveitar ao máximo sua experiência em Mato Grosso do Sul.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cats.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-gray-50 rounded-lg p-6 shadow-md border-t-4 border-ms-primary-blue transition-all duration-300 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-ms-primary-blue mb-3">{cat.nome}</h3>
              <div className="flex items-start space-x-2 mb-2">
                <MapPin size={18} className="text-ms-cerrado-orange mt-1 flex-shrink-0" />
                <p className="text-gray-800">{cat.endereco}</p>
              </div>
              <div className="flex items-start space-x-2 mb-2">
                <Clock size={18} className="text-ms-cerrado-orange mt-1 flex-shrink-0" />
                <p className="text-gray-800">{cat.horario}</p>
              </div>
              <div className="flex items-start space-x-2 mt-4">
                <Info size={18} className="text-ms-primary-blue mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-800 font-medium">Região: {cat.regiao}</p>
                  {cat.atendentes && cat.atendentes.length > 0 && (
                    <p className="text-gray-700 text-sm mt-1">
                      Atendentes: {cat.atendentes.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CatsSection;
