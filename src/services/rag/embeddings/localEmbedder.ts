const DIM = 384;

export async function embedText(text: string): Promise<number[]> {
  // Placeholder determinístico simples: vetor zero de 384 dimensões
  return new Array(DIM).fill(0);
}

export function embeddingDim(): number { return DIM; }
