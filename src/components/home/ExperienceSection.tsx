import { MapPin, Calendar, Book, Image, Sparkles, ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Experiencia {
  id: number;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  corIcone: string;
  corBg: string;
  link: string;
}

const experiencias: Experiencia[] = [
  {
    id: 1,
    titulo: "Roteiros Personalizados",
    descricao: "Planeje sua viagem com base nos seus interesses e tempo disponível",
    icone: Sparkles,
    corIcone: "text-ms-primary-blue",
    corBg: "from-ms-primary-blue/10 to-ms-discovery-teal/10",
    link: "/descubramatogrossodosul/roteiros-personalizados"
  },
  {
    id: 2,
    titulo: "Agenda de Eventos",
    descricao: "Fique por dentro das festas, eventos culturais e gastronômicos no estado",
    icone: Calendar,
    corIcone: "text-ms-cerrado-orange",
    corBg: "from-ms-cerrado-orange/10 to-amber-100/10",
    link: "/descubramatogrossodosul/eventos"
  },
  {
    id: 3,
    titulo: "Cultura Local",
    descricao: "Conheça a história, tradições e costumes sul-mato-grossenses",
    icone: Book,
    corIcone: "text-ms-guavira-purple",
    corBg: "from-ms-guavira-purple/10 to-purple-100/10",
    link: "/descubramatogrossodosul/sobre"
  },
  {
    id: 4,
    titulo: "Galeria Visual",
    descricao: "Imagens e vídeos incríveis para te inspirar a conhecer cada cantinho",
    icone: Image,
    corIcone: "text-ms-rivers-blue",
    corBg: "from-ms-rivers-blue/10 to-blue-100/10",
    link: "/descubramatogrossodosul/destinos"
  }
];

const ExperienceSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="ms-container">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-3 rounded-full">
              <Sparkles size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-ms-primary-blue mb-4">
            Experiências Completas
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra tudo que Mato Grosso do Sul tem para oferecer com experiências únicas e inesquecíveis
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiencias.map((exp) => {
            const IconComponent = exp.icone;
            return (
              <Link
                key={exp.id}
                to={exp.link}
                className="group block"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-ms-primary-blue/30 h-full flex flex-col">
                  <div className="mb-6 flex justify-center">
                    <div className={`bg-gradient-to-br ${exp.corBg} p-5 rounded-2xl group-hover:scale-110 transition-transform duration-300 border-2 border-transparent group-hover:border-ms-primary-blue/20`}>
                      <IconComponent size={32} className={exp.corIcone} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-ms-primary-blue mb-3 text-center group-hover:text-ms-discovery-teal transition-colors">
                    {exp.titulo}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed mb-4 flex-grow group-hover:text-gray-700 transition-colors text-sm">
                    {exp.descricao}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-ms-primary-blue font-medium text-sm group-hover:gap-3 transition-all pt-4 border-t border-gray-100">
                    <span>Explorar</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
