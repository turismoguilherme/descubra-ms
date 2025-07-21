
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ENV } from "@/config/environment";

interface GuataProfileProps {
  isConnected?: boolean;
  connectionChecking?: boolean;
}

const GuataProfile: React.FC<GuataProfileProps> = ({ 
  isConnected = true, 
  connectionChecking = false 
}) => {
  return (
    <div className="flex items-center space-x-3">
      <Avatar className="w-16 h-16 border-2 border-ms-primary-blue">
        <AvatarImage 
          src={ENV.GUATA.AVATAR_URL}
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
          <p className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Conectada' : 'Desconectada'}
          </p>
        )}
      </div>
    </div>
  );
};

export default GuataProfile;
