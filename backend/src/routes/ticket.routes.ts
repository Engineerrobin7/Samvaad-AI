// src/routes/ticket.routes.ts
import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';

const router = Router();

router.post('/', ticketController.createTicket);
router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.patch('/:id/status', ticketController.updateTicketStatus);

export default router;
