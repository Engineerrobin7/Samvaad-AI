// src/services/ai.service.ts
import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';
import { ticketService } from './ticket.service'; // Import ticketService

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

  /**
   * Get system prompt for translation
   */
  private getTranslationPrompt(sourceLanguage: string, targetLanguage: string, formalityLevel: string): string {
    return `You are an expert translator specializing in Indian languages with deep cultural understanding.
Translate the following text from "${sourceLanguage}" to "${targetLanguage}".
The desired formality level is "${formalityLevel}".

Your response MUST be a valid JSON object with exactly two keys:
1. "translation": The translated text
2. "culturalContext": A brief, helpful cultural tip related to the translation (maximum 100 words)

Do not include any other text, explanations, or markdown formatting. Return only the JSON object.`;
  }

  /**
   * Get system prompt for image translation
   */
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

  /**
   * Get A/B test chat prompt
   */
  private getABTestChatPrompt(language: string, conversationId: string): string {
    const prompts = [
      `You are Samvaad AI, a helpful and culturally-aware multilingual assistant. Your primary goal is to facilitate clear and respectful communication across Indian cultures.

Key guidelines:
- Respond in ${language} when the user speaks in ${language}
- Provide cultural context when relevant
- Be helpful, respectful, and encouraging
- Keep responses concise but informative
- If asked about something you cannot help with, politely explain your limitations

Remember: You are designed to bridge cultural and linguistic gaps in India. (Version A)`,
      `You are Samvaad AI, a direct and efficient multilingual assistant for campus queries. Focus on providing precise answers quickly.

Key guidelines:
- Respond in ${language} when the user speaks in ${language}
- Be direct and to the point.
- Prioritize factual information over conversational filler.
- If asked about something you cannot help with, state it clearly. (Version B)`,
    ];

    // Simple A/B test: assign based on the last character of conversationId
    const lastChar = conversationId.charCodeAt(conversationId.length - 1);
    const index = lastChar % prompts.length;
    return prompts[index];
  }

  /**
   * Parse JSON response safely
   */
  private parseAIResponse<T>(response: string, fallback: T): T {
    try {
      // Clean the response - remove any markdown code blocks or extra whitespace
      const cleanResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanResponse);
      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', response);
      return fallback;
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * Translate text with cultural context
   */
  async translateText(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string, 
    formalityLevel: string = 'neutral'
  ): Promise<TranslationResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = this.getTranslationPrompt(sourceLanguage, targetLanguage, formalityLevel);
      
      const fullPrompt = `${prompt}

Text to translate: "${text}"`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = response.text();

      const fallback: TranslationResult = {
        translation: `[Translation failed] ${text}`,
        culturalContext: 'Translation service is temporarily unavailable.'
      };

      return this.parseAIResponse(responseText, fallback);
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Translation service failed');
    }
  }

  /**
   * Translate text from image
   */
  async translateImage(
    imagePath: string, 
    targetLanguage: string
  ): Promise<ImageTranslationResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      // Read image file asynchronously
      const imageData = await fs.readFile(imagePath);
      const base64Data = imageData.toString('base64');
      
      const prompt = this.getImageTranslationPrompt(targetLanguage);
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: this.getMimeType(imagePath)
          }
        }
      ]);

      const response = await result.response;
      const responseText = response.text();

      const fallback: ImageTranslationResult = {
        extractedText: 'Failed to extract text',
        translation: 'Translation failed',
        culturalContext: 'Image processing is temporarily unavailable.'
      };

      const result_parsed = this.parseAIResponse(responseText, fallback);

      // Clean up the uploaded file asynchronously
      try {
        await fs.unlink(imagePath);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }

      return result_parsed;
    } catch (error) {
      console.error('Image translation error:', error);
      
      // Attempt to clean up file even on error
      try {
        await fs.unlink(imagePath);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file after error:', unlinkError);
      }
      
      throw new Error('Image translation service failed');
    }
  }

  /**
   * Start or continue chat conversation
   */
  async chatWithAI(config: ChatConfig, messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const { language, conversationId, systemPrompt } = config;
      
      let chat = this.conversationStore.get(conversationId);
      
      if (!chat) {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        // Use provided systemPrompt or determine via A/B test
        const prompt = systemPrompt || this.getABTestChatPrompt(language, conversationId);
        
        chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
            {
              role: "model",
              parts: [{ text: `I understand. I'm Samvaad AI, ready to help you communicate in ${language} with cultural awareness.` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          },
        });
        
        this.conversationStore.set(conversationId, chat);
      }

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error('Chat service failed');
    }
  }

  /**
   * Clear conversation history
   */
  clearConversation(conversationId: string): void {
    this.conversationStore.delete(conversationId);
  }

  /**
   * Chat with AI about a PDF document
   */
  async chatWithPdf(question: string, pdfText: string, language: string = 'en'): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `You are a helpful assistant that answers questions based on the provided text in the specified language.
      Given the following document, please answer the user's question in ${language}.
      
      Document:
      ---
      ${pdfText}
      ---
      
      Question: ${question}
      
      Answer:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Chat with PDF error:', error);
      throw new Error('Chat with PDF service failed');
    }
  }

  /**
   * Get active conversation count
   */
  getActiveConversationCount(): number {
    return this.conversationStore.size;
  }

  /**
   * Get system prompt for campus-specific intent analysis
   */
  private getCampusIntentPrompt(message: string): string {
    return `You are an AI expert at analyzing student queries for a campus chatbot. Your task is to identify the user's intent and extract relevant entities from their message.

    The possible intents are:
    - "fee_payment": Questions about paying fees, deadlines, payment methods.
    - "exam_schedule": Queries about exam dates, timetables, locations.
    - "admission_query": Questions about admission process, eligibility, required documents.
    - "course_information": Queries about specific courses, syllabus, credits.
    - "library_query": Questions about library timings, book availability, fines.
    - "hostel_information": Queries about hostel accommodation, rules, availability.
    - "document_request": Requests for official documents like transcripts, bonafide certificates.
    - "faculty_contact": Asking for contact information of a professor or department.
    - "event_information": Questions about campus events, dates, locations.
    - "human_escalation": When the user explicitly asks to speak to a human or is frustrated.
    - "greeting": A simple greeting.
    - "goodbye": A simple goodbye.
    - "none": If the intent is unclear or not related to campus services.

    Extract entities relevant to the intent. For example:
    - For "fee_payment", entities could be { "fee_type": "tuition", "semester": "fall" }.
    - For "course_information", entities could be { "course_name": "Computer Science 101" }.
    - For "document_request", entities could be { "document_type": "transcript" }.

    Analyze the following message:
    Message: "${message}"

    Respond with a single, valid JSON object with two keys: "intent" (string) and "entities" (object). Do not include any other text, explanations, or markdown.
    `;
  }

  /**
   * Analyze intent and entities from message
   */
  async analyzeIntentAndEntities(message: string): Promise<{ intent: string; entities: any }> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = this.getCampusIntentPrompt(message);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    try {
      // Clean the response - remove any markdown code blocks or extra whitespace
      const cleanResponse = response.text()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const parsedResponse = JSON.parse(cleanResponse);

      // If intent is human_escalation, create a ticket
      if (parsedResponse.intent === 'human_escalation') {
        // userProfileId would ideally come from the authenticated user context
        // For now, we'll use a placeholder or null
        await ticketService.createTicket(
          'unauthenticated_user', // Placeholder user ID
          `Human Escalation Request: ${message.substring(0, 50)}...`,
          message
        );
      }

      return parsedResponse;
    } catch (err) {
      console.error("Failed to parse intent from AI response:", err);
      console.error("Raw intent response:", response.text());
      return { intent: "none", entities: {} };
    }
  }
}

// Create and export singleton instance
export const aiService = new AIService();

  /**
   * Parse JSON response safely
   */
  private parseAIResponse<T>(response: string, fallback: T): T {
    try {
      // Clean the response - remove any markdown code blocks or extra whitespace
      const cleanResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanResponse);
      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', response);
      return fallback;
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * Translate text with cultural context
   */
  async translateText(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string, 
    formalityLevel: string = 'neutral'
  ): Promise<TranslationResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = this.getTranslationPrompt(sourceLanguage, targetLanguage, formalityLevel);
      
      const fullPrompt = `${prompt}\n\nText to translate: "${text}"`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = response.text();

      const fallback: TranslationResult = {
        translation: `[Translation failed] ${text}`,
        culturalContext: 'Translation service is temporarily unavailable.'
      };

      return this.parseAIResponse(responseText, fallback);
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Translation service failed');
    }
  }

  /**
   * Translate text from image
   */
  async translateImage(
    imagePath: string, 
    targetLanguage: string
  ): Promise<ImageTranslationResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      // Read image file asynchronously
      const imageData = await fs.readFile(imagePath);
      const base64Data = imageData.toString('base64');
      
      const prompt = this.getImageTranslationPrompt(targetLanguage);
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: this.getMimeType(imagePath)
          }
        }
      ]);

      const response = await result.response;
      const responseText = response.text();

      const fallback: ImageTranslationResult = {
        extractedText: 'Failed to extract text',
        translation: 'Translation failed',
        culturalContext: 'Image processing is temporarily unavailable.'
      };

      const result_parsed = this.parseAIResponse(responseText, fallback);

      // Clean up the uploaded file asynchronously
      try {
        await fs.unlink(imagePath);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }

      return result_parsed;
    } catch (error) {
      console.error('Image translation error:', error);
      
      // Attempt to clean up file even on error
      try {
        await fs.unlink(imagePath);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file after error:', unlinkError);
      }
      
      throw new Error('Image translation service failed');
    }
  }

  /**
   * Start or continue chat conversation
   */
  async chatWithAI(config: ChatConfig, messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const { language, conversationId, systemPrompt } = config;
      
      let chat = this.conversationStore.get(conversationId);
      
      if (!chat) {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = systemPrompt || this.getChatPrompt(language);
        
        chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
            {
              role: "model",
              parts: [{ text: `I understand. I'm Samvaad AI, ready to help you communicate in ${language} with cultural awareness.` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          },
        });
        
        this.conversationStore.set(conversationId, chat);
      }

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error('Chat service failed');
    }
  }

  /**
   * Clear conversation history
   */
  clearConversation(conversationId: string): void {
    this.conversationStore.delete(conversationId);
  }

  /**
   * Chat with AI about a PDF document
   */
  async chatWithPdf(question: string, pdfText: string, language: string = 'en'): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `You are a helpful assistant that answers questions based on the provided text in the specified language.
      Given the following document, please answer the user's question in ${language}.
      
      Document:
      ---
      ${pdfText}
      ---
      
      Question: ${question}
      
      Answer:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Chat with PDF error:', error);
      throw new Error('Chat with PDF service failed');
    }
  }

  /**
   * Get active conversation count
   */
  getActiveConversationCount(): number {
    return this.conversationStore.size;
  }

  /**
   * Analyze intent and entities from message
   */
  async analyzeIntentAndEntities(message: string): Promise<{ intent: string; entities: any }> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = this.getCampusIntentPrompt(message);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    try {
      // Clean the response - remove any markdown code blocks or extra whitespace
      const cleanResponse = response.text()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const parsedResponse = JSON.parse(cleanResponse);

      // If intent is human_escalation, create a ticket
      if (parsedResponse.intent === 'human_escalation') {
        // userProfileId would ideally come from the authenticated user context
        // For now, we'll use a placeholder or null
        await ticketService.createTicket(
          'unauthenticated_user', // Placeholder user ID
          `Human Escalation Request: ${message.substring(0, 50)}...`,
          message
        );
      }

      return parsedResponse;
    } catch (err) {
      console.error("Failed to parse intent from AI response:", err);
      console.error("Raw intent response:", response.text());
      return { intent: "none", entities: {} };
    }
  }
}

// Create and export singleton instance
export const aiService = new AIService();