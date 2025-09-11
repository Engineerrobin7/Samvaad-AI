// src/controllers/ai.controller.ts
import { Request, Response } from 'express';
import  pool from '../db/pool';
import { aiService } from '../services/ai.service';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

/**
 * Translate text with cultural context
 * @route POST /api/ai/translate
 */
export const translateText = async (req: Request, res: Response) => {
  try {
    const { text, sourceLanguage, targetLanguage, formalityLevel } = req.body;
    const userId = (req as any).user?.id;

    if (!text || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Text, source language, and target language are required'
      });
    }

    const result = await aiService.translateText(text, sourceLanguage, targetLanguage, formalityLevel);

    // Log translation for analytics
    if (userId) {
      try {
        await pool.query(
          'INSERT INTO ai_conversation_logs (conversation_id, user_id, model, message, reply, language) VALUES ($1, $2, $3, $4, $5, $6)',
          [`translate-${Date.now()}`, userId, 'gemini-translate', text, result.translation, targetLanguage]
        );
      } catch (logError) {
        console.error('Failed to log translation:', logError);
      }
    }

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: result.translation,
        sourceLanguage,
        targetLanguage,
        formalityLevel,
        culturalContext: result.culturalContext
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Translation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Translate image with cultural context
 * @route POST /api/ai/translate-image
 */
export const translateImage = async (req: Request, res: Response) => {
  try {
    const { targetLanguage } = req.body;
    const userId = (req as any).user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Target language is required'
      });
    }

    const result = await aiService.translateImage(file.path, targetLanguage);

    // Log image translation for analytics
    if (userId) {
      try {
        await pool.query(
          'INSERT INTO ai_conversation_logs (conversation_id, user_id, model, message, reply, language) VALUES ($1, $2, $3, $4, $5, $6)',
          [`image-translate-${Date.now()}`, userId, 'gemini-vision', result.extractedText, result.translation, targetLanguage]
        );
      } catch (logError) {
        console.error('Failed to log image translation:', logError);
      }
    }

    res.json({
      success: true,
      data: {
        extractedText: result.extractedText,
        translatedText: result.translation,
        targetLanguage,
        culturalContext: result.culturalContext
      }
    });
  } catch (error) {
    console.error('Image translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Image translation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Chat with AI assistant
 * @route POST /api/ai/chat
 */
export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { messages, language, conversationId } = req.body;
    const userId = (req as any).user?.id;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required'
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }

    const chatConfig = {
      language: language || 'en',
      conversationId
    };

    const reply = await aiService.chatWithAI(chatConfig, messages);

    // Log conversation for analytics
    if (userId) {
      try {
        const lastMessage = messages[messages.length - 1];
        await pool.query(
          'INSERT INTO ai_conversation_logs (conversation_id, user_id, model, message, reply, language) VALUES ($1, $2, $3, $4, $5, $6)',
          [conversationId, userId, 'gemini-chat', lastMessage.content, reply, language || 'en']
        );
      } catch (logError) {
        console.error('Failed to log chat:', logError);
      }
    }

    res.json({
      success: true,
      data: {
        reply,
        conversationId
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Chat failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Clear chat conversation
 * @route DELETE /api/ai/chat/:conversationId
 */
export const clearChat = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }

    aiService.clearConversation(conversationId);

    res.json({
      success: true,
      message: 'Conversation cleared'
    });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear conversation'
    });
  }
};