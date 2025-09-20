// src/controllers/telegram.controller.ts
import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { analyticsService } from '../services/analytics.service';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

class TelegramController {
  /**
   * Handle incoming Telegram messages
   */
  async handleUpdate(req: Request, res: Response) {
    const { message } = req.body;

    if (!message || !message.text || !message.chat || !message.chat.id) {
      return res.status(200).send('Not a valid message');
    }

    const chatId = message.chat.id;
    const text = message.text;

    console.log(`Received message from Telegram chat ${chatId}: ${text}`);

    try {
      // Generate AI response
      const aiResponse = await aiService.chatWithAI(
        { conversationId: chatId.toString(), language: 'en' }, // Use chat ID as conversation ID
        [{ role: 'user', content: text }]
      );

      // Log the conversation
      // userProfileId is null for Telegram as it's not authenticated via Clerk
      await analyticsService.logConversation(null, chatId, 'telegram', text, aiResponse.reply);

      // Send response back to Telegram
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: chatId,
          text: aiResponse,
        }
      );

      res.sendStatus(200);
    } catch (error) {
      console.error('Error processing Telegram message:', error);
      res.sendStatus(500);
    }
  }
}

export const telegramController = new TelegramController();