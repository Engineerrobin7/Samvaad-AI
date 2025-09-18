// src/services/document.service.ts
import { PrismaClient } from '../../generated/prisma';
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
        content: chunk,
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Campus Document",
      })),
    });
    return result.embeddings.map(e => e.values);
  }

  /**
   * Processes an uploaded PDF, creates chunks, generates embeddings, and stores them in the database.
   */
  async processPdf(filePath: string, documentName: string): Promise<any> {
    try {
      // 1. Read and parse the PDF
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      const pdfText = data.text;

      // 2. Split text into chunks
      const chunks = this.splitTextIntoChunks(pdfText);

      // 3. Generate embeddings for each chunk
      const embeddings = await this.getEmbeddings(chunks);

      // 4. Create the document and its chunks in the database
      const document = await prisma.document.create({
        data: {
          name: documentName,
          chunks: {
            create: chunks.map((chunk, index) => ({
              content: chunk,
              embedding: embeddings[index],
            })),
          },
        },
        include: {
          chunks: true,
        },
      });

      // 5. Clean up the uploaded file
      await fs.unlink(filePath);

      return document;
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF.');
    }
  }

  /**
   * Searches for relevant document chunks based on a query.
   */
  async search(query: string, topK: number = 5): Promise<any[]> {
    // 1. Generate embedding for the query
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent({
      content: query,
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

    return results;
  }
}

export const documentService = new DocumentService();
