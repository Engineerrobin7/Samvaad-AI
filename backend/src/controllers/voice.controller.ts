// backend/src/controllers/voice.controller.ts
import { Request, Response } from 'express';
import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech'; // New import
import fs from 'fs';
import path from 'path';

// Instantiates clients
const speechClient = new SpeechClient(); // Renamed from 'client'
const ttsClient = new TextToSpeechClient(); // New client

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

    const [response] = await speechClient.recognize(request); // Use speechClient
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join('\n');

    fs.unlinkSync(audioFilePath); // Clean up the uploaded file

    res.json({ transcription });
  } catch (error: any) {
    console.error('ERROR:', error);
    if (fs.existsSync(audioFilePath)) { // Check if file exists before trying to delete
      fs.unlinkSync(audioFilePath); // Clean up the uploaded file even on error
    }
    res.status(500).json({ message: 'Speech-to-Text failed.', error: error.message });
  }
};

// New function for Text-to-Speech
export const textToSpeech = async (req: Request, res: Response) => {
  const { text, languageCode = 'en-US', voiceName } = req.body; // voiceName is optional

  if (!text) {
    return res.status(400).json({ message: 'Text is required for Text-to-Speech.' });
  }

  try {
    const request = {
      input: { text: text },
      voice: { languageCode: languageCode, name: voiceName }, // name is optional
      audioConfig: { audioEncoding: 'MP3' as const }, // Use 'as const' for literal type
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    // The audio content is a base64 encoded string
    const audioContent = response.audioContent?.toString('base64');

    res.json({ audioContent });
  } catch (error: any) {
    console.error('ERROR:', error);
    res.status(500).json({ message: 'Text-to-Speech failed.', error: error.message });
  }
};