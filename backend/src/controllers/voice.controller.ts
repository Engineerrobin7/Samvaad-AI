import { Request, Response } from 'express';
import { voiceService } from '../services/voice.service';
import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: 'uploads/audio/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /wav|mp3|ogg|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

export const uploadMiddleware = upload.single('audio');

export const speechToText = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required',
      });
    }

    const { language = 'en' } = req.body;
    const text = await voiceService.speechToText(req.file.path, language);

    return res.status(200).json({
      success: true,
      data: { text },
    });
  } catch (error) {
    console.error('Speech to text error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to convert speech to text',
    });
  }
};

export const textToSpeech = async (req: Request, res: Response) => {
  try {
    const { text, language = 'en', voiceGender = 'FEMALE' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    const audioBuffer = await voiceService.textToSpeech(text, language, voiceGender);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });

    return res.send(audioBuffer);
  } catch (error) {
    console.error('Text to speech error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to convert text to speech',
    });
  }
};

export const translateVoice = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required',
      });
    }

    const { sourceLanguage, targetLanguage } = req.body;

    if (!sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Source and target languages are required',
      });
    }

    const result = await voiceService.translateVoice(
      req.file.path,
      sourceLanguage,
      targetLanguage
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Voice translation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to translate voice',
    });
  }
};
