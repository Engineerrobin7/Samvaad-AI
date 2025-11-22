// Voice translation service using Google Cloud Speech & Text-to-Speech
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import { promises as fs } from 'fs';
import path from 'path';
import { aiService } from './ai.service';

interface VoiceTranslationResult {
  originalText: string;
  translatedText: string;
  audioUrl: string;
  sourceLanguage: string;
  targetLanguage: string;
}

class VoiceService {
  private speechClient: speech.SpeechClient;
  private ttsClient: textToSpeech.TextToSpeechClient;

  constructor() {
    // Initialize clients with credentials from environment
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS 
      ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
      : undefined;

    this.speechClient = new speech.SpeechClient(credentials ? { credentials } : {});
    this.ttsClient = new textToSpeech.TextToSpeechClient(credentials ? { credentials } : {});
  }

  /**
   * Convert speech to text
   */
  async speechToText(audioFilePath: string, languageCode: string = 'en-US'): Promise<string> {
    try {
      const audioBytes = await fs.readFile(audioFilePath);

      const request = {
        audio: { content: audioBytes.toString('base64') },
        config: {
          encoding: 'LINEAR16' as const,
          sampleRateHertz: 16000,
          languageCode,
          alternativeLanguageCodes: ['hi-IN', 'bn-IN', 'te-IN', 'ta-IN', 'mr-IN'],
          enableAutomaticPunctuation: true,
        },
      };

      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        ?.map(result => result.alternatives?.[0]?.transcript)
        .join('\n') || '';

      return transcription;
    } catch (error) {
      console.error('Speech to text error:', error);
      throw new Error('Failed to convert speech to text');
    }
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(
    text: string, 
    languageCode: string = 'en-US',
    voiceGender: 'MALE' | 'FEMALE' = 'FEMALE'
  ): Promise<Buffer> {
    try {
      const request = {
        input: { text },
        voice: {
          languageCode,
          ssmlGender: voiceGender as any,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 1.0,
          pitch: 0.0,
        },
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      return response.audioContent as Buffer;
    } catch (error) {
      console.error('Text to speech error:', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  /**
   * Full voice translation pipeline
   */
  async translateVoice(
    audioFilePath: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<VoiceTranslationResult> {
    try {
      // Step 1: Convert speech to text
      const originalText = await this.speechToText(audioFilePath, this.getLanguageCode(sourceLanguage));

      // Step 2: Translate text
      const translation = await aiService.translateText(
        originalText,
        sourceLanguage,
        targetLanguage,
        'neutral'
      );

      // Step 3: Convert translated text to speech
      const audioBuffer = await this.textToSpeech(
        translation.translation,
        this.getLanguageCode(targetLanguage)
      );

      // Step 4: Save audio file
      const outputFileName = `translated_${Date.now()}.mp3`;
      const outputPath = path.join(__dirname, '../../uploads/audio', outputFileName);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, audioBuffer);

      return {
        originalText,
        translatedText: translation.translation,
        audioUrl: `/uploads/audio/${outputFileName}`,
        sourceLanguage,
        targetLanguage,
      };
    } catch (error) {
      console.error('Voice translation error:', error);
      throw new Error('Voice translation failed');
    }
  }

  /**
   * Get pronunciation guide
   */
  async getPronunciationGuide(text: string, language: string): Promise<string> {
    const languageCode = this.getLanguageCode(language);
    
    // Generate SSML with phonetic pronunciation
    const ssml = `<speak><phoneme alphabet="ipa" ph="">${text}</phoneme></speak>`;
    
    return `Pronunciation guide for "${text}" in ${language}`;
  }

  /**
   * Map language codes to Google Cloud format
   */
  private getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
    };

    return languageMap[language] || 'en-US';
  }
}

export const voiceService = new VoiceService();
