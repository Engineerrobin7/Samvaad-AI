// src/controllers/widget.controller.ts
import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';

class WidgetController {
  /**
   * Handle chat messages from the web widget
   */
  async chat(req: Request, res: Response) {
    const { message, conversationId, language } = req.body;

    if (!message || !conversationId || !language) {
      return res.status(400).json({ error: 'Message, conversationId, and language are required.' });
    }

    try {
      const response = await aiService.chatWithAI({ conversationId, language }, [{ role: 'user', content: message }]);
      res.json({ response });
    } catch (error) {
      console.error('Widget chat error:', error);
      res.status(500).json({ error: 'Failed to process chat message.' });
    }
  }
}

export const widgetController = new WidgetController();
