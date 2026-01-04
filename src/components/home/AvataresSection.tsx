import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { platformContentService } from '@/services/admin/platformContentService';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Award, Star, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [showAvatarsModal, setShowAvatarsModal] = useState(false);

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

          {/* Content - Versão sucinta */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <p className="text-gray-700 leading-relaxed text-center text-lg mb-6">
              <strong>Sistema de Gamificação:</strong> Escolha seu avatar entre animais do Pantanal, desbloqueie novos através do Passaporte Digital
              (complete roteiros e visite destinos para ganhar recompensas). Cada avatar representa características únicas da fauna brasileira.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-gray-500 text-lg">⭐</span>
                <span className="text-sm text-gray-700">Comum</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-blue-500 text-lg">⭐⭐⭐</span>
                <span className="text-sm text-gray-700">Raro</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-purple-500 text-lg">⭐⭐⭐⭐</span>
                <span className="text-sm text-gray-700">Épico</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-yellow-500 text-lg">⭐⭐⭐⭐⭐</span>
                <span className="text-sm text-gray-700">Lendário</span>
              </div>
            </div>
          </div>

          {/* Ver avatares */}
          <div className="text-center mb-12">
            <Button
              onClick={() => setShowAvatarsModal(true)}
              className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white px-8 py-4 text-lg gap-3"
            >
              <Eye className="h-5 w-5" />
              Ver Avatares Disponíveis
            </Button>
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

      {/* Modal de Avatares */}
      <Dialog open={showAvatarsModal} onOpenChange={setShowAvatarsModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              🦌 Avatares do Pantanal Disponíveis
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6">
            {avatars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {avatars.map((avatar) => (
                  <div key={avatar.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="text-center mb-4">
                      <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                        <img
                          src={avatar.image_url}
                          alt={avatar.name}
                          className="w-24 h-24 object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = '/images/avatar-placeholder.png';
                          }}
                        />
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-1">{avatar.name}</h3>
                      <p className="text-sm text-gray-600 italic mb-3">{avatar.scientific_name}</p>

                      <div className="mb-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          avatar.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                          avatar.rarity === 'epic' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                          avatar.rarity === 'rare' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}>
                          {avatar.rarity === 'legendary' ? '⭐⭐⭐⭐⭐ Lendário' :
                           avatar.rarity === 'epic' ? '⭐⭐⭐⭐ Épico' :
                           avatar.rarity === 'rare' ? '⭐⭐⭐ Raro' : '⭐ Comum'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Habitat:</strong> {avatar.habitat || 'Pantanal'}</p>
                      <p><strong>Alimentação:</strong> {avatar.diet || 'Diversificada'}</p>
                      {avatar.personality_traits && (
                        <p><strong>Personalidade:</strong> {avatar.personality_traits}</p>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">{avatar.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Carregando avatares...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AvataresSection;

