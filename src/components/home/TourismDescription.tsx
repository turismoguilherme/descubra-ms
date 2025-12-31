import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { platformContentService } from '@/services/admin/platformContentService';

const TourismDescription = () => {
  const { t } = useTranslation('pages');
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('ms_tourism_');
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

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 text-white">
      <div className="ms-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.tourismDescription.title', { defaultValue: getContent('ms_tourism_title', '"Descubra Mato Grosso do Sul" – Viva essa experiência!') })}
          </h2>
          
          <p className="mb-6 text-lg">
            {t('home.tourismDescription.paragraph1', { defaultValue: getContent('ms_tourism_paragraph_1', 'Prepare-se para descobrir o melhor de MS de um jeito inovador e inteligente. Com a ajuda do Guatá, seu guia virtual inspirado na cultura local, você explora atrativos como Bonito, Pantanal, Serra da Bodoquena e muito mais!') })}
          </p>
          
          <p className="mb-8 text-lg">
            {t('home.tourismDescription.paragraph2', { defaultValue: getContent('ms_tourism_paragraph_2', 'Crie seu passaporte digital, desbloqueie selos temáticos com animais do Cerrado e do Pantanal, participe de roteiros interativos, receba recompensas e viva momentos inesquecíveis! Cadastre-se para explorar mais e ajudar a melhorar o turismo local!') })}
          </p>
          
          <Link to="/descubrams/register">
            <Button className="bg-ms-secondary-yellow hover:bg-ms-secondary-yellow/90 text-black font-medium px-8 py-6 text-lg">
              {t('home.tourismDescription.signUp', { defaultValue: getContent('ms_tourism_button', 'Cadastre-se') })}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TourismDescription;
