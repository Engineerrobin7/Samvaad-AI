// src/controllers/ticket.controller.ts
import { Request, Response } from 'express';
import { ticketService } from '../services/ticket.service';
import { TicketStatus } from '../../generated/prisma';

class TicketController {
  /**
   * Create a new ticket
   */
  async createTicket(req: Request, res: Response) {
    const { userProfileId, subject, description } = req.body;
    if (!userProfileId || !subject || !description) {
      return res.status(400).json({ error: 'userProfileId, subject, and description are required.' });
    }
    try {
      const ticket = await ticketService.createTicket(userProfileId, subject, description);
      res.status(201).json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create ticket.' });
    }
  }

  /**
   * Get all tickets
   */
  async getAllTickets(req: Request, res: Response) {
    try {
      const tickets = await ticketService.getAllTickets();
      res.json(tickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to get tickets.' });
    }
  }

  /**
   * Get a ticket by its ID
   */
  async getTicketById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const ticket = await ticketService.getTicketById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found.' });
      }
      res.json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to get ticket.' });
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !Object.values(TicketStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    try {
      const ticket = await ticketService.updateTicketStatus(id, status);
      res.json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update ticket status.' });
    }
  }
}

export const ticketController = new TicketController();
