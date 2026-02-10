// @ts-nocheck
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { platformContentService } from '@/services/admin/platformContentService';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Award, Star } from "lucide-react";

interface PantanalAnimal {
  id: string;
  name: string;
  scientific_name: string;
  description: string;
  image_url: string;
  rarity: string;
  habitat?: string;
  diet?: string;
  personality_traits?: string;
}

const AvataresSection = () => {
  const { t } = useTranslation('pages');
  const { language } = useLanguage();
  const [content, setContent] = useState<Record<string, string>>({});
  const [avatars, setAvatars] = useState<PantanalAnimal[]>([]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('ms_avatars_', language);
        const contentMap: Record<string, string> = {};
        contents.forEach(item => {
          contentMap[item.content_key] = item.content_value || '';
        });
        setContent(contentMap);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
      }
    };

    const loadAvatars = async () => {
      try {
        const { data, error } = await supabase
          .from('pantanal_avatars')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(3); // Mostrar apenas os 3 primeiros, como nos eventos

        if (error) throw error;
        setAvatars(data || []);
      } catch (error) {
        console.error('Erro ao carregar avatares:', error);
      }
    };

    loadContent();
    loadAvatars();

    const handleFocus = () => {
      loadContent();
      loadAvatars();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [language]);

  const getContent = (key: string, fallback: string) => content[key] || fallback;

  return (
    <section className="py-24 bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-pantanal-green/5">
      <div className="ms-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ms-primary-blue/10 border border-ms-primary-blue/20 mb-6">
              <Sparkles className="h-4 w-4 text-ms-primary-blue" />
              <span className="text-sm font-medium text-ms-primary-blue">
                {getContent('ms_avatars_badge', 'Sistema de Gamificação')}
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-5">
              {t('home.avatars.title', { defaultValue: getContent('ms_avatars_title', 'Sistema de Avatares do Pantanal') })}
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {t('home.avatars.subtitle', { defaultValue: getContent('ms_avatars_subtitle', 'Combine gamificação, educação ambiental e personalização para criar uma experiência única de conexão com a biodiversidade do Pantanal.') })}
            </p>
          </div>

          {/* Grid de Avatares - Seguindo layout dos eventos (3 avatares em destaque) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {avatars.map((avatar, index) => (
              <div
                key={avatar.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 h-full border border-gray-100 hover:border-ms-primary-blue/30"
              >
                {/* Badge de Raridade */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                    avatar.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                    avatar.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    avatar.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {avatar.rarity === 'legendary' ? '⭐⭐⭐⭐⭐ Lendário' :
                     avatar.rarity === 'epic' ? '⭐⭐⭐⭐ Épico' :
                     avatar.rarity === 'rare' ? '⭐⭐⭐⭐ Raro' : '⭐ Comum'}
                  </span>
                </div>

                {/* Imagem - Maior como nos eventos */}
                <div className="h-72 overflow-hidden relative">
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/images/avatar-placeholder.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Conteúdo - Mais espaçado como nos eventos */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-ms-primary-blue mb-3 hover:text-ms-primary-blue/80 transition-colors duration-300 line-clamp-2">
                    {avatar.name}
                  </h3>

                  <p className="text-sm text-gray-600 italic mb-4">{avatar.scientific_name}</p>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {avatar.description}
                  </p>

                  {/* Link para ver mais */}
                  <Link
                    to="/descubrams/profile#top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="flex items-center gap-2 text-ms-primary-blue font-semibold text-sm hover:gap-3 transition-all duration-300 pt-4 border-t border-gray-100 hover:text-ms-primary-blue/80"
                  >
                    <span>Ver detalhes</span>
                    <Star className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Botão Ver Todos os Avatares */}
          <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link
              to="/descubrams/profile"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-ms-primary-blue to-blue-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
            >
              <Award className="h-5 w-5" />
              Ver Meus Avatares
              <Sparkles className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>

        </div>
      </div>

    </section>
  );
};

export default AvataresSection;

