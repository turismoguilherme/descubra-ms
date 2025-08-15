import { CrawlOptions, IngestionResult } from './types';
import { guataCrawler } from './crawler';
import { embedText } from './embeddings/localEmbedder';

export async function ingestState(options: CrawlOptions): Promise<IngestionResult> {
  const pages = await guataCrawler.crawl(options);

  // Placeholder: chunking e embeddings mínimos
  let chunked = 0;
  for (const page of pages) {
    // Em produção: dividir por 500–800 tokens
    await embedText(page.content);
    chunked += 1;
  }

  // Retorno sem gravação em DB por enquanto
  return {
    discovered: pages.length,
    extracted: pages.length,
    chunked,
    upserted: 0
  };
}
