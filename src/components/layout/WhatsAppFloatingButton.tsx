// @ts-nocheck
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppConfig {
  enabled: boolean;
  phone: string;
  message?: string;
}

const WhatsAppFloatingButton = () => {
  const [config, setConfig] = useState<WhatsAppConfig>({
    enabled: false,
    phone: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();

    // Escutar eventos de atualização de configurações
    const handleSettingsUpdate = () => {
      loadConfig();
    };

    window.addEventListener('siteSettingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('siteSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('platform', 'ms')
        .in('setting_key', ['ms_whatsapp_enabled', 'ms_whatsapp_phone', 'ms_whatsapp_message']);

      if (error) throw error;

      const newConfig: WhatsAppConfig = {
        enabled: false,
        phone: '',
      };

      data?.forEach((item) => {
        if (item.setting_key === 'ms_whatsapp_enabled') {
          newConfig.enabled = item.setting_value === true || item.setting_value === 'true';
        } else if (item.setting_key === 'ms_whatsapp_phone') {
          newConfig.phone = item.setting_value || '';
        } else if (item.setting_key === 'ms_whatsapp_message') {
          newConfig.message = item.setting_value || '';
        }
      });

      setConfig(newConfig);
    } catch (error) {
      console.error('Erro ao carregar configuração do WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!config.phone) return;

    // Remover caracteres não numéricos
    const cleanPhone = config.phone.replace(/\D/g, '');
    
    // Criar mensagem padrão se não houver
    const defaultMessage = 'Olá! Gostaria de montar um roteiro personalizado para minha viagem.';
    const message = config.message || defaultMessage;
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // Não exibir se estiver desabilitado, carregando ou sem telefone
  if (loading || !config.enabled || !config.phone) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
      aria-label="Falar no WhatsApp"
      title="Falar no WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="sr-only">Falar no WhatsApp</span>
    </button>
  );
};

export default WhatsAppFloatingButton;
