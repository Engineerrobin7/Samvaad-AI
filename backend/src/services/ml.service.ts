import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../db/pool.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface TranslationQuality {
  score: number;
  fluency: number;
  accuracy: number;
  culturalRelevance: number;
  suggestions: string[];
}

interface SmartSuggestion {
  text: string;
  confidence: number;
  reasoning: string;
}

interface LanguageProficiency {
  level: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export class MLService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  // AI-powered translation quality assessment
  async assessTranslationQuality(
    sourceText: string,
    translatedText: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationQuality> {
    try {
      const prompt = `
Analyze this translation quality:
Source (${sourceLang}): "${sourceText}"
Translation (${targetLang}): "${translatedText}"

Provide a detailed assessment with scores (0-100) for:
1. Overall quality score
2. Fluency (how natural it sounds)
3. Accuracy (meaning preservation)
4. Cultural relevance

Also provide 3 specific improvement suggestions.

Format as JSON:
{
  "score": number,
  "fluency": number,
  "accuracy": number,
  "culturalRelevance": number,
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback
      return {
        score: 75,
        fluency: 75,
        accuracy: 75,
        culturalRelevance: 75,
        suggestions: ['Consider context', 'Check idioms', 'Verify tone']
      };
    } catch (error) {
      console.error('Quality assessment error:', error);
      throw error;
    }
  }

  // Smart translation suggestions using ML
  async generateSmartSuggestions(
    sourceText: string,
    sourceLang: string,
    targetLang: string,
    context?: string
  ): Promise<SmartSuggestion[]> {
    try {
      const prompt = `
Generate 3 alternative translations for:
Source (${sourceLang}): "${sourceText}"
Target language: ${targetLang}
${context ? `Context: ${context}` : ''}

For each translation, provide:
1. The translated text
2. Confidence score (0-100)
3. Brief reasoning

Format as JSON array:
[
  {
    "text": "translation",
    "confidence": number,
    "reasoning": "why this translation works"
  }
]
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      console.error('Smart suggestions error:', error);
      throw error;
    }
  }

  // Predict best translation from multiple options using ML
  async predictBestTranslation(
    sourceText: string,
    translations: Array<{ text: string; votes: number; userId: string }>,
    sourceLang: string,
    targetLang: string
  ): Promise<{ bestTranslation: string; confidence: number; reasoning: string }> {
    try {
      const translationsList = translations
        .map((t, i) => `${i + 1}. "${t.text}" (${t.votes} votes)`)
        .join('\n');

      const prompt = `
Analyze these translation options for:
Source (${sourceLang}): "${sourceText}"
Target: ${targetLang}

Options:
${translationsList}

Determine the best translation considering:
- Accuracy
- Fluency
- Cultural appropriateness
- Natural language usage

Respond in JSON:
{
  "bestTranslation": "the best option text",
  "confidence": number (0-100),
  "reasoning": "why this is best"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        bestTranslation: translations[0].text,
        confidence: 50,
        reasoning: 'Default selection'
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  // Detect translation patterns and learn from user behavior
  async analyzeUserTranslationPatterns(userId: string): Promise<{
    commonMistakes: string[];
    preferredStyle: string;
    improvementAreas: string[];
    strengths: string[];
  }> {
    try {
      // Get user's translation history
      const result = await pool.query(
        `SELECT source_text, translated_text, source_language, target_language
         FROM translation_history
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId]
      );

      const translations = result.rows;

      if (translations.length === 0) {
        return {
          commonMistakes: [],
          preferredStyle: 'neutral',
          improvementAreas: ['Build more translation history'],
          strengths: []
        };
      }

      const prompt = `
Analyze these user translations to identify patterns:

${translations.slice(0, 10).map((t: any, i: number) => 
  `${i + 1}. ${t.source_language} → ${t.target_language}: "${t.source_text}" → "${t.translated_text}"`
).join('\n')}

Identify:
1. Common mistakes or patterns
2. Preferred translation style (formal/casual/technical)
3. Areas for improvement
4. User's strengths

Format as JSON:
{
  "commonMistakes": ["mistake1", "mistake2"],
  "preferredStyle": "style description",
  "improvementAreas": ["area1", "area2"],
  "strengths": ["strength1", "strength2"]
}
`;

      const aiResult = await this.model.generateContent(prompt);
      const response = aiResult.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        commonMistakes: [],
        preferredStyle: 'neutral',
        improvementAreas: [],
        strengths: []
      };
    } catch (error) {
      console.error('Pattern analysis error:', error);
      throw error;
    }
  }

  // Assess user's language proficiency using ML
  async assessLanguageProficiency(
    userId: string,
    language: string
  ): Promise<LanguageProficiency> {
    try {
      // Get user's quiz results and translations
      const quizResults = await pool.query(
        `SELECT score, total_questions, created_at
         FROM quiz_results
         WHERE user_id = $1 AND language = $2
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId, language]
      );

      const translations = await pool.query(
        `SELECT source_text, translated_text
         FROM translation_history
         WHERE user_id = $1 AND target_language = $2
         ORDER BY created_at DESC
         LIMIT 20`,
        [userId, language]
      );

      const avgQuizScore = quizResults.rows.length > 0
        ? quizResults.rows.reduce((sum: number, r: any) => 
            sum + (r.score / r.total_questions * 100), 0) / quizResults.rows.length
        : 0;

      const prompt = `
Assess language proficiency for ${language} based on:

Quiz Performance:
- Average score: ${avgQuizScore.toFixed(1)}%
- Quizzes taken: ${quizResults.rows.length}

Recent Translations: ${translations.rows.length}

Provide assessment in JSON:
{
  "level": "Beginner/Intermediate/Advanced/Expert",
  "score": number (0-100),
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["rec1", "rec2", "rec3"]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        level: 'Beginner',
        score: avgQuizScore,
        strengths: [],
        weaknesses: [],
        recommendations: ['Practice more', 'Take quizzes', 'Read in target language']
      };
    } catch (error) {
      console.error('Proficiency assessment error:', error);
      throw error;
    }
  }

  // Generate personalized learning path using ML
  async generateLearningPath(
    userId: string,
    targetLanguage: string,
    currentLevel: string
  ): Promise<{
    modules: Array<{
      title: string;
      description: string;
      difficulty: string;
      estimatedTime: string;
      topics: string[];
    }>;
    estimatedCompletionTime: string;
  }> {
    try {
      const prompt = `
Create a personalized learning path for:
- Target Language: ${targetLanguage}
- Current Level: ${currentLevel}

Generate 5 learning modules with:
1. Title
2. Description
3. Difficulty level
4. Estimated time
5. Key topics (3-5)

Also provide total estimated completion time.

Format as JSON:
{
  "modules": [
    {
      "title": "module title",
      "description": "what student will learn",
      "difficulty": "easy/medium/hard",
      "estimatedTime": "X hours",
      "topics": ["topic1", "topic2", "topic3"]
    }
  ],
  "estimatedCompletionTime": "X weeks"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        modules: [],
        estimatedCompletionTime: '4 weeks'
      };
    } catch (error) {
      console.error('Learning path error:', error);
      throw error;
    }
  }

  // Detect and correct common translation errors using ML
  async detectAndCorrectErrors(
    translatedText: string,
    targetLanguage: string
  ): Promise<{
    hasErrors: boolean;
    errors: Array<{ type: string; description: string; suggestion: string }>;
    correctedText: string;
  }> {
    try {
      const prompt = `
Analyze this ${targetLanguage} translation for errors:
"${translatedText}"

Check for:
1. Grammar errors
2. Spelling mistakes
3. Unnatural phrasing
4. Cultural inappropriateness
5. Missing context

Provide:
- List of errors with suggestions
- Corrected version

Format as JSON:
{
  "hasErrors": boolean,
  "errors": [
    {
      "type": "grammar/spelling/phrasing/cultural",
      "description": "what's wrong",
      "suggestion": "how to fix"
    }
  ],
  "correctedText": "corrected version"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        hasErrors: false,
        errors: [],
        correctedText: translatedText
      };
    } catch (error) {
      console.error('Error detection error:', error);
      throw error;
    }
  }

  // Predict user's next learning needs using ML
  async predictLearningNeeds(userId: string): Promise<{
    suggestedTopics: string[];
    recommendedExercises: string[];
    focusAreas: string[];
    motivationalMessage: string;
  }> {
    try {
      // Get user activity
      const activity = await pool.query(
        `SELECT activity_type, created_at
         FROM activity_log
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId]
      );

      const progress = await pool.query(
        `SELECT level, xp, streak, badges
         FROM user_progress
         WHERE user_id = $1`,
        [userId]
      );

      const userProgress = progress.rows[0] || { level: 1, xp: 0, streak: 0 };

      const prompt = `
Based on user progress:
- Level: ${userProgress.level}
- XP: ${userProgress.xp}
- Streak: ${userProgress.streak} days
- Recent activities: ${activity.rows.length}

Predict learning needs and provide:
1. 3-5 suggested topics to study next
2. 3-5 recommended exercises
3. 2-3 focus areas for improvement
4. Motivational message

Format as JSON:
{
  "suggestedTopics": ["topic1", "topic2", "topic3"],
  "recommendedExercises": ["exercise1", "exercise2"],
  "focusAreas": ["area1", "area2"],
  "motivationalMessage": "encouraging message"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        suggestedTopics: ['Basic vocabulary', 'Common phrases', 'Grammar fundamentals'],
        recommendedExercises: ['Daily practice', 'Quiz yourself', 'Read articles'],
        focusAreas: ['Consistency', 'Practice'],
        motivationalMessage: 'Keep up the great work!'
      };
    } catch (error) {
      console.error('Learning needs prediction error:', error);
      throw error;
    }
  }

  // Sentiment-aware translation adjustment
  async adjustTranslationBySentiment(
    text: string,
    targetSentiment: string,
    targetLanguage: string
  ): Promise<{ adjustedText: string; sentimentScore: number }> {
    try {
      const prompt = `
Adjust this translation to match ${targetSentiment} sentiment:
Original: "${text}"
Target language: ${targetLanguage}

Provide adjusted version that conveys ${targetSentiment} tone while maintaining meaning.

Format as JSON:
{
  "adjustedText": "adjusted translation",
  "sentimentScore": number (-1 to 1, where -1 is very negative, 1 is very positive)
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        adjustedText: text,
        sentimentScore: 0
      };
    } catch (error) {
      console.error('Sentiment adjustment error:', error);
      throw error;
    }
  }
}

export default new MLService();
