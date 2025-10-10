
import { MapPin, Calendar, Book, Image } from "lucide-react";

const experiencias = [
  {
    id: 1,
    titulo: "Roteiros Personalizados",
    descricao: "Planeje sua viagem com base nos seus interesses e tempo disponível",
    icone: <MapPin size={24} className="text-ms-pantanal-green" />
  },
  {
    id: 2,
    titulo: "Agenda de Eventos",
    descricao: "Fique por dentro das festas, eventos culturais e gastronômicos no estado",
    icone: <Calendar size={24} className="text-ms-cerrado-orange" />
  },
  {
    id: 3,
    titulo: "Cultura Local",
    descricao: "Conheça a história, tradições e costumes sul-mato-grossenses",
    icone: <Book size={24} className="text-ms-guavira-purple" />
  },
  {
    id: 4,
    titulo: "Galeria Visual",
    descricao: "Imagens e vídeos incríveis para te inspirar a conhecer cada cantinho",
    icone: <Image size={24} className="text-ms-rivers-blue" />
  }
];

const ExperienceSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="ms-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ms-primary-blue mb-4">
            Experiências Completas
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra tudo que Mato Grosso do Sul tem para oferecer com experiências únicas e inesquecíveis
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {experiencias.map((exp) => (
            <div key={exp.id} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="mb-6 flex justify-center">
                <div className="bg-gradient-to-br from-ms-pantanal-green/10 to-ms-discovery-teal/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  {exp.icone}
                </div>
              </div>
              <h3 className="text-xl font-bold text-ms-primary-blue mb-4 text-center group-hover:text-ms-discovery-teal transition-colors">
                {exp.titulo}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors">
                {exp.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
