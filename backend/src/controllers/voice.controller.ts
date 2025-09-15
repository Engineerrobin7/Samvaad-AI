// backend/src/controllers/voice.controller.ts
import { Request, Response } from 'express';
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';
import path from 'path';

// Instantiates a client
const client = new SpeechClient();

export const speechToText = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No audio file uploaded.' });
  }

  const audioFilePath = req.file.path;
  const encoding = 'LINEAR16'; // Or 'FLAC', 'MULAW', etc. based on your audio format
  const sampleRateHertz = 16000; // Adjust based on your audio
  const languageCode = req.body.languageCode || 'en-US'; // e.g., 'en-US', 'es-ES'

  try {
    const audio = fs.readFileSync(audioFilePath).toString('base64');

    const request = {
      audio: {
        content: audio,
      },
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join('\n');

    fs.unlinkSync(audioFilePath); // Clean up the uploaded file

    res.json({ transcription });
  } catch (error) {
    console.error('ERROR:', error);
    fs.unlinkSync(audioFilePath); // Clean up the uploaded file even on error
    res.status(500).json({ message: 'Speech-to-Text failed.', error: error.message });
  }
};
