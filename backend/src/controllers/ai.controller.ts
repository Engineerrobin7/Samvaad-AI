import { Request, Response } from 'express';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { pool } from '../db/pool';
import multer from 'multer';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const conversationStore: { [key: string]: ChatSession } = {};
const FALLBACK_PHRASE = "I'm sorry, I cannot assist with that request.";

// Multer setup for image uploads
const upload = multer({ dest: 'uploads/' });

export const aiController = {
  // Multilingual Chat Endpoint (Gemini)
  async chatWithGemini(req: Request, res: Response) {
    try {
      const { messages, language, conversationId } = req.body;
      const userId = (req as any).user?.id;
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const systemPrompt = `You are Samvaad AI, a helpful and culturally-aware multilingual assistant. Your primary goal is to facilitate clear and respectful communication. Your current user is speaking ${language}. Respond in ${language}. If a question is inappropriate, harmful, or something you cannot answer, you must respond with ONLY this exact phrase: '${FALLBACK_PHRASE}'`;

      let chat: ChatSession;
      if (conversationStore[conversationId]) {
        chat = conversationStore[conversationId];
      } else {
        chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: `Okay, I will act as a culturally-aware assistant and reply in ${language}.` }] },
          ],
        });
        conversationStore[conversationId] = chat;
      }

      const lastMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessage(lastMessage);
      const text = result.response.text();

      // Log conversation
      await pool.query(
        'INSERT INTO ai_conversation_logs (conversation_id, user_id, model, message, reply, language) VALUES ($1, $2, $3, $4, $5, $6)',
        [conversationId, userId, 'gemini-pro', lastMessage, text, language]
      );

      res.json({ reply: text, conversationId });
    } catch (error) {
      console.error('Gemini chat error:', error);
      res.status(500).json({ error: 'Gemini chat failed', details: error });
    }
  },

  // Translation with Cultural Context Endpoint (Gemini)
  async translateWithGemini(req: Request, res: Response) {
    try {
      const { text, from, to, formality } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
        You are an expert translator specializing in Indian languages with deep cultural understanding.
        Translate the following text from "${from}" to "${to}".
        The desired formality level is "${formality}".
        
        Text to translate: "${text}"

        Your response must be a JSON object with two keys:
        1.  "translation": The translated text.
        2.  "culturalContext": A brief, helpful cultural tip or context related to the translation, the language, or the situation. If no specific context applies, provide a general tip about the target language "${to}".
        
        Example response for a formal Hindi translation:
        {
          "translation": "नमस्ते, आप कैसे हैं?",
          "culturalContext": "In Hindi, 'आप' (aap) is the formal way to say 'you', used for showing respect to elders, strangers, or in professional settings. 'तुम' (tum) is informal."
        }

        Do not include any other text or formatting outside of the JSON object.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean and parse the JSON response
      const jsonResponse = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
      
      res.json(jsonResponse);

    } catch (error) {
      console.error('Gemini translation error:', error);
      res.status(500).json({ error: 'Translation failed', details: error });
    }
  },

  // Image-to-Text Translation (Gemini Vision)
  async translateImage(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
      const { to, formality } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      const imagePath = req.file.path;
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
      
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: req.file.mimetype,
        },
      };

      const prompt = `
        You are an expert multilingual translator with vision capabilities.
        First, extract all text from the provided image.
        Then, translate the extracted text into the language: "${to}".
        The desired formality level is "${formality}".

        Your response must be a JSON object with three keys:
        1. "extractedText": The text you extracted from the image.
        2. "translation": The translated text.
        3. "culturalContext": A brief cultural tip related to the translation or the target language "${to}".

        If there is no text in the image, return an error message in the "extractedText" field.
      `;
      
      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();
      const jsonResponse = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

      // Clean up the uploaded file
      fs.unlinkSync(imagePath);

      res.json(jsonResponse);

    } catch (error) {
      console.error('Gemini image translation error:', error);
      res.status(500).json({ error: 'Image translation failed', details: error });
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
    }
  },

  uploadImage: upload.single('image'),
};