import { Request, Response } from 'express';
import redisClient from '../config/redis';

// Mock cultural tips data
const culturalTips: Record<string, any[]> = {
  'hi': [
    {
      id: 'hi-1',
      title: 'Greeting Etiquette',
      content: 'In Hindi culture, "Namaste" with folded hands is a respectful greeting for all ages and social statuses.',
      category: 'social',
      difficulty: 'beginner'
    },
    {
      id: 'hi-2',
      title: 'Formal vs Informal Speech',
      content: 'Hindi has three levels of formality: "आप" (aap) for formal/respectful, "तुम" (tum) for friends/family, and "तू" (tu) for very close relationships or children.',
      category: 'language',
      difficulty: 'intermediate'
    },
    {
      id: 'hi-3',
      title: 'Festival Greetings',
      content: 'During Diwali, say "Diwali ki Shubhkamnayein" (दिवाली की शुभकामनाएं) for formal wishes or "Happy Diwali" in casual settings.',
      category: 'festivals',
      difficulty: 'beginner'
    }
  ],
  'bn': [
    {
      id: 'bn-1',
      title: 'Bengali Greetings',
      content: 'In Bengali culture, "Nomoshkar" (নমস্কার) with folded hands is the traditional greeting, while "Kemon acho?" (কেমন আছো?) means "How are you?"',
      category: 'social',
      difficulty: 'beginner'
    },
    {
      id: 'bn-2',
      title: 'Respect for Elders',
      content: 'Bengali culture places high importance on respecting elders. Address older people with "apni" (আপনি) rather than "tumi" (তুমি).',
      category: 'social',
      difficulty: 'beginner'
    }
  ],
  'te': [
    {
      id: 'te-1',
      title: 'Telugu Greetings',
      content: 'In Telugu, "Namaskaram" (నమస్కారం) is a formal greeting, while "Baagunnara?" (బాగున్నారా?) means "How are you?"',
      category: 'social',
      difficulty: 'beginner'
    },
    {
      id: 'te-2',
      title: 'Telugu Festivals',
      content: 'During Sankranti, a major harvest festival, Telugu people exchange "Sankranti Shubhakankshalu" (సంక్రాంతి శుభాకాంక్షలు) as greetings.',
      category: 'festivals',
      difficulty: 'intermediate'
    }
  ]
};

// Mock language learning tips
const languageTips: Record<string, any[]> = {
  'hi': [
    {
      id: 'hi-lang-1',
      title: 'Hindi Pronunciation',
      content: 'Hindi has retroflex consonants (ट, ठ, ड, ढ) that are pronounced with the tongue curled back.',
      category: 'pronunciation',
      difficulty: 'beginner'
    },
    {
      id: 'hi-lang-2',
      title: 'Hindi Sentence Structure',
      content: 'Hindi follows Subject-Object-Verb order, unlike English which uses Subject-Verb-Object.',
      category: 'grammar',
      difficulty: 'intermediate'
    }
  ],
  'bn': [
    {
      id: 'bn-lang-1',
      title: 'Bengali Vowels',
      content: 'Bengali has 7 vowels with both oral and nasal forms, making pronunciation challenging for beginners.',
      category: 'pronunciation',
      difficulty: 'intermediate'
    },
    {
      id: 'bn-lang-2',
      title: 'Bengali Script',
      content: 'Bengali script is derived from the eastern Nagari script and has rounded shapes due to the traditional writing materials used.',
      category: 'writing',
      difficulty: 'beginner'
    }
  ],
  'te': [
    {
      id: 'te-lang-1',
      title: 'Telugu Alphabet',
      content: 'Telugu has 56 letters: 16 vowels, 3 vowel modifiers, and 37 consonants.',
      category: 'writing',
      difficulty: 'beginner'
    },
    {
      id: 'te-lang-2',
      title: 'Telugu Pronunciation',
      content: 'Telugu distinguishes between short and long vowels, which can change the meaning of words.',
      category: 'pronunciation',
      difficulty: 'intermediate'
    }
  ]
};

/**
 * Get cultural tips for a specific language
 * @route GET /api/tips/cultural/:language
 */
export const getCulturalTips = async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const { category, difficulty } = req.query;
    
    // Check cache first
    const cacheKey = `tips:cultural:${language}:${category || 'all'}:${difficulty || 'all'}`;
    const cachedResult = await redisClient.get(cacheKey);
    
    if (cachedResult) {
      return res.status(200).json(JSON.parse(cachedResult));
    }
    
    // Get tips for the specified language
    let tips = culturalTips[language] || [];
    
    // Filter by category if provided
    if (category) {
      tips = tips.filter(tip => tip.category === category);
    }
    
    // Filter by difficulty if provided
    if (difficulty) {
      tips = tips.filter(tip => tip.difficulty === difficulty);
    }
    
    const result = {
      success: true,
      data: {
        language,
        tips
      }
    };
    
    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(result), {
      EX: 3600 // Expire in 1 hour
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Get cultural tips error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting cultural tips' 
    });
  }
};

/**
 * Get language learning tips
 * @route GET /api/tips/language/:language
 */
export const getLanguageTips = async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const { category, difficulty } = req.query;
    
    // Check cache first
    const cacheKey = `tips:language:${language}:${category || 'all'}:${difficulty || 'all'}`;
    const cachedResult = await redisClient.get(cacheKey);
    
    if (cachedResult) {
      return res.status(200).json(JSON.parse(cachedResult));
    }
    
    // Get tips for the specified language
    let tips = languageTips[language] || [];
    
    // Filter by category if provided
    if (category) {
      tips = tips.filter(tip => tip.category === category);
    }
    
    // Filter by difficulty if provided
    if (difficulty) {
      tips = tips.filter(tip => tip.difficulty === difficulty);
    }
    
    const result = {
      success: true,
      data: {
        language,
        tips
      }
    };
    
    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(result), {
      EX: 3600 // Expire in 1 hour
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Get language tips error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting language tips' 
    });
  }
};