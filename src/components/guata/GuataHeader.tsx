
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AIMessage } from "@/types/ai";

interface GuataHeaderProps {
  onClearConversation: () => void;
  mensagens: AIMessage[];
}

const GuataHeader: React.FC<GuataHeaderProps> = ({ onClearConversation, mensagens }) => {
  console.log('🔍 GuataHeader: Componente renderizado.', { mensagensLength: mensagens.length });
  return (
    <div className="p-6 mb-6 text-white">
    </div>
  );
};

export default GuataHeader;
