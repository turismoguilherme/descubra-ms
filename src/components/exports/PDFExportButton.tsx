
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface PDFExportButtonProps {
  data: unknown[];
  filename: string;
  title: string;
  columns: { header: string; dataKey: string }[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  data,
  filename,
  title,
  columns,
  variant = "outline",
  size = "sm"
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    if (!data || data.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há dados disponíveis para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      
      // Configurar fonte
      doc.setFont("helvetica");
      
      // Título
      doc.setFontSize(16);
      doc.text(title, 20, 20);
      
      // Data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 30);
      
      // Preparar dados para a tabela
      const tableData = data.map(item => 
        columns.map(col => {
          const value = item[col.dataKey];
          if (value instanceof Date) {
            return value.toLocaleDateString('pt-BR');
          }
          return value?.toString() || '';
        })
      );
      
      // Gerar tabela
      (doc as any).autoTable({
        head: [columns.map(col => col.header)],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Azul
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Cinza claro
        },
      });
      
      // Salvar o PDF
      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Relatório exportado",
        description: "O arquivo PDF foi baixado com sucesso.",
      });
    } catch (error: unknown) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      variant={variant}
      size={size}
      disabled={isExporting}
      className="flex items-center"
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isExporting ? "Exportando..." : "Exportar PDF"}
    </Button>
  );
};

export default PDFExportButton;
