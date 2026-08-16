
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ConversationItem } from "./types";

interface ExportConversationProps {
  conversations: ConversationItem[];
  isExporting: boolean;
  isLoading: boolean;
  handleExportConversation: (format: 'text' | 'pdf') => Promise<void>;
}

const ExportConversation = ({ 
  conversations, 
  isExporting, 
  isLoading,
  handleExportConversation 
}: ExportConversationProps) => {
  if (conversations.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isExporting || isLoading}
          className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
        >
          <Download size={16} />
          <span>Exportar histórico</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleExportConversation('text')}
          className="cursor-pointer"
        >
          Exportar como texto (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExportConversation('pdf')}
          className="cursor-pointer"
        >
          Exportar como PDF (.pdf)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportConversation;
