import { Request, Response } from 'express';
import redisClient from '../config/redis';

// Mock language detection data
const languagePatterns: Record<string, RegExp> = {
  'hi': /[\u0900-\u097F]/,  // Hindi
  'bn': /[\u0980-\u09FF]/,  // Bengali
  'te': /[\u0C00-\u0C7F]/,  // Telugu
  'mr': /[\u0900-\u097F]/,  // Marathi (shares Devanagari with Hindi)
  'ta': /[\u0B80-\u0BFF]/,  // Tamil
  'gu': /[\u0A80-\u0AFF]/,  // Gujarati
  'kn': /[\u0C80-\u0CFF]/,  // Kannada
  'ml': /[\u0D00-\u0D7F]/,  // Malayalam
  'pa': /[\u0A00-\u0A7F]/,  // Punjabi
};

// Mock cultural context data
const culturalContexts: Record<string, string[]> = {
  'hi': [
    'In Hindi, formal speech uses "आप" (aap) while informal uses "तुम" (tum) or "तू" (tu).',
    'Namaste (नमस्ते) is a common greeting that literally means "I bow to the divine in you".',
    'Hindi is the official language of India along with English and is spoken by over 500 million people.'
  ],
  'bn': [
    'Bengali uses "আপনি" (apni) for formal address and "তুমি" (tumi) for informal.',
    'Nomoshkar (নমস্কার) is a common formal greeting in Bengali.',
    'Bengali is the official language of Bangladesh and the Indian states of West Bengal and Tripura.'
  ],
  'te': [
    'Telugu uses "మీరు" (meeru) for formal address and "నువ్వు" (nuvvu) for informal.',
    'Namaskaram (నమస్కారం) is a common formal greeting in Telugu.',
    'Telugu is primarily spoken in Andhra Pradesh and Telangana.'
  ]
};

/**
 * Translate text with cultural context
 * @route POST /api/translate
 */
export const translateText = async (req: Request, res: Response) => {
  try {
    const { text, sourceLanguage, targetLanguage, formalityLevel } = req.body;
    
    if (!text || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text, source language, and target language are required' 
      });
    }
    
    // Check cache first
    const cacheKey = `translate:${sourceLanguage}:${targetLanguage}:${formalityLevel}:${text}`;
    const cachedResult = await redisClient.get(cacheKey);
    
    if (cachedResult) {
      return res.status(200).json(JSON.parse(cachedResult));
    }
    
    // Mock translation - In a real implementation, this would call an AI API
    const translatedText = `This is a mock translation from ${sourceLanguage} to ${targetLanguage} with ${formalityLevel} formality.`;
    
    // Get random cultural context
    const culturalContext = culturalContexts[targetLanguage] 
      ? culturalContexts[targetLanguage][Math.floor(Math.random() * culturalContexts[targetLanguage].length)]
      : 'No specific cultural context available for this language.';
    
    const result = {
      success: true,
      data: {
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
        formalityLevel,
        culturalContext
      }
    };
    
    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(result), {
      EX: 3600 // Expire in 1 hour
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing translation request' 
    });
  }
};

/**
 * Detect language of text
 * @route POST /api/translate/detect
 */
export const detectLanguage = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required' 
      });
    }
    
    // Simple language detection based on character sets
    let detectedLanguage = 'en'; // Default to English
    
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        detectedLanguage = lang;
        break;
      }
    }
    
    return res.status(200).json({
      success: true,
      data: {
        detectedLanguage,
        confidence: 0.9 // Mock confidence score
      }
    });
  } catch (error) {
    console.error('Language detection error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error detecting language' 
    });
  }
};