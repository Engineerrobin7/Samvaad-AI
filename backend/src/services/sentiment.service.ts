// Sentiment analysis and tone adjustment service
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  emotions: string[];
  confidence: number;
}

interface ToneAdjustmentResult {
  originalText: string;
  adjustedText: string;
  tone: string;
  changes: string[];
}

class SentimentService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string, language: string = 'en'): Promise<SentimentResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Analyze the sentiment of the following text in ${language}.
      
Text: "${text}"

Respond with a JSON object containing:
1. "sentiment": one of "positive", "negative", or "neutral"
2. "score": a number from -1 (very negative) to 1 (very positive)
3. "emotions": array of detected emotions (e.g., ["happy", "excited", "grateful"])
4. "confidence": confidence score from 0 to 1

Return only the JSON object.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const parsed = this.parseJSON(responseText, {
        sentiment: 'neutral',
        score: 0,
        emotions: [],
        confidence: 0.5,
      });

      return parsed;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw new Error('Sentiment analysis failed');
    }
  }

  /**
   * Adjust tone of text
   */
  async adjustTone(
    text: string,
    targetTone: 'formal' | 'casual' | 'polite' | 'friendly' | 'professional' | 'empathetic',
    language: string = 'en'
  ): Promise<ToneAdjustmentResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Adjust the tone of the following text to be more ${targetTone} while preserving the core message.
Language: ${language}

Original text: "${text}"

Respond with a JSON object containing:
1. "originalText": the original text
2. "adjustedText": the text with adjusted tone
3. "tone": the target tone
4. "changes": array of key changes made (e.g., ["Changed 'hey' to 'hello'", "Added polite phrases"])

Return only the JSON object.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const parsed = this.parseJSON(responseText, {
        originalText: text,
        adjustedText: text,
        tone: targetTone,
        changes: [],
      });

      return parsed;
    } catch (error) {
      console.error('Tone adjustment error:', error);
      throw new Error('Tone adjustment failed');
    }
  }

  /**
   * Detect formality level
   */
  async detectFormality(text: string, language: string = 'en'): Promise<{
    level: 'very_formal' | 'formal' | 'neutral' | 'casual' | 'very_casual';
    score: number;
    indicators: string[];
  }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Analyze the formality level of this text in ${language}:

"${text}"

Respond with JSON:
{
  "level": one of "very_formal", "formal", "neutral", "casual", "very_casual",
  "score": number from 0 (very casual) to 1 (very formal),
  "indicators": array of phrases that indicate the formality level
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      return this.parseJSON(responseText, {
        level: 'neutral',
        score: 0.5,
        indicators: [],
      });
    } catch (error) {
      console.error('Formality detection error:', error);
      throw new Error('Formality detection failed');
    }
  }

  /**
   * Parse JSON safely
   */
  private parseJSON<T>(response: string, fallback: T): T {
    try {
      const cleanResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return fallback;
    }
  }
}

export const sentimentService = new SentimentService();
