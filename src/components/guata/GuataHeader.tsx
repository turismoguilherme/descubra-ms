
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AIMessage } from "@/types/ai";

interface GuataHeaderProps {
  onClearConversation: () => void;
  mensagens: AIMessage[];
}

const GuataHeader: React.FC<GuataHeaderProps> = ({ onClearConversation, mensagens }) => {
  return (
    <div className="flex justify-end items-center p-4 mb-4 text-white">
      {mensagens.length > 0 && (
        <Button
          onClick={onClearConversation}
          variant="outline"
          size="sm"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar Conversa
        </Button>
      )}
    </div>
  );
};

export default GuataHeader;
