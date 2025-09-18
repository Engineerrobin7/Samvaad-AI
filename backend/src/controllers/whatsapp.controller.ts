// src/controllers/whatsapp.controller.ts
import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

class WhatsappController {
  /**
   * Webhook verification for WhatsApp
   */
  async verifyWebhook(req: Request, res: Response) {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully!');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  }

  /**
   * Handle incoming WhatsApp messages
   */
  async handleMessage(req: Request, res: Response) {
    const body = req.body;

    // Check if the webhook is a WhatsApp message event
    if (body.object === 'whatsapp_business_account') {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = body.entry[0].changes[0].value.contacts[0].wa_id; // User's WhatsApp ID
        const text = message.text.body; // Incoming message text

        console.log(`Received message from ${from}: ${text}`);

        try {
          // Generate AI response
          const aiResponse = await aiService.chatWithAI(
            { conversationId: from, language: 'en' }, // Use WhatsApp ID as conversation ID
            [{ role: 'user', content: text }]
          );

          // Send response back to WhatsApp
          await axios.post(
            `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: 'whatsapp',
              to: from,
              type: 'text',
              text: { body: aiResponse },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              },
            }
          );

          res.sendStatus(200);
        } catch (error) {
          console.error('Error processing WhatsApp message:', error);
          res.sendStatus(500);
        }
      } else {
        // Handle other webhook events (e.g., status updates)
        res.sendStatus(200);
      }
    } else {
      // Not a WhatsApp webhook event
      res.sendStatus(404);
    }
  }
}

export const whatsappController = new WhatsappController();
