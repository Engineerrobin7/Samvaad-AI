// c:/Users/ROBIN/OneDrive/Desktop/Samvaad AI/backend/src/services/vector.store.ts
import { nlpService } from './nlp.service';

interface Vector {
  id: string;
  embedding: number[];
  text: string;
  documentId: string;
}

// Simple cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magA === 0 || magB === 0) {
    return 0;
  }
  return dotProduct / (magA * magB);
}

class VectorStore {
  private vectors: Map<string, Vector[]> = new Map();

  async addDocument(documentId: string, text: string) {
    const chunks = this.chunkText(text);
    const documentVectors: Vector[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embeddingResult = await nlpService.generateEmbeddings([chunk]);
      const embedding = embeddingResult[0];
      const vector: Vector = {
        id: `${documentId}_${i}`,
        embedding,
        text: chunk,
        documentId,
      };
      documentVectors.push(vector);
    }

    this.vectors.set(documentId, documentVectors);
  }

  async search(query: string, topK = 3) {
    const queryEmbeddingResult = await nlpService.generateEmbeddings([query]);
    const queryEmbedding = queryEmbeddingResult[0];
    const allVectors: Vector[] = Array.from(this.vectors.values()).flat();

    if (allVectors.length === 0) {
      return [];
    }

    const similarities = allVectors.map(vector => ({
      text: vector.text,
      similarity: cosineSimilarity(queryEmbedding, vector.embedding),
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  removeDocument(documentId: string) {
    this.vectors.delete(documentId);
  }

  private chunkText(text: string, chunkSize = 512, overlap = 50): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + chunkSize));
      i += chunkSize - overlap;
    }
    return chunks;
  }
}

export const vectorStore = new VectorStore();
