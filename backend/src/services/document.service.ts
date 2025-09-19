// src/services/document.service.ts
import { PrismaClient } from '../../../generated/prisma';
import { promises as fs } from 'fs';
import pdf from 'pdf-parse';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

class DocumentService {
  /**
   * Splits text into chunks of a specified size.
   */
  private splitTextIntoChunks(text: string, chunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Generates embeddings for a batch of text chunks.
   */
  private async getEmbeddings(chunks: string[]): Promise<number[][]> {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.batchEmbedContents({
      requests: chunks.map(chunk => ({
        content: { role: "user", parts: [{ text: chunk }] },
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Campus Document",
      })),
    });
    return result.embeddings.map(e => e.values);
  }

  /**
   * Processes an uploaded PDF, creates chunks, generates embeddings, and stores them in the database.
   */
  /**
   * Processes an uploaded PDF, creates chunks, generates embeddings, and stores them in the database.
   * @disabled This function is temporarily disabled due to a Prisma/DB incompatibility with the 'vector' type.
   */
  async processPdf(filePath: string, documentName: string): Promise<any> {
    console.error("FATAL: The processPdf function was called, but it is temporarily disabled due to a known database schema incompatibility with the 'vector' type. To fix this, the database write logic needs to be rewritten using raw SQL.");
    // Clean up the uploaded file to prevent it from being orphaned
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Failed to delete uploaded file during disabled feature call:', unlinkError);
    }
    throw new Error("The PDF processing feature is temporarily disabled due to a database configuration issue.");
  }

  /**
   * Searches for relevant document chunks based on a query.
   */
  async search(query: string, topK: number = 5): Promise<any[]> {
    // 1. Generate embedding for the query
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent({
      content: { role: "user", parts: [{ text: query }] },
      taskType: TaskType.RETRIEVAL_QUERY,
    });
    const queryEmbedding = result.embedding.values;

    // 2. Perform a vector search in the database
    const results = await prisma.$queryRaw`
      SELECT
        id,
        content,
        "documentId",
        1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM "DocumentChunk"
      ORDER BY similarity DESC
      LIMIT ${topK}
    `;

    return results as any[];
  }
}

export const documentService = new DocumentService();