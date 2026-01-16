import { PrismaClient, Prisma } from '@prisma/client';
import { NlpService } from './nlp.service';
import { multiDocumentService } from './multiDocument.service';
import { LlmService } from './llm.service';

const prisma = new PrismaClient();

export class RagService {
  private nlpService: NlpService;
  private llmService: LlmService;

  constructor() {
    this.nlpService = new NlpService();
    this.llmService = new LlmService();
  }

  async addDocument(file: any): Promise<any> {
    const text = await multiDocumentService.extractPDFText(file.path);
    const chunks = this.chunkText(text);
    const embeddings = await this.nlpService.generateEmbeddings(chunks);

    const document = await prisma.document.create({
      data: {
        name: file.originalname,
      },
    });

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk" (id, content, embedding, "documentId", "createdAt")
        VALUES (gen_random_uuid(), ${chunk}, ${`'[${embedding.join(',')}]'::vector`}, ${document.id}, NOW())
      `;
    }

    return document;
  }

  async search(query: string, k = 5) {
    const embedding = await this.nlpService.generateEmbeddings([query]);
    const vector = embedding[0];
    
    const results = await prisma.$queryRaw`
      SELECT
        "content",
        1 - (embedding <=> ${`'[${vector.join(',')}]'::vector`}) as similarity
      FROM "DocumentChunk"
      ORDER BY similarity DESC
      LIMIT ${k}
    `;

    return results;
  }

  async query(query: string) {
    const context = await this.search(query);
    const prompt = `${query}\n\nContext:\n${JSON.stringify(context)}`;
    const response = await this.llmService.generateResponse(prompt);
    return response;
  }

  private chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
