/**
 * Consent Service
 * Serviço para gerenciar termos de consentimento e gerar PDFs assinados
 */

import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';

export interface SignatureData {
  signed_name: string;
  signed_at: string;
  ip_address: string | null;
  user_agent: string;
  document_hash: string;
}

export interface ConsentData {
  user_id: string;
  consent_given: boolean;
  consent_date: string | null;
  data_types_shared: string[];
  consent_version: string;
  terms_url: string;
  terms_pdf_url?: string;
  signature_data?: SignatureData;
  ip_address?: string | null;
  user_agent?: string;
}

/**
 * Gerar hash simples do documento para integridade
 */
function generateDocumentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Gerar texto completo do termo para o PDF
 */
function generateTermText(userName: string, userEmail: string, cnpj?: string): string {
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
TERMO DE CONSENTIMENTO PARA BENCHMARKING
ViaJAR - Plataforma de Turismo Inteligente

1. OBJETIVO
Este termo autoriza o compartilhamento de dados agregados e anonimizados da sua empresa/organização
para fins de benchmarking e comparação com outras empresas/organizações do setor turístico.

1.1. AVISO SOBRE PLATAFORMA NOVA
A ViaJAR é uma plataforma nova e em constante evolução. Podem ocorrer erros técnicos, 
inconsistências ou melhorias nos processos de agregação e análise de dados. Ao aceitar 
este termo, você reconhece e aceita que:
- A plataforma pode cometer erros no processamento de dados
- Os dados compartilhados são agregados e anonimizados
- Você aceita compartilhar seus dados mesmo com essas limitações
- A plataforma se compromete a corrigir erros quando identificados

2. DADOS COMPARTILHADOS
Apenas dados agregados e anonimizados serão compartilhados. Nenhum dado individual,
identificável ou confidencial será divulgado. Os dados são combinados com informações
de outras empresas para criar estatísticas e médias do mercado.

Tipos de dados compartilhados:
- Receita (dados agregados, sem valores individuais)
- Ocupação (taxa média, sem dados específicos)
- Preços (faixas médias, sem valores exatos)
- Avaliações (médias, sem comentários individuais)
- Serviços (tipos de serviços oferecidos)
- Capacidade (média, sem dados específicos)

3. FINALIDADE DO COMPARTILHAMENTO
Os dados serão utilizados exclusivamente para:
- Comparação de desempenho com o mercado
- Geração de insights e recomendações
- Análise de tendências do setor
- Melhoria dos serviços da plataforma

4. SEGURANÇA E PRIVACIDADE
Todos os dados são tratados de acordo com a LGPD (Lei Geral de Proteção de Dados).
Implementamos medidas técnicas e organizacionais para garantir a segurança e
privacidade dos dados compartilhados.

5. DIREITOS DO TITULAR (LGPD)
Você tem o direito de:
- Revogar o consentimento a qualquer momento
- Solicitar informações sobre como seus dados são utilizados
- Solicitar exclusão dos dados compartilhados

6. REVOGAÇÃO DO CONSENTIMENTO
Você pode revogar seu consentimento a qualquer momento através da interface da plataforma.
Após a revogação, seus dados não serão mais utilizados para novos benchmarks,
mas dados já agregados podem permanecer em análises históricas.

ASSINATURA ELETRÔNICA

Nome: ${userName}
Email: ${userEmail}
${cnpj ? `CNPJ: ${cnpj}` : ''}
Data e Hora: ${date}

Ao aceitar este termo, você declara que leu, compreendeu e concorda com todos os termos
e condições acima descritos.

Versão do Termo: 1.0
Data de Assinatura: ${date}
`;
}

/**
 * Gerar PDF do termo assinado usando jsPDF
 */
export async function generateConsentPDF(
  userId: string,
  userName: string,
  userEmail: string,
  cnpj?: string,
  ipAddress?: string | null
): Promise<string> {
  try {
    // Gerar texto do termo
    const termText = generateTermText(userName, userEmail, cnpj);
    
    // Gerar hash do documento
    const documentHash = generateDocumentHash(termText);
    
    // Criar PDF usando jsPDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMO DE CONSENTIMENTO PARA BENCHMARKING', margin, yPosition, { maxWidth });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('ViaJAR - Plataforma de Turismo Inteligente', margin, yPosition, { maxWidth });
    yPosition += 15;

    // Conteúdo do termo (dividido em seções)
    doc.setFontSize(11);
    const sections = termText.split('\n\n').filter(s => s.trim());
    
    sections.forEach((section, index) => {
      // Verificar se precisa de nova página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = margin;
      }

      // Títulos em negrito
      if (section.match(/^\d+\./)) {
        doc.setFont('helvetica', 'bold');
        const lines = doc.splitTextToSize(section, maxWidth);
        doc.text(lines, margin, yPosition, { maxWidth });
        yPosition += lines.length * 6;
      } else {
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(section, maxWidth);
        doc.text(lines, margin, yPosition, { maxWidth });
        yPosition += lines.length * 5;
      }
      
      yPosition += 5; // Espaço entre seções
    });

    // Assinatura
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('ASSINATURA ELETRÔNICA', margin, yPosition, { maxWidth });
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${userName}`, margin, yPosition, { maxWidth });
    yPosition += 6;
    doc.text(`Email: ${userEmail}`, margin, yPosition, { maxWidth });
    yPosition += 6;
    if (cnpj) {
      doc.text(`CNPJ: ${cnpj}`, margin, yPosition, { maxWidth });
      yPosition += 6;
    }
    
    const signedDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Data e Hora: ${signedDate}`, margin, yPosition, { maxWidth });
    yPosition += 6;
    
    if (ipAddress) {
      doc.text(`IP: ${ipAddress}`, margin, yPosition, { maxWidth });
      yPosition += 6;
    }
    
    doc.text(`Hash do Documento: ${documentHash}`, margin, yPosition, { maxWidth });
    yPosition += 10;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    const signatureText = 'Ao aceitar este termo, você declara que leu, compreendeu e concorda com todos os termos e condições acima descritos.';
    const signatureLines = doc.splitTextToSize(signatureText, maxWidth);
    doc.text(signatureLines, margin, yPosition, { maxWidth });

    // Gerar blob do PDF
    const pdfBlob = doc.output('blob');
    
    // Upload para Supabase Storage
    const fileName = `consent-${userId}-${Date.now()}.pdf`;
    const filePath = `consents/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.warn('Erro ao fazer upload do PDF:', uploadError);
      // Se o bucket não existir, retornar string vazia (PDF será gerado mas não salvo)
      return '';
    }

    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erro ao gerar PDF do termo:', error);
    throw error;
  }
}

/**
 * Salvar consentimento com PDF
 */
export async function saveConsentWithPDF(
  consentData: ConsentData,
  pdfUrl: string,
  signatureData: SignatureData
): Promise<void> {
  const { error } = await supabase
    .from('data_sharing_consents')
    .upsert({
      ...consentData,
      terms_pdf_url: pdfUrl,
      signature_data: signatureData
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    throw error;
  }
}

