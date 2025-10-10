
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
    <section className="py-20 bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-pantanal-green/5">
      <div className="ms-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ms-primary-blue mb-4">
            Centros de Atendimento ao Turista
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Os CATs são pontos de apoio onde você encontra informações e orientações para
            aproveitar ao máximo sua experiência em Mato Grosso do Sul.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cats.map((cat) => (
            <div 
              key={cat.id} 
              className="group bg-white rounded-2xl p-8 shadow-lg border-t-4 border-ms-primary-blue transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MapPin size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-ms-primary-blue group-hover:text-ms-discovery-teal transition-colors">
                  {cat.nome}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin size={20} className="text-ms-cerrado-orange mt-1 flex-shrink-0" />
                  <p className="text-gray-800 font-medium">{cat.endereco}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock size={20} className="text-ms-cerrado-orange mt-1 flex-shrink-0" />
                  <p className="text-gray-800 font-medium">{cat.horario}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Info size={20} className="text-ms-primary-blue mt-1 flex-shrink-0" />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CatsSection;
