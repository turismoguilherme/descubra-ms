import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { platformContentService } from '@/services/admin/platformContentService';

const RoteiroPersonalizadoBanner = () => {
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");
  const [guataImageUrl, setGuataImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // Carregar WhatsApp
      const { data: whatsappData, error: whatsappError } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'ms_whatsapp_phone')
        .maybeSingle();

      if (whatsappError) throw whatsappError;
      
      if (whatsappData?.setting_value) {
        setWhatsappPhone(whatsappData.setting_value as string);
      }

      // Carregar imagem do Guatá do admin
      const contents = await platformContentService.getContentByPrefix('ms_guata_roteiro_image_url');
      const guataContent = contents.find(c => c.content_key === 'ms_guata_roteiro_image_url');
      if (guataContent?.content_value) {
        setGuataImageUrl(guataContent.content_value);
      } else {
        // Fallback para imagem local se não houver no admin
        setGuataImageUrl('/images/publicimagesguata-roteiro.png');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Fallback para imagem local em caso de erro
      setGuataImageUrl('/images/publicimagesguata-roteiro.png');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!whatsappPhone) return;

    // Remover caracteres não numéricos
    const cleanPhone = whatsappPhone.replace(/\D/g, '');
    
    // Mensagem padrão
    const message = 'Olá! Gostaria de montar um roteiro personalizado para minha viagem pelo Mato Grosso do Sul.';
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (loading || !whatsappPhone) {
    return null; // Não exibir se não houver número configurado
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-green-600 via-green-500 to-teal-600 relative overflow-hidden">
      <div className="ms-container relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Texto e Botão */}
          <div className="flex-1 text-center md:text-left text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Montamos seu roteiro personalizado pelo MS
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto md:mx-0">
              Escolha destinos, combine experiências e descubra o melhor de Mato Grosso do Sul com um roteiro feito especialmente para você.
            </p>
            <Button
              onClick={handleWhatsAppClick}
              size="lg"
              className="bg-ms-secondary-yellow hover:bg-ms-secondary-yellow/90 text-gray-900 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Entre em contato
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Imagem do Guatá - Destacada e Maior */}
          <div className="flex-shrink-0 relative z-10">
            <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px]">
              <img
                src={guataImageUrl || '/images/publicimagesguata-roteiro.png'}
                alt="Guatá - Seu guia virtual para roteiros personalizados"
                className="w-full h-full object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-1000"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                  transform: 'scale(1.3)',
                  transformOrigin: 'center'
                }}
                onError={(e) => {
                  // Fallback para outras imagens do Guatá
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('guata-avatar')) {
                    target.src = '/images/guata-avatar.png';
                  } else if (!target.src.includes('guata-mascote')) {
                    target.src = '/guata-mascote.jpg';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Efeito de fundo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default RoteiroPersonalizadoBanner;

