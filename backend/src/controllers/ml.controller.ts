import { Request, Response } from 'express';
import mlService from '../services/ml.service.js';

export const assessTranslationQuality = async (req: Request, res: Response) => {
  try {
    const { sourceText, translatedText, sourceLang, targetLang } = req.body;

    if (!sourceText || !translatedText || !sourceLang || !targetLang) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const quality = await mlService.assessTranslationQuality(
      sourceText,
      translatedText,
      sourceLang,
      targetLang
    );

    res.json(quality);
  } catch (error) {
    console.error('Quality assessment error:', error);
    res.status(500).json({ error: 'Failed to assess translation quality' });
  }
};

export const getSmartSuggestions = async (req: Request, res: Response) => {
  try {
    const { sourceText, sourceLang, targetLang, context } = req.body;

    if (!sourceText || !sourceLang || !targetLang) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const suggestions = await mlService.generateSmartSuggestions(
      sourceText,
      sourceLang,
      targetLang,
      context
    );

    res.json({ suggestions });
  } catch (error) {
    console.error('Smart suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
};

export const predictBestTranslation = async (req: Request, res: Response) => {
  try {
    const { sourceText, translations, sourceLang, targetLang } = req.body;

    if (!sourceText || !translations || !sourceLang || !targetLang) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prediction = await mlService.predictBestTranslation(
      sourceText,
      translations,
      sourceLang,
      targetLang
    );

    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to predict best translation' });
  }
};

export const analyzeUserPatterns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const patterns = await mlService.analyzeUserTranslationPatterns(userId);

    res.json(patterns);
  } catch (error) {
    console.error('Pattern analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze patterns' });
  }
};

export const assessProficiency = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { language } = req.params;

    if (!language) {
      return res.status(400).json({ error: 'Language parameter required' });
    }

    const proficiency = await mlService.assessLanguageProficiency(userId, language);

    res.json(proficiency);
  } catch (error) {
    console.error('Proficiency assessment error:', error);
    res.status(500).json({ error: 'Failed to assess proficiency' });
  }
};

export const generateLearningPath = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { targetLanguage, currentLevel } = req.body;

    if (!targetLanguage || !currentLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const learningPath = await mlService.generateLearningPath(
      userId,
      targetLanguage,
      currentLevel
    );

    res.json(learningPath);
  } catch (error) {
    console.error('Learning path error:', error);
    res.status(500).json({ error: 'Failed to generate learning path' });
  }
};

export const detectErrors = async (req: Request, res: Response) => {
  try {
    const { translatedText, targetLanguage } = req.body;

    if (!translatedText || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const errorAnalysis = await mlService.detectAndCorrectErrors(
      translatedText,
      targetLanguage
    );

    res.json(errorAnalysis);
  } catch (error) {
    console.error('Error detection error:', error);
    res.status(500).json({ error: 'Failed to detect errors' });
  }
};

export const predictLearningNeeds = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const needs = await mlService.predictLearningNeeds(userId);

    res.json(needs);
  } catch (error) {
    console.error('Learning needs prediction error:', error);
    res.status(500).json({ error: 'Failed to predict learning needs' });
  }
};

export const adjustBySentiment = async (req: Request, res: Response) => {
  try {
    const { text, targetSentiment, targetLanguage } = req.body;

    if (!text || !targetSentiment || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const adjusted = await mlService.adjustTranslationBySentiment(
      text,
      targetSentiment,
      targetLanguage
    );

    res.json(adjusted);
  } catch (error) {
    console.error('Sentiment adjustment error:', error);
    res.status(500).json({ error: 'Failed to adjust by sentiment' });
  }
};
