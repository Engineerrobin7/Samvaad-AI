import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_API_KEY',
});

export class NlpService {
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: texts,
    });

    return response.data.map((embedding: any) => embedding.embedding);
  }
}

export const nlpService = new NlpService();
