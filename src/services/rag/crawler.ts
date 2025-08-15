import { CrawlOptions, CrawlTarget, ExtractedPage } from './types';

export class GuataCrawler {
  async discoverSeeds(stateCode: string): Promise<CrawlTarget[]> {
    // Descoberta inicial a partir de seeds por UF (será preenchido no próximo passo)
    return [
      { url: 'https://turismo.ms.gov.br', stateCode },
    ];
  }

  async crawl(options: CrawlOptions): Promise<ExtractedPage[]> {
    const seeds = await this.discoverSeeds(options.stateCode);
    const nowIso = new Date().toISOString();

    // Placeholder: em produção, respeitar robots.txt, sitemap.xml, depth e budget
    return seeds.map(seed => ({
      url: seed.url,
      stateCode: options.stateCode,
      title: 'Página inicial turismo MS',
      content: 'Conteúdo extraído (placeholder).',
      fetchedAt: nowIso,
      metadata: { depth: 0 }
    }));
  }
}

export const guataCrawler = new GuataCrawler();
