
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DelinhaProfileProps {
  isConnected?: boolean;
  connectionChecking?: boolean;
}

const DelinhaProfile: React.FC<DelinhaProfileProps> = ({ 
  isConnected = true, 
  connectionChecking = false 
}) => {
  return (
    <div className="flex items-center space-x-3">
      <Avatar className="w-16 h-16 border-2 border-ms-primary-blue">
        <AvatarImage 
          src="/lovable-uploads/784137c1-eae8-4511-823f-b4f9d18a114d.png" 
          alt="Delinha AI"
          className="object-cover"
        />
        <AvatarFallback className="bg-ms-primary-blue text-white font-bold text-lg">
          D
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold text-white">Delinha</h1>
        <p className="text-gray-300">Sua assistente de turismo inteligente</p>
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

export default DelinhaProfile;
