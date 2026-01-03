import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ENV } from "@/config/environment";
import { platformContentService } from "@/services/admin/platformContentService";
import kodaMascote from "@/assets/koda-mascote.jpg";

interface KodaProfileProps {
  isConnected?: boolean;
  connectionChecking?: boolean;
}

const KodaProfile: React.FC<KodaProfileProps> = ({ 
  isConnected = true, 
  connectionChecking = false 
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(kodaMascote);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const data = await platformContentService.getContent(['koda_avatar_url']);
        if (data.length > 0 && data[0].content_value) {
          console.log('🔄 [KodaProfile] Avatar loaded from database:', data[0].content_value);
          setAvatarUrl(data[0].content_value);
        }
      } catch (error) {
        console.error('Error loading Koda avatar:', error);
      }
    };
    loadAvatar();
    
    const interval = setInterval(loadAvatar, 30000);
    
    const handleLogoUpdate = (event: CustomEvent) => {
      if (event.detail?.key === 'koda_avatar_url') {
        console.log('📢 [KodaProfile] Avatar updated, reloading:', event.detail);
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
      <Avatar className="w-16 h-16 border-2 border-red-600">
        <AvatarImage 
          src={avatarUrl}
          alt="Koda - Canadian Travel Guide"
          className="object-cover"
        />
        <AvatarFallback className="bg-red-600 text-white font-bold text-lg">
          K
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold text-white">{ENV.KODA.NAME}</h1>
        <p className="text-gray-300">{ENV.KODA.DESCRIPTION}</p>
        {connectionChecking && (
          <p className="text-xs text-yellow-500">Connecting...</p>
        )}
        {!connectionChecking && (
          <p className={`text-xs ${isConnected ? 'text-green-400' : 'text-orange-400'}`}>
            {isConnected ? 'Connected' : '🌐 Offline mode'}
          </p>
        )}
      </div>
    </div>
  );
};

export default KodaProfile;
