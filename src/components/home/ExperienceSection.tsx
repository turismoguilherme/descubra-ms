import { MapPin, Calendar, Book, Image, Sparkles, ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { platformContentService } from '@/services/admin/platformContentService';

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
    id: 2,
    titulo: "Agenda de Eventos",
    descricao: "Fique por dentro das festas, eventos culturais e gastronômicos no estado",
    icone: Calendar,
    corIcone: "text-ms-cerrado-orange",
    corBg: "from-ms-cerrado-orange/10 to-amber-100/10",
    link: "/descubrams/eventos"
  },
  {
    id: 3,
    titulo: "Cultura Local",
    descricao: "Conheça a história, tradições e costumes sul-mato-grossenses",
    icone: Book,
    corIcone: "text-ms-guavira-purple",
    corBg: "from-ms-guavira-purple/10 to-purple-100/10",
    link: "/descubrams/sobre"
  },
  {
    id: 4,
    titulo: "Galeria Visual",
    descricao: "Imagens e vídeos incríveis para te inspirar a conhecer cada cantinho",
    icone: Image,
    corIcone: "text-ms-rivers-blue",
    corBg: "from-ms-rivers-blue/10 to-blue-100/10",
    link: "/descubrams/destinos"
  }
];

const ExperienceSection = () => {
  const { t } = useTranslation('pages');
  const [content, setContent] = useState<Record<string, string>>({});

  // Carregar conteúdo do CMS
  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('ms_experience_');
        const contentMap: Record<string, string> = {};
        contents.forEach(item => {
          contentMap[item.content_key] = item.content_value || '';
        });
        setContent(contentMap);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
      }
    };
    loadContent();
  }, []);

  const getContent = (key: string, fallback: string) => content[key] || fallback;
  
  // Traduzir experiências (conteúdo estático)
  const experienciasTraduzidas = experiencias.map(exp => ({
    ...exp,
    titulo: t(`home.experiences.${exp.id}.title`, { defaultValue: exp.titulo }),
    descricao: t(`home.experiences.${exp.id}.description`, { defaultValue: exp.descricao }),
  }));

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50/50 via-white to-green-50/50">
      <div className="ms-container">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Sparkles size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-5">
            {getContent('ms_experience_title', t('home.experiences.title', { defaultValue: 'Experiências Completas' }))}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {getContent('ms_experience_subtitle', t('home.experiences.subtitle', { defaultValue: 'Descubra tudo que Mato Grosso do Sul tem para oferecer com experiências únicas e inesquecíveis' }))}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experienciasTraduzidas.map((exp, index) => {
            const IconComponent = exp.icone;
            return (
              <Link
                key={exp.id}
                to={exp.link}
                className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-gray-100 hover:border-ms-primary-blue/40 h-full flex flex-col">
                  <div className="mb-8 flex justify-center">
                    <div className={`bg-gradient-to-br ${exp.corBg} p-6 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-2 border-transparent group-hover:border-ms-primary-blue/30 shadow-md group-hover:shadow-xl`}>
                      <IconComponent size={40} className={exp.corIcone} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-ms-primary-blue mb-4 text-center group-hover:text-ms-discovery-teal transition-colors duration-300">
                    {exp.titulo}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed mb-6 flex-grow group-hover:text-gray-700 transition-colors duration-300">
                    {exp.descricao}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-ms-primary-blue font-semibold text-sm group-hover:gap-3 transition-all duration-300 pt-5 border-t border-gray-100">
                    <span>{t('home.experiences.explore', { defaultValue: 'Explorar' })}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
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
