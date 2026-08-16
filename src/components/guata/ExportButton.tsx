
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { exportConversationAsText, exportConversationAsPDF } from "@/utils/exportUtils";
import { AIMessage } from "@/types/ai";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ExportButtonProps {
  mensagens: AIMessage[];
}

const ExportButton = ({ mensagens }: ExportButtonProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportText = () => {
    try {
      setIsExporting(true);
      exportConversationAsText(mensagens);
      toast({
        title: "Conversa exportada com sucesso!",
        description: "O arquivo de texto foi salvo no seu computador."
      });
    } catch (error) {
      console.error("Erro ao exportar conversa:", error);
      toast({
        title: "Erro ao exportar conversa",
        description: "Não foi possível exportar a conversa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportConversationAsPDF(mensagens);
      toast({
        title: "Conversa exportada com sucesso!",
        description: "O arquivo PDF foi salvo no seu computador."
      });
    } catch (error) {
      console.error("Erro ao exportar conversa como PDF:", error);
      toast({
        title: "Erro ao exportar conversa",
        description: "Não foi possível exportar a conversa como PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isExporting || mensagens.length <= 1}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300"
          >
            <Download size={16} />
            <span>Exportar conversa</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportText} className="cursor-pointer">
            <FileText className="mr-2" size={16} />
            <span>Exportar como texto (.txt)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
            <FileText className="mr-2" size={16} />
            <span>Exportar como PDF (.pdf)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default ExportButton;
