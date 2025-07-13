
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AIMessage } from "@/types/ai";

interface GuataHeaderProps {
  onClearConversation: () => void;
  mensagens: AIMessage[];
}

const GuataHeader: React.FC<GuataHeaderProps> = ({ onClearConversation, mensagens }) => {
  return (
    <div className="bg-black bg-opacity-20 rounded-lg shadow-lg p-6 mb-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 border-2 border-ms-primary-blue">
            <AvatarImage 
              src="/lovable-uploads/0a95baed-e289-4cbf-968c-c046719edb73.png" 
              alt="Guatá AI"
              className="object-cover"
            />
            <AvatarFallback className="bg-ms-primary-blue text-white font-bold text-lg">
              G
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-white">Guatá</h1>
            <p className="text-gray-300">Seu guia de turismo inteligente para Mato Grosso do Sul</p>
          </div>
        </div>
        
        {mensagens.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearConversation}
            className="flex items-center space-x-2 text-gray-300 border-gray-500 hover:bg-red-500/20 hover:border-red-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Conversa</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default GuataHeader;
