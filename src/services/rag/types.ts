export interface CrawlOptions {
  stateCode: string;
  depth?: number;
  budgetPages?: number;
}

export interface CrawlTarget {
  url: string;
  stateCode: string;
  priority?: number;
}

export interface ExtractedPage {
  url: string;
  stateCode: string;
  title: string;
  content: string;
  fetchedAt: string;
  metadata?: Record<string, any>;
}

export interface ChunkRecord {
  documentId?: string;
  stateCode: string;
  chunkIndex: number;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface IngestionResult {
  discovered: number;
  extracted: number;
  chunked: number;
  upserted: number;
}
