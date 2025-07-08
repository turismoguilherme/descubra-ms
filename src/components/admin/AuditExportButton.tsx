
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface AuditExportButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const AuditExportButton: React.FC<AuditExportButtonProps> = ({
  variant = "outline",
  size = "sm"
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportAuditToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Buscar dados de auditoria
      const { data: securityLogs, error: securityError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      const { data: contentLogs, error: contentError } = await supabase
        .from('content_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (securityError || contentError || rolesError) {
        throw new Error("Erro ao buscar dados de auditoria");
      }

      const doc = new jsPDF();
      
      // Configurações do documento
      doc.setFont("helvetica");
      
      // Cabeçalho
      doc.setFontSize(18);
      doc.setTextColor(59, 130, 246);
      doc.text("RELATÓRIO DE AUDITORIA DO SISTEMA", 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 30);
      doc.text(`Período: Todos os registros disponíveis`, 20, 38);
      
      let yPosition = 50;

      // Resumo Executivo
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text("RESUMO EXECUTIVO", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`• Total de eventos de segurança: ${securityLogs?.length || 0}`, 20, yPosition);
      yPosition += 6;
      doc.text(`• Total de alterações de conteúdo: ${contentLogs?.length || 0}`, 20, yPosition);
      yPosition += 6;
      doc.text(`• Total de usuários com funções: ${userRoles?.length || 0}`, 20, yPosition);
      yPosition += 15;

      // Eventos de Segurança Críticos
      const criticalEvents = securityLogs?.filter(log => 
        !log.success || 
        log.action.includes('admin') || 
        log.action.includes('login_failure')
      ) || [];

      if (criticalEvents.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(220, 38, 38);
        doc.text("EVENTOS CRÍTICOS DE SEGURANÇA", 20, yPosition);
        yPosition += 10;

        const criticalTableData = criticalEvents.slice(0, 20).map(event => [
          new Date(event.created_at).toLocaleDateString('pt-BR'),
          event.action,
          event.success ? 'Sucesso' : 'Falha',
          event.error_message || 'N/A'
        ]);

        (doc as any).autoTable({
          head: [['Data', 'Ação', 'Status', 'Erro']],
          body: criticalTableData,
          startY: yPosition,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
          margin: { left: 20, right: 20 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Nova página se necessário
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Logs de Segurança Recentes
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text("LOGS DE SEGURANÇA RECENTES (50 mais recentes)", 20, yPosition);
      yPosition += 10;

      const securityTableData = (securityLogs || []).slice(0, 50).map(log => [
        new Date(log.created_at).toLocaleDateString('pt-BR'),
        new Date(log.created_at).toLocaleTimeString('pt-BR'),
        log.action,
        log.success ? 'Sucesso' : 'Falha',
        log.user_id?.substring(0, 8) + '...' || 'Sistema'
      ]);

      (doc as any).autoTable({
        head: [['Data', 'Hora', 'Ação', 'Status', 'Usuário']],
        body: securityTableData,
        startY: yPosition,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 }
      });

      // Nova página para alterações de conteúdo
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text("ALTERAÇÕES DE CONTEÚDO (50 mais recentes)", 20, yPosition);
      yPosition += 10;

      const contentTableData = (contentLogs || []).slice(0, 50).map(log => [
        new Date(log.timestamp).toLocaleDateString('pt-BR'),
        new Date(log.timestamp).toLocaleTimeString('pt-BR'),
        log.table_name,
        log.action,
        log.user_name || 'Sistema'
      ]);

      (doc as any).autoTable({
        head: [['Data', 'Hora', 'Tabela', 'Ação', 'Usuário']],
        body: contentTableData,
        startY: yPosition,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 }
      });

      // Nova página para usuários e funções
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text("USUÁRIOS E FUNÇÕES DO SISTEMA", 20, yPosition);
      yPosition += 10;

      const rolesTableData = (userRoles || []).map(role => [
        role.user_id.substring(0, 8) + '...',
        role.role,
        role.region || 'N/A',
        new Date(role.created_at).toLocaleDateString('pt-BR')
      ]);

      (doc as any).autoTable({
        head: [['ID Usuário', 'Função', 'Região', 'Data Criação']],
        body: rolesTableData,
        startY: yPosition,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 }
      });

      // Rodapé em todas as páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Relatório gerado automaticamente pelo Sistema de Turismo MS - Página ${i} de ${pageCount}`,
          20,
          doc.internal.pageSize.height - 10
        );
      }
      
      // Salvar o PDF
      const fileName = `auditoria_sistema_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Relatório de Auditoria Exportado",
        description: `O arquivo ${fileName} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar relatório de auditoria:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o relatório de auditoria PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportAuditToPDF}
      variant={variant}
      size={size}
      disabled={isExporting}
      className="flex items-center"
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-2 h-4 w-4" />
      )}
      {isExporting ? "Gerando..." : "Relatório PDF"}
    </Button>
  );
};

export default AuditExportButton;
