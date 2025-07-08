
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";

interface MessageInputProps {
  iaQuery: string;
  setIaQuery: (query: string) => void;
  handleIAQuery: () => void;
  isLoading: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

const MessageInput = ({ iaQuery, setIaQuery, handleIAQuery, isLoading, handleKeyDown }: MessageInputProps) => {
  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Digite uma pergunta de turista..."
        value={iaQuery}
        onChange={(e) => setIaQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
        disabled={isLoading}
      />
      <Button 
        onClick={handleIAQuery}
        disabled={isLoading || !iaQuery.trim()}
        className={`transition-all duration-300 ${isLoading ? 'bg-gray-400' : 'bg-ms-primary-blue hover:bg-ms-primary-blue/90'}`}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Consultando...
          </>
        ) : (
          <>
            Consultar IA
            <Send size={16} className="ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default MessageInput;
