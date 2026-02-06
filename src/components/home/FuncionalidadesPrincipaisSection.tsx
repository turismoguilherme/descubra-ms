import { Link } from "react-router-dom";
import { Map, Calendar, Users, MessageSquare, BookOpen, Info, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Funcionalidade {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ComponentType<{ className?: string }>;
  corIcone: string;
  corBg: string;
  link: string;
}

const funcionalidades: Funcionalidade[] = [
  {
    id: 'mapa',
    titulo: 'Mapa Turístico',
    descricao: 'Explore o mapa interativo e descubra todas as regiões turísticas de Mato Grosso do Sul',
    icone: Map,
    corIcone: 'text-blue-600',
    corBg: 'from-blue-500/20 to-blue-600/20',
    link: '/descubrams/mapa-turistico'
  },
  {
    id: 'eventos',
    titulo: 'Agenda de Eventos',
    descricao: 'Fique por dentro das festas, eventos culturais e gastronômicos em todo o estado',
    icone: Calendar,
    corIcone: 'text-orange-600',
    corBg: 'from-orange-500/20 to-amber-500/20',
    link: '/descubrams/eventos'
  },
  {
    id: 'parceiros',
    titulo: 'Parceiros',
    descricao: 'Hotéis, restaurantes e serviços turísticos para tornar sua viagem inesquecível',
    icone: Users,
    corIcone: 'text-green-600',
    corBg: 'from-green-500/20 to-emerald-500/20',
    link: '/descubrams/parceiros'
  },
  {
    id: 'guata',
    titulo: 'Guatá IA',
    descricao: 'Seu guia virtual inteligente. Converse e receba recomendações personalizadas',
    icone: MessageSquare,
    corIcone: 'text-purple-600',
    corBg: 'from-purple-500/20 to-pink-500/20',
    link: '/descubrams/guata'
  },
  {
    id: 'passaporte',
    titulo: 'Passaporte Digital',
    descricao: 'Colecione selos temáticos, participe de roteiros e ganhe recompensas exclusivas',
    icone: BookOpen,
    corIcone: 'text-teal-600',
    corBg: 'from-teal-500/20 to-cyan-500/20',
    link: '/descubrams/passaporte'
  },
  {
    id: 'sobre',
    titulo: 'Sobre MS',
    descricao: 'Conheça a história, cultura, tradições e belezas de Mato Grosso do Sul',
    icone: Info,
    corIcone: 'text-indigo-600',
    corBg: 'from-indigo-500/20 to-blue-500/20',
    link: '/descubrams/sobre'
  }
];

const FuncionalidadesPrincipaisSection = () => {
  const { t } = useTranslation('pages');

  return (
    <section className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-green-50/30">
      <div className="ms-container">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-5">
            {t('home.features.title', { defaultValue: 'Explore Nossas Funcionalidades' })}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('home.features.description', { defaultValue: 'Tudo que você precisa para planejar e viver experiências incríveis em Mato Grosso do Sul' })}
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {funcionalidades.map((func, index) => {
            const IconComponent = func.icone;
            return (
              <Link
                key={func.id}
                to={func.link}
                className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 h-full border-2 border-gray-100 hover:border-ms-primary-blue/40 flex flex-col">
                  {/* Ícone */}
                  <div className="mb-6 flex justify-center">
                    <div className={`bg-gradient-to-br ${func.corBg} p-6 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-2 border-transparent group-hover:border-ms-primary-blue/30 shadow-md group-hover:shadow-xl`}>
                      <IconComponent size={48} className={func.corIcone} />
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="text-xl font-bold text-ms-primary-blue mb-4 text-center group-hover:text-ms-discovery-teal transition-colors duration-300">
                    {func.titulo}
                  </h3>

                  {/* Descrição */}
                  <p className="text-gray-600 text-center leading-relaxed mb-6 flex-grow group-hover:text-gray-700 transition-colors duration-300">
                    {func.descricao}
                  </p>

                  {/* Link */}
                  <div className="flex items-center justify-center gap-2 text-ms-primary-blue font-semibold text-sm group-hover:gap-3 transition-all duration-300 pt-5 border-t border-gray-100">
                    <span>{t('home.features.explore', { defaultValue: 'Explorar' })}</span>
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

export default FuncionalidadesPrincipaisSection;

