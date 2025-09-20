// src/services/ai.service.ts
import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';
import { ticketService } from './ticket.service';

// --- INTERFACES ---
export interface TranslationResult {
  translation: string;
  culturalContext: string;
}

export interface ImageTranslationResult {
  extractedText: string;
  translation: string;
  culturalContext: string;
}

export interface ChatConfig {
  language: string;
  conversationId: string;
  systemPrompt?: string;
}

export interface TranscriptAnalysis {
  summary: string;
  actionItems: { text: string; isDone: boolean }[];
}

// --- AI SERVICE CLASS ---
class AIService {
  private genAI: GoogleGenerativeAI;
  private conversationStore: Map<string, ChatSession> = new Map();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // --- PROMPT GENERATORS ---

  private getTranslationPrompt(sourceLanguage: string, targetLanguage: string, formalityLevel: string): string {
    return `You are an expert translator specializing in Indian languages with deep cultural understanding.
Translate the following text from "${sourceLanguage}" to "${targetLanguage}".
The desired formality level is "${formalityLevel}".

Your response MUST be a valid JSON object with exactly two keys:
1. "translation": The translated text
2. "culturalContext": A brief, helpful cultural tip related to the translation (maximum 100 words)

Do not include any other text, explanations, or markdown formatting. Return only the JSON object.`;
  }

  private getImageTranslationPrompt(targetLanguage: string): string {
    return `You are an expert at extracting and translating text from images, with deep knowledge of Indian languages and culture.

First, carefully extract ALL visible text from the provided image.
Then, translate the extracted text into "${targetLanguage}".

Your response MUST be a valid JSON object with exactly three keys:
1. "extractedText": All text found in the image (in original language)
2. "translation": The translated text in ${targetLanguage}
3. "culturalContext": A brief cultural tip relevant to the content (maximum 80 words)

If no text is found, use "No text detected" for extractedText and translation.
Return only the JSON object with no additional text or formatting.`;
  }

  private getABTestChatPrompt(language: string, conversationId: string): { prompt: string; variant: string } {
    const prompts = [
      {
        variant: 'Version A',
        prompt: `You are Samvaad AI, a helpful and culturally-aware multilingual assistant. Your primary goal is to facilitate clear and respectful communication across Indian cultures.

Key guidelines:
- Respond in ${language} when the user speaks in ${language}
- Provide cultural context when relevant
- Be helpful, respectful, and encouraging
- Keep responses concise but informative
- If asked about something you cannot help with, politely explain your limitations

Remember: You are designed to bridge cultural and linguistic gaps in India. (Version A)`,
      },
      {
        variant: 'Version B',
        prompt: `You are Samvaad AI, a direct and efficient multilingual assistant for campus queries. Focus on providing precise answers quickly.

Key guidelines:
- Respond in ${language} when the user speaks in ${language}
- Be direct and to the point.
- Prioritize factual information over conversational filler.
- If asked about something you cannot help with, state it clearly. (Version B)`,
      },
    ];
    const lastChar = conversationId.charCodeAt(conversationId.length - 1);
    const index = lastChar % prompts.length;
    return prompts[index];
  }

  private getCampusIntentPrompt(message: string): string {
    return `You are an AI expert at analyzing student queries for a campus chatbot...`; // Original prompt body
  }

  private getTranscriptAnalysisPrompt(): string {
    return `You are an expert project management assistant. Your task is to analyze a meeting transcript and extract key information.

    Analyze the following transcript and provide a concise summary and a list of actionable tasks.

    Your response MUST be a single, valid JSON object with exactly two keys:
    1. "summary": A concise summary of the transcript.
    2. "actionItems": An array of actionable tasks extracted from the transcript, where each task is an object with a "text" (string) and "isDone" (boolean) property.

    Do not include any other text, explanations, or markdown formatting. Return only the JSON object.`
  }
  // --- MISSING METHODS ---
  
  public async chatWithPdf(question: string, pdfText: string, language: string): Promise<string> {
    // TODO: Implement PDF chat logic using Gemini or other LLM
    // For now, return a mock response
    return `Mock reply to '${question}' about PDF in ${language}.`;
  }
  
  public async chatWithAI(config: ChatConfig, messages: any[]): Promise<{ reply: string; variant: string }> {
    // TODO: Implement chat logic using Gemini or other LLM
    // For now, return a mock response
    const { prompt, variant } = this.getABTestChatPrompt(config.language, config.conversationId);
    return { reply: `Mock AI reply for ${config.language} (${variant})`, variant };
  }
  
  public clearConversation(conversationId: string): void {
    // TODO: Implement clearing conversation logic
    this.conversationStore.delete(conversationId);
  }
  
  public async analyzeTranscript(transcriptText: string): Promise<TranscriptAnalysis> {
    // TODO: Implement transcript analysis logic using Gemini or other LLM
    // For now, return a mock analysis
    return {
      summary: "Mock summary of transcript.",
      actionItems: [
        { text: "Mock action item 1", isDone: false },
        { text: "Mock action item 2", isDone: true }
      ]
    };
  }
  
  /**
   * Analyze intent and entities from a message for ticket routing and analytics
   */
  public async analyzeIntentAndEntities(message: string): Promise<{ intent: string; entities?: Record<string, any> }> {
    // Use the campus intent prompt to extract intent
    const prompt = this.getCampusIntentPrompt(message);
    // For now, mock the response. Replace with LLM call if needed.
    // Example: Use genAI.generateContent(prompt) and parse response
    // Here, we simply return a dummy intent
    return { intent: "none", entities: {} };
  }
}

export const aiService = new AIService();