/**
 * Serviço para gerenciar termos de parceria e gerar PDFs assinados
 */

import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import { policyService } from '@/services/public/policyService';

export interface PartnerSignatureData {
  signed_name: string;
  signed_email: string;
  signed_at: string;
  ip_address: string | null;
  user_agent: string;
  document_hash: string;
  partner_id: string;
  terms_version: number;
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
function generateTermText(
  partnerName: string,
  partnerEmail: string,
  termsContent: string,
  termsVersion: number
): string {
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
TERMO DE PARCERIA - DESCUBRA MATO GROSSO DO SUL
Versão ${termsVersion}

${termsContent}

---

ASSINATURA ELETRÔNICA

Nome do Parceiro: ${partnerName}
Email: ${partnerEmail}
Data e Hora: ${date}

Ao aceitar este termo, você declara que leu, compreendeu e concorda com todos os termos e condições acima descritos.
Esta assinatura eletrônica tem validade legal conforme a LGPD.
`;
}

/**
 * Gerar PDF do termo assinado usando jsPDF
 */
export async function generatePartnerTermsPDF(
  partnerId: string,
  partnerName: string,
  partnerEmail: string,
  termsVersion: number,
  ipAddress?: string | null
): Promise<string> {
  try {
    // Buscar conteúdo do termo do banco
    const policy = await policyService.getPublishedPolicy('partner_terms', 'descubra_ms');
    const termsContent = policy?.content || 'Termo de Parceria - Descubra Mato Grosso do Sul';

    // Gerar texto completo
    const termText = generateTermText(partnerName, partnerEmail, termsContent, termsVersion);
    
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
    doc.text('TERMO DE PARCERIA', margin, yPosition, { maxWidth });
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Descubra Mato Grosso do Sul', margin, yPosition, { maxWidth });
    doc.text(`Versão ${termsVersion}`, margin, yPosition + 6, { maxWidth });
    yPosition += 15;

    // Conteúdo do termo (dividido em seções)
    doc.setFontSize(10);
    const sections = termsContent.split('\n\n').filter(s => s.trim());
    
    sections.forEach((section) => {
      // Verificar se precisa de nova página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = margin;
      }

      // Títulos em negrito
      if (section.match(/^#+\s/) || section.match(/^\d+\./)) {
        doc.setFont('helvetica', 'bold');
        const lines = doc.splitTextToSize(section.replace(/^#+\s/, ''), maxWidth);
        doc.text(lines, margin, yPosition, { maxWidth });
        yPosition += lines.length * 5;
      } else {
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(section, maxWidth);
        doc.text(lines, margin, yPosition, { maxWidth });
        yPosition += lines.length * 4;
      }
      
      yPosition += 3; // Espaço entre seções
    });

    // Assinatura
    yPosition += 10;
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ASSINATURA ELETRÔNICA', margin, yPosition, { maxWidth });
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nome do Parceiro: ${partnerName}`, margin, yPosition, { maxWidth });
    yPosition += 6;
    doc.text(`Email: ${partnerEmail}`, margin, yPosition, { maxWidth });
    yPosition += 6;
    
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
    
    // Upload para Supabase Storage (tentar bucket 'documents', se não existir, usar 'partner-terms')
    const fileName = `partner-terms-${partnerId}-${Date.now()}.pdf`;
    const filePath = `partner-terms/${fileName}`;

    let bucketName = 'documents';
    let { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    // Se o bucket 'documents' não existir, tentar criar ou usar outro bucket
    if (uploadError && uploadError.message.includes('Bucket not found')) {
      console.error('❌ [partnerTermsService] Bucket "documents" não encontrado no Supabase Storage. O PDF não será salvo.');
      console.error('❌ [partnerTermsService] Ação necessária: Criar bucket "documents" no Supabase Storage com permissões públicas para leitura.');
      // Retornar vazio - o PDF não será salvo, mas o processo de aceite continua
      return '';
    }

    if (uploadError) {
      console.error('❌ [partnerTermsService] Erro ao fazer upload do PDF:', uploadError);
      // Retornar URL vazia se falhar, mas continuar o processo
      return '';
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData?.publicUrl || '';
  } catch (error) {
    console.error('Erro ao gerar PDF do termo:', error);
    return '';
  }
}

/**
 * Salvar aceite do termo no banco
 */
export async function savePartnerTermsAcceptance(
  partnerId: string,
  partnerName: string,
  partnerEmail: string,
  termsVersion: number,
  pdfUrl?: string,
  ipAddress?: string | null
): Promise<{ success: boolean; error?: string; pdfSaved?: boolean }> {
  try {
    // Gerar hash do documento
    const policy = await policyService.getPublishedPolicy('partner_terms', 'descubra_ms');
    const termsContent = policy?.content || '';
    const termText = generateTermText(partnerName, partnerEmail, termsContent, termsVersion);
    const documentHash = generateDocumentHash(termText);

    // Obter user agent do navegador
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

    // Salvar na nova tabela partner_terms_acceptances
    const { data: acceptanceData, error: acceptanceError } = await supabase
      .from('partner_terms_acceptances')
      .insert({
        partner_id: partnerId,
        terms_version: termsVersion,
        pdf_url: pdfUrl || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        document_hash: documentHash,
        signed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (acceptanceError) {
      // Se a tabela não existir ainda (migration não aplicada), logar aviso mas continuar
      if (acceptanceError.code === '42P01' || acceptanceError.message?.includes('does not exist')) {
        console.warn('⚠️ [partnerTermsService] Tabela partner_terms_acceptances não existe. A migration pode não ter sido aplicada. Continuando sem salvar histórico detalhado.', acceptanceError);
      } else {
        console.error('❌ [partnerTermsService] Erro ao salvar aceite na tabela:', acceptanceError);
        // Continuar mesmo assim - não bloquear o processo
      }
    } else {
      console.log('✅ [partnerTermsService] Aceite salvo na tabela partner_terms_acceptances:', acceptanceData?.id);
    }

    // Atualizar parceiro com aceite do termo (campos opcionais)
    const updateFields: any = {
      updated_at: new Date().toISOString(),
    };
    
    // Tentar atualizar campos de termo se existirem (pode falhar silenciosamente)
    try {
      updateFields.terms_accepted_at = new Date().toISOString();
      updateFields.terms_accepted_version = termsVersion;
    } catch {
      // Ignorar se campos não existirem
    }
    
    const { error: updateError } = await supabase
      .from('institutional_partners')
      .update(updateFields)
      .eq('id', partnerId);

    // Se erro for por coluna não encontrada, continuar (migration não aplicada)
    if (updateError) {
      if (updateError.code === 'PGRST204' || 
          (updateError.message?.includes("column") && updateError.message?.includes("not found")) ||
          updateError.message?.includes("schema cache")) {
        console.warn('⚠️ [partnerTermsService] Campos de termo não disponíveis na tabela institutional_partners. Continuando...');
      } else {
        console.error('❌ [partnerTermsService] Erro ao atualizar parceiro:', updateError);
      }
    }

    // Verificar se PDF foi salvo
    const pdfSaved = !!pdfUrl && pdfUrl.trim() !== '';
    
    if (!pdfSaved) {
      console.warn('⚠️ [partnerTermsService] PDF não foi salvo. Verifique se o bucket "documents" existe no Supabase Storage.');
    }

    return { 
      success: true, 
      pdfSaved 
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('❌ [partnerTermsService] Erro inesperado ao salvar aceite do termo:', err);
    return { success: false, error: err.message };
  }
}

