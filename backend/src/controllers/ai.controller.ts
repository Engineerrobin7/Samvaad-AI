import { Request, Response } from 'express';
import OpenAI from 'openai';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { pool } from '../db/pool';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// In-memory store for conversation history
const conversationStore: { [key: string]: any } = {};

const FALLBACK_PHRASE = "I'm sorry, but I cannot assist with that.";

// Multilingual Chat Endpoint (OpenAI)
export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { messages, language, conversationId } = req.body;
    const userId = (req as any).user?.id;
    const systemPrompt = `You are a helpful multilingual assistant. Reply in ${language}. If you cannot answer, say '${FALLBACK_PHRASE}'`;

    let history = conversationStore[conversationId] || [{ role: 'system', content: systemPrompt }];

    history = [...history, ...messages];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: history,
    });

    const reply = completion.choices[0].message?.content;
    history.push({ role: 'assistant', content: reply });
    conversationStore[conversationId] = history;

    // Log conversation
    if (reply) {
      await pool.query(
        'INSERT INTO ai_conversation_logs (conversation_id, user_id, model, message, reply, language) VALUES ($1, $2, $3, $4, $5, $6)',
        [conversationId, userId, 'openai', messages[messages.length - 1].content, reply, language]
      );
    }

    // Human fallback
    if (!reply || reply.includes(FALLBACK_PHRASE)) {
      await pool.query('INSERT INTO human_escalations (conversation_id) VALUES ($1)', [conversationId]);
    }

    res.json({ reply, conversationId });
  } catch (error) {
    res.status(500).json({ error: 'AI chat failed', details: error });
  }
};

// Multilingual Chat Endpoint (Gemini)
export const chatWithGemini = async (req: Request, res: Response) => {
  try {
    const { messages, language, conversationId } = req.body;
    const userId = (req as any).user?.id;
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const systemPrompt = `You are a helpful multilingual assistant. Reply in ${language}. If you cannot answer, say '${FALLBACK_PHRASE}'`;

    let chat: ChatSession;
    if (conversationStore[conversationId]) {
      chat = conversationStore[conversationId];
    } else {
      chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "Okay, I will act as a multilingual assistant." }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 100,
        },
      });
      conversationStore[conversationId] = chat;
    }

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    // Log conversation
    await pool.query(
      'INSERT INTO ai_conversation_logs (conversation_id, user_id, model, message, reply, language) VALUES ($1, $2, $3, $4, $5, $6)',
      [conversationId, userId, 'gemini', lastMessage, text, language]
    );

    // Human fallback
    if (!text || text.includes(FALLBACK_PHRASE)) {
      await pool.query('INSERT INTO human_escalations (conversation_id) VALUES ($1)', [conversationId]);
    }

    res.json({ reply: text, conversationId });
  } catch (error) {
    res.status(500).json({ error: 'Gemini chat failed', details: error });
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
