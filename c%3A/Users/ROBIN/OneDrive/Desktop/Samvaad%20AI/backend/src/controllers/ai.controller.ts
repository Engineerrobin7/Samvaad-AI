// ... existing code ...
import { Request, Response } from 'express';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
// ... existing code ...
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Multilingual Chat Endpoint
export const chatWithAI = async (req: Request, res: Response) => {
// ... existing code ...
// ... existing code ...
  } catch (error) {
    res.status(500).json({ error: 'Translation failed', details: error });
  }
};

// Gemini Chat Endpoint
export const chatWithGemini = async (req: Request, res: Response) => {
  try {
    const { history, message } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    res.status(500).json({ error: 'Gemini chat failed', details: error });
  }
};