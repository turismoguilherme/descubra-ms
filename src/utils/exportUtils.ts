
import { saveAs } from 'file-saver';
import { AIMessage } from "@/types/ai";

/**
 * Função para formatar o histórico de mensagens como texto
 */
export const formatConversationAsText = (messages: AIMessage[]): string => {
  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let text = `# Conversa com a Delinha - ${formattedDate}\n\n`;
  
  messages.forEach(message => {
    // Ignora mensagens de digitação
    if (message.isTyping) return;
    
    const time = message.timestamp 
      ? message.timestamp.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
      : '';
    
    const sender = !message.isUser ? 'Delinha' : 'Você';
    text += `[${time}] ${sender}: ${message.text}\n\n`;
  });
  
  return text;
};

/**
 * Função para exportar a conversa como arquivo de texto
 */
export const exportConversationAsText = (messages: AIMessage[]): void => {
  const text = formatConversationAsText(messages);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  
  // Gera um nome de arquivo com a data atual
  const fileName = `conversa-delinha-${new Date().toISOString().slice(0, 10)}.txt`;
  
  saveAs(blob, fileName);
};

/**
 * Função para exportar a conversa como PDF
 * Nota: Esta é uma implementação simplificada que gera um arquivo básico.
 * Para uma versão mais avançada, bibliotecas como jsPDF podem ser usadas.
 */
export const exportConversationAsPDF = async (messages: AIMessage[]): Promise<void> => {
  // Importa dinamicamente a biblioteca jsPDF quando necessário
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  
  // Configuração da página
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = 20;
  
  // Título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const title = "Conversa com a Delinha";
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight + 5;
  
  // Data
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const formattedDate = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  doc.text(formattedDate, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight * 2;
  
  // Conteúdo
  doc.setFontSize(11);
  
  messages.forEach(message => {
    // Ignora mensagens de digitação
    if (message.isTyping) return;
    
    const time = message.timestamp 
      ? message.timestamp.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
      : '';
    
    const sender = !message.isUser ? 'Delinha' : 'Você';
    
    // Adiciona o cabeçalho da mensagem
    doc.setFont('helvetica', 'bold');
    const header = `[${time}] ${sender}:`;
    doc.text(header, margin, yPosition);
    yPosition += lineHeight;
    
    // Adiciona o conteúdo da mensagem
    doc.setFont('helvetica', 'normal');
    
    // Divide o texto em linhas para quebra automática
    const textLines = doc.splitTextToSize(message.text, pageWidth - margin * 2);
    
    // Verifica se precisa adicionar uma nova página
    if (yPosition + (textLines.length * lineHeight) > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    // Adiciona as linhas de texto
    doc.text(textLines, margin, yPosition);
    yPosition += textLines.length * lineHeight + 5;
    
    // Verifica novamente se precisa adicionar uma nova página para a próxima mensagem
    if (yPosition > doc.internal.pageSize.getHeight() - margin - lineHeight * 3) {
      doc.addPage();
      yPosition = margin;
    }
  });
  
  // Salva o arquivo
  const fileName = `conversa-delinha-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};
