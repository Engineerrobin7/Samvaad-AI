// backend/src/controllers/voice.controller.ts
import { Request, Response } from 'express';
import { SpeechClient } from '@google-cloud/speech';
import { protos } from '@google-cloud/speech'; // Add protos import for types
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
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
  const encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16;
  const sampleRateHertz = 16000;
  const languageCode = req.body.languageCode || 'en-US';

  try {
    const audioBuffer = fs.readFileSync(audioFilePath); // Fix variable name
    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
      audio: { content: audioBuffer.toString('base64') },
      config: {
        encoding,
        sampleRateHertz,
        languageCode,
      },
    };
    const responseArr = await speechClient.recognize(request);
    const response = responseArr[0] as protos.google.cloud.speech.v1.IRecognizeResponse;
    const transcripts = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript)
      ?.filter(Boolean);
    const transcription = transcripts?.join('\n') || '';

    fs.unlinkSync(audioFilePath);
    res.json({ transcription });
  } catch (error: any) {
    console.error('ERROR:', error);
    if (fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath);
    }
    res.status(500).json({ message: 'Speech-to-Text failed.', error: error.message });
  }
}

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