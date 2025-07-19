import React from 'react';
import VLibrasWidget from './VLibrasWidget';
import { useAuth } from '@/hooks/useAuth';

const VLibrasWithPreferences: React.FC = () => {
  const { user } = useAuth();

  // Obter configuração de avatar baseada no usuário
  const getUserAvatarConfig = () => {
    if (!user?.accessibility_preferences) return null;

    const prefs = user.accessibility_preferences;
    
    // Configuração baseada nas necessidades do usuário
    let config = {
      gender: 'female' as const, // Padrão
      skinTone: 'medium' as const, // Padrão
      clothing: 'casual' as const,
      age: 'adult' as const
    };

    // Personalizar baseado nas necessidades
    if (prefs.needs?.visual) {
      config.clothing = 'high-contrast';
    }
    
    if (prefs.needs?.auditory) {
      config.clothing = 'formal'; // Avatar mais profissional para surdos
    }

    // Se o usuário especificou preferências específicas
    if (prefs.otherNeeds) {
      // Analisar texto para personalizar avatar
      const needsText = prefs.otherNeeds.toLowerCase();
      if (needsText.includes('idoso') || needsText.includes('senior')) {
        config.age = 'senior';
      }
      if (needsText.includes('jovem') || needsText.includes('adolescente')) {
        config.age = 'young';
      }
    }

    return config;
  };

  const avatarConfig = getUserAvatarConfig();

  return (
    <VLibrasWidget
      position="bottom-right"
      theme="light"
      autoStart={false}
      avatarConfig={avatarConfig}
    />
  );
};

export default VLibrasWithPreferences; 