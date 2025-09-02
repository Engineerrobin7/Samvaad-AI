import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Multilingual Chat Endpoint
export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { messages, language } = req.body;
    const systemPrompt = `You are a helpful multilingual assistant. Reply in ${language}.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    res.json({ reply: completion.choices[0].message?.content });
  } catch (error) {
    res.status(500).json({ error: 'AI chat failed', details: error });
  }
};

// Translation Endpoint
export const translateWithAI = async (req: Request, res: Response) => {
  try {
    const { text, from, to } = req.body;
    const prompt = `Translate the following text from ${from} to ${to}: "${text}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ translation: completion.choices[0].message?.content });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed', details: error });
  }
};