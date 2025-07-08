
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
    <section className="py-16 bg-gray-50">
      <div className="ms-container">
        <h2 className="section-title">Experiências Completas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiencias.map((exp) => (
            <div key={exp.id} className="bg-white rounded-lg p-6 shadow-md card-hover">
              <div className="mb-4">
                {exp.icone}
              </div>
              <h3 className="text-lg font-semibold mb-2">{exp.titulo}</h3>
              <p className="text-gray-600">{exp.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
