import { Request, Response } from 'express';
import { sentimentService } from '../services/sentiment.service';

export const analyzeSentiment = async (req: Request, res: Response) => {
  try {
    const { text, language = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    const result = await sentimentService.analyzeSentiment(text, language);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze sentiment',
    });
  }
};

export const adjustTone = async (req: Request, res: Response) => {
  try {
    const { text, targetTone, language = 'en' } = req.body;

    if (!text || !targetTone) {
      return res.status(400).json({
        success: false,
        message: 'Text and target tone are required',
      });
    }

    const result = await sentimentService.adjustTone(text, targetTone, language);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Tone adjustment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to adjust tone',
    });
  }
};

export const detectFormality = async (req: Request, res: Response) => {
  try {
    const { text, language = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    const result = await sentimentService.detectFormality(text, language);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Formality detection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to detect formality',
    });
  }
};
