/**
 * Serviço para gerenciar termos de parceria e gerar PDFs assinados
 */
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import { policyService } from '@/services/public/policyService';

function generateDocumentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function generateTermText(partnerName: string, partnerEmail: string, termsContent: string, termsVersion: number): string {
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `TERMO DE PARCERIA - DESCUBRA MATO GROSSO DO SUL\nVersão ${termsVersion}\n\n${termsContent}\n\n---\nASSINATURA ELETRÔNICA\nNome: ${partnerName}\nEmail: ${partnerEmail}\nData: ${date}`;
}

/**
 * Gerar PDF do termo assinado com assinatura digital inclusa
 */
export async function generatePartnerTermsPDF(
  partnerId: string,
  partnerName: string,
  partnerEmail: string,
  termsVersion: number,
  ipAddress?: string | null
): Promise<string> {
  try {
    const policy = await policyService.getPublishedPolicy('partner_terms', 'descubra_ms');
    const termsContent = policy?.content || 'Termo de Parceria - Descubra Mato Grosso do Sul';
    const termText = generateTermText(partnerName, partnerEmail, termsContent, termsVersion);
    const documentHash = generateDocumentHash(termText);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let y = margin;

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMO DE PARCERIA', margin, y, { maxWidth });
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Descubra Mato Grosso do Sul', margin, y, { maxWidth });
    doc.text(`Versão ${termsVersion}`, margin, y + 6, { maxWidth });
    y += 15;

    // Conteúdo
    doc.setFontSize(10);
    const sections = termsContent.split('\n\n').filter(s => s.trim());
    for (const section of sections) {
      if (y > 270) { doc.addPage(); y = margin; }
      const isTitle = section.match(/^#+\s/) || section.match(/^\d+\./);
      doc.setFont('helvetica', isTitle ? 'bold' : 'normal');
      const text = isTitle ? section.replace(/^#+\s/, '') : section;
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, margin, y, { maxWidth });
      y += lines.length * (isTitle ? 5 : 4) + 3;
    }

    // Separador
    y += 10;
    if (y > 240) { doc.addPage(); y = margin; }
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ASSINATURA ELETRÔNICA', margin, y, { maxWidth });
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nome: ${partnerName}`, margin, y); y += 6;
    doc.text(`Email: ${partnerEmail}`, margin, y); y += 6;

    const signedDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.text(`Data e Hora: ${signedDate}`, margin, y); y += 6;
    if (ipAddress) { doc.text(`IP: ${ipAddress}`, margin, y); y += 6; }
    doc.text(`Hash: ${documentHash}`, margin, y); y += 10;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    const footerText = 'Esta assinatura eletrônica tem validade legal conforme a LGPD.';
    doc.text(footerText, margin, y, { maxWidth });

    // Upload
    const pdfBlob = doc.output('blob');
    const fileName = `partner-terms/partner-terms-${partnerId}-${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, pdfBlob, { contentType: 'application/pdf' });

    if (uploadError) {
      console.error('Erro upload PDF:', uploadError);
      return '';
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);
    return urlData?.publicUrl || '';
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
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
  ipAddress?: string | null,
  digitalSignatureUrl?: string,
  uploadedPdfUrl?: string
): Promise<{ success: boolean; error?: string; pdfSaved?: boolean }> {
  try {
    const policy = await policyService.getPublishedPolicy('partner_terms', 'descubra_ms');
    const termsContent = policy?.content || '';
    const termText = generateTermText(partnerName, partnerEmail, termsContent, termsVersion);
    const documentHash = generateDocumentHash(termText);
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

    const insertData: Record<string, unknown> = {
      partner_id: partnerId,
      terms_version: termsVersion,
      pdf_url: pdfUrl || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      document_hash: documentHash,
      signed_at: new Date().toISOString(),
      digital_signature_url: digitalSignatureUrl || null,
      uploaded_pdf_url: uploadedPdfUrl || null,
      review_status: 'pending',
    };

    const { error: insertError } = await supabase
      .from('partner_terms_acceptances')
      .insert(insertData as any);

    if (insertError) {
      console.error('Erro ao salvar aceite:', insertError);
    }

    // Update partner
    await supabase
      .from('institutional_partners')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', partnerId);

    return { success: true, pdfSaved: !!pdfUrl && pdfUrl.trim() !== '' };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Erro ao salvar aceite:', err);
    return { success: false, error: err.message };
  }
}
