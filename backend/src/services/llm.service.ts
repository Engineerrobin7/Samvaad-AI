import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export class LlmService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro"});

  async generateResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error("Error generating response from LLM:", error);
      throw new Error("Failed to generate response from LLM.");
    }
  }
}

export const llmService = new LlmService();
