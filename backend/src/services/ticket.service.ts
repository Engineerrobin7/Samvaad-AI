// src/services/ticket.service.ts
import { PrismaClient, TicketStatus } from '../../generated/prisma';

const prisma = new PrismaClient();

class TicketService {
  /**
   * Create a new ticket
   */
  async createTicket(userProfileId: string, subject: string, description: string) {
    const newTicket = await prisma.ticket.create({
      data: {
        userProfileId,
        subject,
        description,
      },
    });
    console.log(`[NOTIFICATION] New ticket created: ${newTicket.id} - Subject: ${newTicket.subject}`);
    // In a real application, this would trigger a more robust notification (e.g., email, Socket.IO event)
    return newTicket;
  }

  /**
   * Get a ticket by its ID
   */
  async getTicketById(ticketId: string) {
    return prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { userProfile: true },
    });
  }

  /**
   * Get all tickets
   */
  async getAllTickets() {
    return prisma.ticket.findMany({
      include: { userProfile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update the status of a ticket
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    return prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
  }
}

export const ticketService = new TicketService();
