import { useState, useEffect } from "react";
import { MapPin, Clock, Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface CAT {
  id: string;
  name: string;
  address: string | null;
  city: string;
  region: string | null;
  working_hours: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  latitude: number | null;
  longitude: number | null;
}

const CatsSection = () => {
  const { t } = useTranslation('pages');
  const [cats, setCats] = useState<CAT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCATs();
  }, []);

  const loadCATs = async () => {
    try {
      // Buscar apenas CATs do Descubra MS (platform='ms' ou null) e que estão ativos
      const { data, error } = await supabase
        .from('cat_locations')
        .select('*')
        .eq('is_active', true)
        .or('platform.is.null,platform.eq.ms')
        .order('name');

      if (error) throw error;
      setCats(data || []);
    } catch (error) {
      console.error('Erro ao carregar CATs:', error);
      // Em caso de erro, manter array vazio
      setCats([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-pantanal-green/5">
        <div className="ms-container">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ms-primary-blue" />
          </div>
        </div>
      </section>
    );
  }

  if (cats.length === 0) {
    return null; // Não exibir seção se não houver CATs
  }

  return (
    <section className="py-24 bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-pantanal-green/5">
      <div className="ms-container">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-5">
            {t('home.cats.title', { defaultValue: 'Centros de Atendimento ao Turista' })}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('home.cats.description', { defaultValue: 'Os CATs são pontos de apoio onde você encontra informações e orientações para aproveitar ao máximo sua experiência em Mato Grosso do Sul.' })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cats.map((cat, index) => (
            <div 
              key={cat.id} 
              className="group bg-white rounded-2xl p-8 shadow-lg border-t-4 border-ms-primary-blue transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <MapPin size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-ms-primary-blue group-hover:text-ms-discovery-teal transition-colors duration-300">
                  {cat.name}
                </h3>
              </div>
              
              <div className="space-y-5">
                {cat.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin size={20} className="text-ms-cerrado-orange mt-1 flex-shrink-0" />
                    <p className="text-gray-800 font-medium leading-relaxed">{cat.address}</p>
                  </div>
                )}
                {cat.working_hours && (
                  <div className="flex items-start space-x-3">
                    <Clock size={20} className="text-ms-cerrado-orange mt-1 flex-shrink-0" />
                    <p className="text-gray-800 font-medium">{cat.working_hours}</p>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <Info size={20} className="text-ms-primary-blue mt-1 flex-shrink-0" />
                  <div>
                    {cat.region && (
                      <p className="text-gray-800 font-medium">{t('home.cats.region', { defaultValue: 'Região' })}: {cat.region}</p>
                    )}
                    {cat.city && (
                      <p className="text-gray-700 text-sm mt-1">
                        {t('home.cats.city', { defaultValue: 'Cidade' })}: {cat.city}
                      </p>
                    )}
                    {cat.contact_phone && (
                      <p className="text-gray-700 text-sm mt-1">
                        {t('home.cats.phone', { defaultValue: 'Telefone' })}: {cat.contact_phone}
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
