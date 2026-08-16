/**
 * Converte HTML simples para Markdown básico
 * Remove tags HTML e converte para formatação Markdown
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html;

  // Remover comentários JSX/HTML
  markdown = markdown.replace(/<!--[\s\S]*?-->/g, '');
  markdown = markdown.replace(/{\/\*[\s\S]*?\*\/}/g, '');

  // Converter títulos
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');

  // Converter listas não ordenadas
  markdown = markdown.replace(/<ul[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<ol[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

  // Converter negrito e itálico (manter o conteúdo interno)
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Converter parágrafos
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Converter quebras de linha
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');

  // Converter divs e sections (apenas o conteúdo interno)
  markdown = markdown.replace(/<(div|section)[^>]*>/gi, '');
  markdown = markdown.replace(/<\/(div|section)>/gi, '\n\n');

  // Remover todas as outras tags HTML, mantendo apenas o texto
  markdown = markdown.replace(/<[^>]+>/g, '');

  // Limpar espaços em branco excessivos
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.replace(/[ \t]+/g, ' ');
  markdown = markdown.replace(/^\s+|\s+$/gm, '');

  // Limpar linhas vazias no início e fim
  markdown = markdown.trim();

  return markdown;
}

/**
 * Extrai apenas o texto de um conteúdo HTML/JSX, removendo todas as tags
 */
export function extractTextFromHtml(html: string): string {
  if (!html) return '';

  let text = html;

  // Remover comentários
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/{\/\*[\s\S]*?\*\/}/g, '');

  // Remover todas as tags HTML/JSX
  text = text.replace(/<[^>]+>/g, '');

  // Decodificar entidades HTML básicas
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Limpar espaços em branco
  text = text.replace(/\s+/g, ' ');
  text = text.trim();

  return text;
}

