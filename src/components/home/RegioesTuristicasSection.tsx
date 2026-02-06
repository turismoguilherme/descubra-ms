import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Globe } from "lucide-react";
import { touristRegions2025 } from "@/data/touristRegions2025";
import { useTranslation } from "react-i18next";

const RegioesTuristicasSection = () => {
  const { t } = useTranslation('pages');
  
  // Pegar todas as regiões (ou as últimas 6 se houver muitas)
  const regioes = touristRegions2025.slice(4, 10);

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50/30 via-white to-green-50/30">
      <div className="ms-container">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Globe size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-5">
            {t('home.regions.title', { defaultValue: 'Regiões Turísticas' })}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('home.regions.description', { defaultValue: 'Descubra a diversidade de Mato Grosso do Sul através de suas regiões turísticas únicas' })}
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {regioes.map((regiao, index) => (
            <Link
              key={regiao.slug}
              to={`/descubrams/regioes/${regiao.slug}`}
              className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 h-full border-2 border-gray-100 hover:border-ms-primary-blue/40">
                {/* Header do card com cor da região */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: regiao.color }}
                  >
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-ms-primary-blue group-hover:text-ms-discovery-teal transition-colors duration-300 flex-1">
                    {regiao.name}
                  </h3>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {regiao.description}
                </p>

                {/* Destaques */}
                {regiao.highlights && regiao.highlights.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {regiao.highlights.slice(0, 3).map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="text-xs font-semibold">{regiao.cities.length} cidades</span>
                  </div>
                  <div className="flex items-center gap-1 text-ms-primary-blue font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                    <span>{t('home.regions.explore', { defaultValue: 'Explorar' })}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Botão Ver Todas */}
        <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link 
            to="/descubrams/mapa-turistico" 
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
          >
            {t('home.regions.viewAll', { defaultValue: 'Ver Todas as Regiões' })}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RegioesTuristicasSection;

