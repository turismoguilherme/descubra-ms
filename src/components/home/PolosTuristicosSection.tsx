import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Compass, Loader2 } from "lucide-react";
import { touristRegions2025 } from "@/data/touristRegions2025";
import { useTranslation } from "react-i18next";

const PolosTuristicosSection = () => {
  const { t } = useTranslation('pages');
  const [loading, setLoading] = useState(false);

  // Pegar as primeiras 4 regiões como "polos turísticos"
  const polos = touristRegions2025.slice(0, 4);

  return (
    <section className="py-24 bg-gradient-to-br from-white via-green-50/30 to-blue-50/30">
      <div className="ms-container">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Compass size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-5">
            {t('home.polos.title', { defaultValue: 'Polos Turísticos' })}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('home.polos.description', { defaultValue: 'Explore as principais regiões turísticas de Mato Grosso do Sul, cada uma com sua identidade única e atrativos especiais' })}
          </p>
        </div>

        {/* Grid de Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md h-full border border-gray-100 animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {polos.map((polo, index) => (
              <Link
                key={polo.slug}
                to={`/descubrams/regioes/${polo.slug}`}
                className="group block animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 h-full border border-gray-100 hover:border-ms-primary-blue/30">
                  {/* Imagem com cor da região */}
                  <div 
                    className="h-64 relative overflow-hidden"
                    style={{ backgroundColor: polo.color }}
                  >
                    {polo.image && (
                      <img
                        src={polo.image}
                        alt={polo.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl">
                      {polo.cities.length} cidades
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-ms-primary-blue mb-3 group-hover:text-ms-discovery-teal transition-colors duration-300">
                      {polo.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {polo.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin size={16} className="text-ms-pantanal-green" />
                        <span className="text-xs font-semibold">{polo.cities[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 text-ms-primary-blue font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                        <span>{t('home.polos.explore', { defaultValue: 'Explorar' })}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Botão Ver Todas */}
        <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link 
            to="/descubrams/mapa-turistico" 
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
          >
            {t('home.polos.viewAll', { defaultValue: 'Ver Mapa Turístico Completo' })}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PolosTuristicosSection;


