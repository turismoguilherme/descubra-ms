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
          .limit(6); // Mostrar apenas os 6 primeiros

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

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Como funciona */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-ms-primary-blue/10 rounded-lg">
                  <Award className="h-6 w-6 text-ms-primary-blue" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {getContent('ms_avatars_how_title', 'Como Funciona')}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {getContent('ms_avatars_how_description', 'Escolha seu avatar entre os animais do Pantanal, desbloqueie novos avatares através de conquistas, complete roteiros para ganhar recompensas e aprenda sobre a biodiversidade enquanto explora Mato Grosso do Sul.')}
              </p>
            </div>

            {/* Sistema de Gamificação */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-ms-pantanal-green/10 rounded-lg">
                  <Star className="h-6 w-6 text-ms-pantanal-green" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {getContent('ms_avatars_gamification_title', 'Sistema de Raridade')}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">⭐</span>
                  <span className="text-gray-700">{getContent('ms_avatars_rarity_common', 'Comum - Fácil de obter')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">⭐⭐⭐</span>
                  <span className="text-gray-700">{getContent('ms_avatars_rarity_rare', 'Raro - Requer esforço moderado')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">⭐⭐⭐⭐</span>
                  <span className="text-gray-700">{getContent('ms_avatars_rarity_epic', 'Épico - Desafio significativo')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  <span className="text-gray-700">{getContent('ms_avatars_rarity_legendary', 'Lendário - Conquista especial')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animais disponíveis */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {getContent('ms_avatars_animals_title', 'Animais do Pantanal Disponíveis')}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {getContent('ms_avatars_animals_description', 'Explore a biodiversidade do Pantanal através de avatares únicos. Cada animal representa características especiais e oferece uma experiência de gamificação única.')}
            </p>

            {/* Grid de avatares reais */}
            {avatars.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {avatars.map((avatar) => (
                  <div key={avatar.id} className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                      <img
                        src={avatar.image_url}
                        alt={avatar.name}
                        className="w-12 h-12 object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = '/images/avatar-placeholder.png';
                        }}
                      />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{avatar.name}</h4>
                    <p className="text-xs text-gray-600 italic">{avatar.scientific_name}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        avatar.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                        avatar.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                        avatar.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {avatar.rarity === 'legendary' ? '⭐⭐⭐⭐⭐' :
                         avatar.rarity === 'epic' ? '⭐⭐⭐⭐' :
                         avatar.rarity === 'rare' ? '⭐⭐⭐' : '⭐'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-disc list-inside text-gray-700">
                <li>{getContent('ms_avatars_animal_1', 'Onça-pintada - Lendário ⭐⭐⭐⭐⭐')}</li>
                <li>{getContent('ms_avatars_animal_2', 'Arara-azul - Épico ⭐⭐⭐⭐')}</li>
                <li>{getContent('ms_avatars_animal_3', 'Capivara - Comum ⭐')}</li>
                <li>{getContent('ms_avatars_animal_4', 'Tuiuiú - Raro ⭐⭐⭐')}</li>
                <li>{getContent('ms_avatars_animal_5', 'Ariranha - Raro ⭐⭐⭐')}</li>
                <li>{getContent('ms_avatars_animal_6', 'Tamanduá-bandeira - Raro ⭐⭐⭐')}</li>
              </ul>
            )}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link to="/descubrams/register">
              <Button className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white font-medium px-8 py-6 text-lg">
                {getContent('ms_avatars_cta', 'Cadastre-se e Escolha seu Avatar')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvataresSection;

