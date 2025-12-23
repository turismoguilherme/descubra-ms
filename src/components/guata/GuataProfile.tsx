
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ENV } from "@/config/environment";
import { platformContentService } from "@/services/admin/platformContentService";

interface GuataProfileProps {
  isConnected?: boolean;
  connectionChecking?: boolean;
}

const GuataProfile: React.FC<GuataProfileProps> = ({ 
  isConnected = true, 
  connectionChecking = false 
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(ENV.GUATA.AVATAR_URL);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const data = await platformContentService.getContent(['guata_avatar_url']);
        if (data.length > 0 && data[0].content_value) {
          console.log('🔄 [GuataProfile] Avatar carregado do banco:', data[0].content_value);
          setAvatarUrl(data[0].content_value);
        } else {
          console.log('⚠️ [GuataProfile] Avatar não encontrado no banco, usando padrão');
        }
      } catch (error) {
        console.error('Erro ao carregar avatar do Guatá:', error);
      }
    };
    loadAvatar();
    
    // Recarregar avatar a cada 30 segundos para pegar atualizações
    const interval = setInterval(loadAvatar, 30000);
    
    // Escutar eventos de atualização de logo
    const handleLogoUpdate = (event: CustomEvent) => {
      if (event.detail?.key === 'guata_avatar_url') {
        console.log('📢 [GuataProfile] Avatar atualizado, recarregando:', event.detail);
        loadAvatar();
      }
    };
    window.addEventListener('logo-updated', handleLogoUpdate as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('logo-updated', handleLogoUpdate as EventListener);
    };
  }, []);

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="w-16 h-16 border-2 border-ms-primary-blue">
        <AvatarImage 
          src={avatarUrl}
          alt="Guatá - Capivara Guia Turístico"
          className="object-cover"
        />
        <AvatarFallback className="bg-ms-primary-blue text-white font-bold text-lg">
          G
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold text-white">{ENV.GUATA.NAME}</h1>
        <p className="text-gray-300">{ENV.GUATA.DESCRIPTION}</p>
        {connectionChecking && (
          <p className="text-xs text-yellow-500">Conectando...</p>
        )}
        {!connectionChecking && (
          <p className={`text-xs ${isConnected ? 'text-green-400' : 'text-orange-400'}`}>
            {isConnected ? 'Conectada' : '🌐 Modo offline (DNS)'}
          </p>
        )}
      </div>
    </div>
  );
};

export default GuataProfile;
